import { loadSubmissions, saveProfile } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const submissions = await loadSubmissions();
    const profilesMap = new Map();

    // Group submissions by email to create profiles
    for (const submission of submissions) {
      const email = submission.email;
      if (!email) continue;

      if (!profilesMap.has(email)) {
        profilesMap.set(email, {
          id: email.replace('@', '_').replace('.', '_'), // simple ID from email
          name: submission.name || '',
          email: email,
          phone: submission.phone || '',
          rfid: '', // to be filled later
          notes: []
        });
      }
    }

    // Save profiles
    for (const profile of profilesMap.values()) {
      await saveProfile(profile);
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ message: `Created ${profilesMap.size} profiles` }));
  } catch (err) {
    console.error('Error initializing profiles:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}