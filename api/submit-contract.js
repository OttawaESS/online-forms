import crypto from 'crypto';
import { saveSubmission, parseJsonBody, sendEmail } from './_utils.js';

function buildConfirmationEmailHtml(payload, submissionId) {
  const participantName = payload.name || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'Participant';
  const guardianName = payload.guardianLegalName || 'N/A';

  return `
    <h2>101 Week contract received / Contrat de la Semaine 101 reçu</h2>

    <p>Hello ${participantName},</p>
    <p>Your 101 Week contract and waiver has been received successfully.</p>
    <p><strong>Submission details:</strong></p>
    <ul>
      <li><strong>Submission ID:</strong> ${submissionId}</li>
      <li><strong>Participant name:</strong> ${participantName}</li>
      <li><strong>Email:</strong> ${payload.email || 'N/A'}</li>
    </ul>
    <p>Keep this email for your records. A member of the organizing team may contact you if anything needs follow-up.</p>

    <hr style="margin: 30px 0; border: none; border-top: 2px solid #ccc;">

    <p>Bonjour ${participantName},</p>
    <p>Votre contrat et votre renonciation de la Semaine 101 ont été reçus avec succès.</p>
    <p><strong>Détails de la soumission :</strong></p>
    <ul>
      <li><strong>ID de soumission :</strong> ${submissionId}</li>
      <li><strong>Nom de la personne participante :</strong> ${participantName}</li>
      <li><strong>Courriel :</strong> ${payload.email || 'N/A'}</li>
    </ul>
    <p>Conservez ce courriel pour vos dossiers. Un membre de l’équipe organisatrice pourrait communiquer avec vous si un suivi est nécessaire.</p>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const body = await parseJsonBody(req);
    const submissionId = crypto.randomUUID();

    const payload = {
      ...body,
      id: submissionId,
      timestamp: new Date().toISOString(),
    };

    await saveSubmission(payload);

    let emailSent = false;
    if (payload.email) {
      emailSent = await sendEmail(
        payload.email,
        'Confirmation du contrat 101 Week / 101 Week Contract Confirmation',
        buildConfirmationEmailHtml(payload, submissionId)
      );
      if (!emailSent) {
        console.error('Contract confirmation email did not send for submission:', submissionId);
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, emailSent }));
  } catch (err) {
    console.error('Contract submission failed:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Submission failed' }));
  }
}
