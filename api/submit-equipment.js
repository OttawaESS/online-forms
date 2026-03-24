import crypto from 'crypto';
import { saveSubmission, parseJsonBody, sendEmail } from './_utils.js';

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

    await saveSubmission(payload);

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
          'vpfa@uottawaess.ca, financecomm@uottawaess.ca, internal@uottawaess.ca, printing@uottawaess.ca, merch@uottawaess.ca'
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
    res.end(JSON.stringify({ success: true }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Submission failed' }));
  }
}
