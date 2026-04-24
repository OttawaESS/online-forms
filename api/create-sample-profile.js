import { saveProfile } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const sampleProfile = {
      id: 'sample_user',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      rfid: '123456789',
      notes: [
        {
          note: 'Initial visit',
          date: new Date().toISOString()
        }
      ]
    };

    await saveProfile(sampleProfile);

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Sample profile created' }));
  } catch (err) {
    console.error('Error creating sample profile:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}