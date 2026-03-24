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
      .map(s => {
        // Create start datetime
        const startDateTime = s.pickupTime 
          ? new Date(`${s.startDate}T${s.pickupTime}`)
          : new Date(`${s.startDate}T09:00:00`); // Default to 9 AM if no pickup time

        // Create end datetime
        let endDateTime;
        if (s.endDate && s.dropoffTime) {
          endDateTime = new Date(`${s.endDate}T${s.dropoffTime}`);
        } else if (s.endDate) {
          endDateTime = new Date(`${s.endDate}T17:00:00`); // Default to 5 PM if no dropoff time
        } else if (s.dropoffTime) {
          endDateTime = new Date(`${s.startDate}T${s.dropoffTime}`);
        } else {
          endDateTime = new Date(startDateTime.getTime() + 8 * 60 * 60 * 1000); // Default 8 hours later
        }

        return {
          id: s.id,
          title: `${s.organization || 'Unknown'}`,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          allDay: false,
          extendedProps: {
            email: s.email,
            phone: s.phone,
            organization: s.organization,
            startDate: s.startDate,
            endDate: s.endDate,
            pickupTime: s.pickupTime,
            dropoffTime: s.dropoffTime,
            equipment: s.equipmentItems || [],
            usage: s.equipmentUsage,
            onCampus: s.onCampus,
            needsAssistance: s.needsOnSiteAssistance
          }
        };
      });

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(equipmentBookings));
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}