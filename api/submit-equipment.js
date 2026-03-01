import crypto from 'crypto';
import { saveSubmission, parseJsonBody } from './_utils.js';

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

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Submission failed' }));
  }
}
