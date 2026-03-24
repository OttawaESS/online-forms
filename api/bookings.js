import { loadSubmissions } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const submissions = await loadSubmissions();
    const equipmentBookings = submissions
      .filter(s => s.type === 'equipment-loan')
      .map(s => ({
        id: s.id,
        title: `${s.name} - ${s.organization || 'Unknown'}`,
        start: s.startDate,
        end: s.endDate ? new Date(new Date(s.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : s.startDate, // End date inclusive
        allDay: true,
        extendedProps: {
          email: s.email,
          equipment: s.equipmentItems || []
        }
      }));

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(equipmentBookings));
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}