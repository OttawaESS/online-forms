import crypto from 'crypto';
import { list, put } from '@vercel/blob';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import fs from 'fs/promises';
import { jsPDF } from 'jspdf';
import fsSync from 'fs';
import path from 'path';
import imageSize from 'image-size';
import nodemailer from 'nodemailer';

function isBlobAccessMismatchError(err) {
  const message = String(err?.message || '');
  return message.includes('Cannot use public access on a private store') || message.includes('Cannot use private access on a public store');
}

function isAccessOptionCompatibilityError(err) {
  const message = String(err?.message || '');
  return message.includes('access must be "public"');
}

function isBlobStoreNotFoundError(err) {
  return err?.name === 'BlobStoreNotFoundError' || String(err?.message || '').includes('This store does not exist');
}

export async function putWithStoreAccess(pathname, body, options = {}) {
  const { access: _ignoredAccess, ...rest } = options;
  const putOptions = { ...rest, access: 'public' };

  try {
    return await put(pathname, body, putOptions);
  } catch (err) {
    if (isBlobStoreNotFoundError(err)) {
      throw new Error(
        'Vercel Blob store not found. Regenerate BLOB_READ_WRITE_TOKEN from an existing Blob store (Storage > Blob) and update this project env var, then redeploy.'
      );
    }

    if (isAccessOptionCompatibilityError(err)) {
      return put(pathname, body, { ...rest, access: 'public' });
    }

    if (!isBlobAccessMismatchError(err)) {
      throw err;
    }

    throw new Error(
      'Vercel Blob store/token access mismatch. This app requires a public Blob store. Update BLOB_READ_WRITE_TOKEN to a token from a public store.'
    );
  }
}

export async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function parseFormBody(req) {
  const contentType = req.headers['content-type'] || '';
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  } else if (contentType.includes('multipart/form-data')) {
    // Simple multipart parser for form data
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) return {};
    const parts = raw.split(`--${boundary}`);
    const result = {};
    for (const part of parts) {
      if (part.trim() && !part.includes('--')) {
        const lines = part.split('\r\n');
        const nameMatch = lines[1]?.match(/name="([^"]+)"/);
        if (nameMatch) {
          const name = nameMatch[1];
          const value = lines.slice(3).join('\r\n').trim();
          result[name] = value;
        }
      }
    }
    return result;
  }

  return {};
}

export function getCookies(req) {
  return parseCookie(req.headers.cookie || '');
}

export function setCookie(res, name, value, options = {}) {
  const serialized = serializeCookie(name, value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    ...options
  });
  res.setHeader('Set-Cookie', serialized);
}

export function clearCookie(res, name) {
  const serialized = serializeCookie(name, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
  res.setHeader('Set-Cookie', serialized);
}

export function signToken(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token, secret) {
  if (!token) return null;
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) return null;
  const data = `${header}.${body}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  if (expected !== signature) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export function requireAdmin(req, res) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const cookies = getCookies(req);
  const payload = verifyToken(cookies.admin_token, secret);
  if (!payload || !payload.exp || Date.now() > payload.exp) return false;
  return true;
}

const EQUIPMENT_LOAN_TYPE = 'equipment-loan';
const EXPENSE_TYPE = 'expense';

function getSubmissionType(submission = {}, pathname = '') {
  if (submission?.type === EQUIPMENT_LOAN_TYPE) return EQUIPMENT_LOAN_TYPE;
  if (pathname.startsWith(`${EQUIPMENT_LOAN_TYPE}/`)) return EQUIPMENT_LOAN_TYPE;
  return EXPENSE_TYPE;
}

function getSubmissionBlobPath(submissionId, type) {
  if (!submissionId) return '';
  return `${type}/submission-${submissionId}.json`;
}

function toCompactJson(value) {
  return JSON.stringify(value);
}

function normalizeSubmissionForStorage(submission) {
  const type = getSubmissionType(submission);
  const normalized = { ...submission };

  if (type === EQUIPMENT_LOAN_TYPE) {
    normalized.type = EQUIPMENT_LOAN_TYPE;

    if (
      Array.isArray(normalized.equipmentItems) &&
      Array.isArray(normalized.items) &&
      normalized.equipmentItems.length === normalized.items.length
    ) {
      delete normalized.items;
    }
  } else {
    delete normalized.type;
  }

  return { type, normalized };
}

// Metadata-only version for listing (avoids loading full submission data)
export async function loadSubmissionsMetadata(limit = 50, offset = 0) {
  const submissions = await loadSubmissions();
  return submissions.slice(offset, offset + limit).map(createMetadata);
}

// Load full submission data by ID
export async function loadSubmission(submissionId) {
  try {
    const { blobs } = await list();
    const submissionBlob =
      blobs.find((b) => b.pathname === getSubmissionBlobPath(submissionId, EXPENSE_TYPE)) ||
      blobs.find((b) => b.pathname === getSubmissionBlobPath(submissionId, EQUIPMENT_LOAN_TYPE)) ||
      blobs.find((b) => b.pathname === `submission-${submissionId}.json`);

    if (!submissionBlob) return null;

    const response = await fetch(submissionBlob.downloadUrl || submissionBlob.url);
    if (!response.ok) return null;

    const submission = await response.json();
    const type = getSubmissionType(submission, submissionBlob.pathname);
    return type === EQUIPMENT_LOAN_TYPE ? { ...submission, type } : submission;
  } catch (err) {
    console.error(`Error loading submission ${submissionId}:`, err);
    return null;
  }
}

// Create metadata object (summary info for listing, more fields for display)
function createMetadata(submission) {
  const total = submission.total || (submission.items ?
    submission.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) : 0);

  return {
    id: submission.id,
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    date: submission.date,
    total: total,
    timestamp: submission.timestamp,
    itemCount: submission.items ? submission.items.length : 0,
    hasReceipts: submission.items ? submission.items.some(item => item.receipts && item.receipts.length > 0) : false,
    signature: submission.signature,
    signatureDate: submission.signatureDate,
    officers: submission.officers
  };
}

// Migrate from old single-file system to new system
async function migrateToNewSystem(submissions) {

  for (const submission of submissions) {
    const submissionId = submission.id;
    const { type, normalized } = normalizeSubmissionForStorage(submission);
    const pathname = getSubmissionBlobPath(submissionId, type);

    try {
      await putWithStoreAccess(pathname, toCompactJson(normalized), {
        contentType: 'application/json'
      });
    } catch (err) {
      console.error(`Failed to migrate submission ${submissionId}:`, err);
    }
  }

}

export async function saveSubmission(submission) {
  try {
    const submissionId = submission.id;
    const { type, normalized } = normalizeSubmissionForStorage(submission);
    const pathname = getSubmissionBlobPath(submissionId, type);

    // Save the full submission
    await putWithStoreAccess(pathname, toCompactJson(normalized), {
      contentType: 'application/json'
    });

  } catch (err) {
    console.error('Error saving submission:', err);
    throw err;
  }
}

// Load all submissions by scanning blobs
export async function loadSubmissions() {
  try {
    const { blobs } = await list();

    // Find all submission blobs (new typed paths + legacy flat paths)
    const submissionBlobs = blobs.filter((b) =>
      b.pathname.endsWith('.json') && (
        b.pathname.startsWith(`${EXPENSE_TYPE}/submission-`) ||
        b.pathname.startsWith(`${EQUIPMENT_LOAN_TYPE}/submission-`) ||
        b.pathname.startsWith('submission-')
      )
    );

    const submissions = [];
    for (const blob of submissionBlobs) {
      try {
        const submissionResponse = await fetch(blob.downloadUrl || blob.url);
        if (!submissionResponse.ok) {
          console.warn(`Failed to fetch submission blob: ${blob.pathname}`);
          continue;
        }

        const submission = await submissionResponse.json();
        const type = getSubmissionType(submission, blob.pathname);
        submissions.push(type === EQUIPMENT_LOAN_TYPE ? { ...submission, type } : submission);
      } catch (err) {
        console.error(`Error loading submission from ${blob.pathname}:`, err);
      }
    }

    // Sort by timestamp, most recent first
    submissions.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    return submissions;
  } catch (err) {
    console.error('Error loading submissions:', err);
    return [];
  }
}

export async function saveSubmissions(submissions) {
  try {
    const jsonString = toCompactJson(submissions);

    const result = await putWithStoreAccess('submissions.json', jsonString, {
      contentType: 'application/json'
    });

  } catch (err) {
    console.error('Blob storage error:', err);
    throw err; // Re-throw so submit.js knows it failed
  }

  // Also save to local file for development
  try {
    await fs.writeFile('./submissions.json', toCompactJson(submissions));
  } catch (err) {
    // Local file write is optional, don't fail if it errors
    console.error('Failed to save submissions to local file:', err);
  }
}

// Load a specific submission by ID
export async function loadSubmissionById(id) {
  try {
    const { blobs } = await list();
    const submissionBlob =
      blobs.find((b) => b.pathname === getSubmissionBlobPath(id, EXPENSE_TYPE)) ||
      blobs.find((b) => b.pathname === getSubmissionBlobPath(id, EQUIPMENT_LOAN_TYPE)) ||
      blobs.find((b) => b.pathname === `submission-${id}.json`);

    if (!submissionBlob) {
      return null;
    }

    const submissionResponse = await fetch(submissionBlob.downloadUrl || submissionBlob.url);
    if (!submissionResponse.ok) {
      console.warn(`Failed to fetch submission blob: ${submissionBlob.pathname}`);
      return null;
    }

    const submission = await submissionResponse.json();
    const type = getSubmissionType(submission, submissionBlob.pathname);
    return type === EQUIPMENT_LOAN_TYPE ? { ...submission, type } : submission;
  } catch (err) {
    console.error('Error loading submission by ID:', id, err);
    return null;
  }
}

export async function sendEmail(to, subject, html, cc = null) {
  try {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    // Check if we're using Gmail SMTP with Google Workspace
    const isGmailSmtp = (process.env.SMTP_HOST || 'smtp.gmail.com').includes('gmail.com');
    const isFromGmailOrWorkspace = fromAddress && (fromAddress.includes('@gmail.com') || fromAddress.includes('@uottawaess.ca'));

    if (isGmailSmtp && !isFromGmailOrWorkspace) {
      console.error('ERROR: Cannot send from this address using Gmail SMTP');
      console.error('SMTP_FROM:', fromAddress, 'is not a Gmail or Google Workspace address');
      console.error('For Google Workspace, use your full @uottawaess.ca email as SMTP_USER');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Add connection timeout and better error handling
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: true,
      logger: true
    });

    const mailOptions = {
      from: fromAddress,
      to: to,
      subject: subject,
      html: html
    };

    if (cc) {
      mailOptions.cc = cc;
    }

    // Test the connection first
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError.message);
      return false;
    }

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    return false;
  }
}