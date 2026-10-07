import { loadSubmissions } from './_utils.js';

function getTorontoDateString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const submissions = await loadSubmissions();
    const today = getTorontoDateString();
    const equipmentBookings = submissions
      .filter(s => {
        if (s.type !== 'equipment-loan') return false;

        const bookingEndDate = s.endDate || s.startDate;
        return Boolean(bookingEndDate) && bookingEndDate >= today;
      })
      .map(s => {
        const organizationName = s.organization === 'Other' ? (s.otherOrganization || 'Other') : (s.organization || 'Unknown');

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
          title: organizationName,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          allDay: false,
          extendedProps: {
            email: s.email,
            phone: s.phone,
            organization: organizationName,
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