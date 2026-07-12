import crypto from 'crypto';
import { saveSubmission, parseJsonBody, sendEmail } from './_utils.js';

const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const REQUIRED_STAFF_ATTENDEES = [
  'internal@uottawaess.ca',
  'operations@uottawaess.ca',
  'admin@uottawaess.ca',
];
const EQUIPMENT_NOTIFICATION_CC_RECIPIENTS = [
  'admin@uottawaess.ca',
  'vpfa@uottawaess.ca',
  'financecomm@uottawaess.ca',
  'internal@uottawaess.ca',
  'printing@uottawaess.ca',
  'merch@uottawaess.ca',
  'operations@uottawaess.ca'
];

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createGoogleJwtAssertion(serviceAccountEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/calendar.events',
    aud: GOOGLE_OAUTH_TOKEN_URL,
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signingInput = `${encodedHeader}.${encodedClaimSet}`;

  const signature = crypto
    .sign('RSA-SHA256', Buffer.from(signingInput), privateKey)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signingInput}.${signature}`;
}

async function getGoogleCalendarAccessToken() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!serviceAccountEmail || !rawPrivateKey) {
    throw new Error('Missing Google service account env vars');
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
  const assertion = createGoogleJwtAssertion(serviceAccountEmail, privateKey);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });

  const tokenResponse = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new Error(`Google token request failed: ${tokenResponse.status} ${errorBody}`);
  }

  const tokenPayload = await tokenResponse.json();
  return tokenPayload.access_token;
}

function buildEquipmentSummary(equipmentItems) {
  if (!Array.isArray(equipmentItems) || equipmentItems.length === 0) {
    return 'No equipment selected';
  }

  return equipmentItems
    .filter((item) => Number(item.quantity || 0) > 0)
    .map((item) => `${item.description || 'Item'} x${Number(item.quantity || 0)}`)
    .join(', ');
}

function buildEventDateTime(date, time, timeZone) {
  if (!date) return null;
  const normalizedTime = time || '09:00';
  return {
    dateTime: `${date}T${normalizedTime}:00`,
    timeZone
  };
}

function buildLoanDateTime(date, time, defaultTime) {
  if (!date) return null;
  const normalizedTime = time || defaultTime;
  const dateTime = new Date(`${date}T${normalizedTime}:00`);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
}

function hasValidLoanDateRange(payload) {
  const startDate = payload.startDate || payload.date;
  const endDate = payload.endDate || startDate;
  const startDateTime = buildLoanDateTime(startDate, payload.pickupTime, '09:00');
  const endDateTime = buildLoanDateTime(endDate, payload.dropoffTime, '17:00');

  if (!startDateTime || !endDateTime) {
    return false;
  }

  return endDateTime > startDateTime;
}

async function createSharedCalendarEvent(payload, equipmentItems, submissionId) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const appsScriptWebhookUrl = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;
  const timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Toronto';
  const start = buildEventDateTime(payload.startDate || payload.date, payload.pickupTime, timeZone);
  const end = buildEventDateTime(payload.endDate || payload.startDate || payload.date, payload.dropoffTime || '17:00', timeZone);

  if (!start || !end) {
    throw new Error('Missing start or end date for calendar event');
  }

  const organizationName = payload.organization === 'Other' ? (payload.otherOrganization || 'Other') : (payload.organization || 'Unknown Organization');
  const borrowerName = payload.fullName || payload.name || 'Borrower';
  const onCampusBilingual = payload.onCampus === 'yes' ? 'Oui / Yes' : payload.onCampus === 'no' ? 'Non / No' : 'N/A';
  const onSiteAssistanceBilingual = payload.needsOnSiteAssistance === 'yes' ? 'Oui / Yes' : payload.needsOnSiteAssistance === 'no' ? 'Non / No' : 'N/A';
  const locationBilingual = payload.onCampus === 'yes' ? 'Sur le campus / On campus' : payload.onCampus === 'no' ? 'Hors campus / Off campus' : 'N/A';
  const borrowerEmail = payload.email || '';
  const requiredAttendeeEmails = Array.from(
    new Set([
      ...REQUIRED_STAFF_ATTENDEES,
      borrowerEmail
    ])
  ).filter(Boolean);
  const optionalAttendeeEmails = EQUIPMENT_NOTIFICATION_CC_RECIPIENTS
    .filter((email) => !requiredAttendeeEmails.includes(email));
  const attendees = [
    ...requiredAttendeeEmails.map((email) => ({ email, optional: false })),
    ...optionalAttendeeEmails.map((email) => ({ email, optional: true }))
  ];

  const eventPayload = {
    summary: `[Prêt d'équipement / Equipment Loan] ${organizationName}`,
    description: [
      `ID de soumission / Submission ID: ${submissionId}`,
      `Emprunteur / Borrower: ${borrowerName}`,
      `Courriel / Email: ${payload.email || 'N/A'}`,
      `Téléphone / Phone: ${payload.phone || 'N/A'}`,
      `Organisation / Organization: ${organizationName}`,
      `Lieu d'utilisation / Usage location: ${onCampusBilingual}`,
      `Assistance sur place / On-Site Assistance: ${onSiteAssistanceBilingual}`,
      `Utilisation / Usage: ${payload.equipmentUsage || 'N/A'}`,
      `Équipement / Equipment: ${buildEquipmentSummary(equipmentItems)}`,
      `Commentaires / Comments: ${payload.finalComments || 'N/A'}`
    ].join('\n'),
    start,
    end,
    location: locationBilingual,
    attendees,
    extendedProperties: {
      private: {
        submissionId,
        submissionType: 'equipment-loan'
      }
    }
  };

  if (appsScriptWebhookUrl) {
    const webhookResponse = await fetch(appsScriptWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        calendarId,
        sendUpdates: 'all',
        event: eventPayload
      })
    });

    if (!webhookResponse.ok) {
      const errorBody = await webhookResponse.text();
      throw new Error(`Apps Script webhook calendar sync failed: ${webhookResponse.status} ${errorBody}`);
    }

    // Accept arbitrary JSON shape from webhook while preserving link if provided.
    const responseText = await webhookResponse.text();
    if (!responseText) {
      return { htmlLink: null };
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return { htmlLink: null };
    }
  }

  if (!calendarId) {
    throw new Error('Missing GOOGLE_CALENDAR_ID env var');
  }

  const accessToken = await getGoogleCalendarAccessToken();

  const createResponse = await fetch(`${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventPayload)
  });

  if (!createResponse.ok) {
    const errorBody = await createResponse.text();
    throw new Error(`Google Calendar event creation failed: ${createResponse.status} ${errorBody}`);
  }

  return createResponse.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const body = await parseJsonBody(req);
    const submissionId = crypto.randomUUID();

    const equipmentItems = Array.isArray(body.equipmentItems)
      ? body.equipmentItems.map((item) => ({
          description: item?.description || '',
          quantity: Number(item?.quantity || 0),
          amount: 0,
          receipts: []
        }))
      : [];

    const payload = {
      ...body,
      id: submissionId,
      type: 'equipment-loan',
      name: body.fullName || body.name || '',
      email: body.email || '',
      date: body.startDate || body.date || '',
      equipmentItems,
      timestamp: new Date().toISOString()
    };

    if (!hasValidLoanDateRange(payload)) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 400;
      return res.end(JSON.stringify({
        error: 'Invalid loan date/time range',
        code: 'INVALID_TIME_RANGE'
      }));
    }

    await saveSubmission(payload);

    let calendarEventResult = null;
    try {
      calendarEventResult = await createSharedCalendarEvent(payload, equipmentItems, submissionId);
    } catch (calendarErr) {
      // Calendar sync should not block form submission persistence.
      console.error('Google Calendar sync failed for equipment submission:', calendarErr);
    }

    const borrowerName = payload.fullName || payload.name || 'Borrower';
    const borrowerEmail = payload.email;
    const selectedItemsHtml = equipmentItems.length > 0
      ? equipmentItems
          .map((item) => `<li><strong>${item.description || 'Item'}</strong>: ${Number(item.quantity || 0)}</li>`)
          .join('')
      : '<li>No equipment selected</li>';

    const submitterEmailHtml = `
      <h2>Demande de prêt d'équipement soumise / Equipment Loan Request Submitted</h2>

      <p>Cher(ère) ${borrowerName},</p>
      <p>Votre demande de prêt d'équipement a été soumise avec succès.</p>
      <p><strong>Détails de la demande:</strong></p>
      <ul>
        <li><strong>ID de la demande:</strong> ${submissionId}</li>
        <li><strong>Organisation:</strong> ${payload.organization || 'N/A'}</li>
        <li><strong>Date de début:</strong> ${payload.startDate || payload.date || 'N/A'}</li>
        <li><strong>Date de fin:</strong> ${payload.endDate || 'N/A'}</li>
        <li><strong>Heure de ramassage:</strong> ${payload.pickupTime || 'N/A'}</li>
        <li><strong>Heure de dépôt:</strong> ${payload.dropoffTime || 'N/A'}</li>
        <li><strong>Utilisation:</strong> ${payload.equipmentUsage || 'N/A'}</li>
      </ul>
      <p><strong>Équipement demandé:</strong></p>
      <ul>${selectedItemsHtml}</ul>
      <p><strong>Procédure opérationnelle standard pour l'équipement:</strong> <a href="https://docs.google.com/document/d/1DIWm48rJwUKE8kA478f9o84BgBrrskJF1u9XuFjAi8A/edit?tab=t.0">Consultez la procédure opérationnelle standard pour l'équipement ici</a></p>
      <p>Notre équipe examinera votre demande et vous contactera si nécessaire.</p>
      <p>Si vous avez des questions, veuillez contacter merch@uottawaess.ca.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 2px solid #ccc;">

      <p>Dear ${borrowerName},</p>
      <p>Your equipment loan request has been submitted successfully.</p>
      <p><strong>Request Details:</strong></p>
      <ul>
        <li><strong>Request ID:</strong> ${submissionId}</li>
        <li><strong>Organization:</strong> ${payload.organization || 'N/A'}</li>
        <li><strong>Start Date:</strong> ${payload.startDate || payload.date || 'N/A'}</li>
        <li><strong>End Date:</strong> ${payload.endDate || 'N/A'}</li>
        <li><strong>Pickup Time:</strong> ${payload.pickupTime || 'N/A'}</li>
        <li><strong>Dropoff Time:</strong> ${payload.dropoffTime || 'N/A'}</li>
        <li><strong>Usage:</strong> ${payload.equipmentUsage || 'N/A'}</li>
      </ul>
      <p><strong>Requested Equipment:</strong></p>
      <ul>${selectedItemsHtml}</ul>
      <p><strong>Standard Operating Procedure for Audio-Visual Equipment:</strong> <a href="https://docs.google.com/document/d/1DIWm48rJwUKE8kA478f9o84BgBrrskJF1u9XuFjAi8A/edit?tab=t.0">View the Standard Operating Procedure for Equipment here</a></p>
      <p>Our team will review your request and contact you if needed.</p>
      <p>If you have any questions, please contact merch@uottawaess.ca.</p>
    `;

    const emailPromises = [];
    if (borrowerEmail) {
      emailPromises.push(
        sendEmail(
          borrowerEmail,
          'Confirmation de demande de prêt d\'équipement / Equipment Loan Request Confirmation',
          submitterEmailHtml,
          EQUIPMENT_NOTIFICATION_CC_RECIPIENTS.join(', ')
        )
      );
    }

    const emailResults = await Promise.allSettled(emailPromises);
    const failedEmails = emailResults.filter(
      (result) => result.status === 'rejected' || (result.status === 'fulfilled' && result.value === false)
    );
    if (failedEmails.length > 0) {
      console.error('Some equipment loan emails failed to send:', failedEmails);
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      calendarEventCreated: Boolean(calendarEventResult),
      calendarEventLink: calendarEventResult?.htmlLink || null
    }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Submission failed' }));
  }
}
