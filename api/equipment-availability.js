import { loadSubmissions, parseJsonBody } from './_utils.js';

// Equipment availability (current inventory levels)
const EQUIPMENT_AVAILABILITY = {
  projector: 1,      // 1 projector available
  amplifier: 0,      // 1 amplifier available
  microphones: 2,    // 2 microphones available
  microphoneStands: 2, // 2 microphone stands available
  speakers: 2,       // 2 speakers available
  speakerStands: 2,  // 2 speaker stands available
  subwoofers: 2,     // 2 subwoofers available
  mixer: 1,          // 1 audio mixer available
  bbq: 1             // 1 BBQ available
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const { startDate, endDate, pickupTime, dropoffTime } = await parseJsonBody(req);

    // Calculate requested start and end times
    const requestedStart = new Date(`${startDate}T${pickupTime || '09:00'}`);
    const requestedEnd = endDate && dropoffTime
      ? new Date(`${endDate}T${dropoffTime}`)
      : new Date(`${startDate}T${dropoffTime || '17:00'}`);

    const submissions = await loadSubmissions();
    const equipmentBookings = submissions.filter(s => s.type === 'equipment-loan');

    const availability = {};

    // Check availability for each equipment type
    for (const [equipmentType, totalAvailable] of Object.entries(EQUIPMENT_AVAILABILITY)) {
      let totalBooked = 0;

      // Check overlapping bookings
      for (const booking of equipmentBookings) {
        const bookingStart = new Date(`${booking.startDate}T${booking.pickupTime || '09:00'}`);
        const bookingEnd = booking.endDate && booking.dropoffTime
          ? new Date(`${booking.endDate}T${booking.dropoffTime}`)
          : new Date(`${booking.startDate}T${booking.dropoffTime || '17:00'}`);

        // Check for time overlap
        if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
          // Parse equipment items to get quantity for this equipment type
          const equipmentItems = booking.equipmentItems || [];
          const bookedItem = equipmentItems.find(item => {
            const desc = item.description?.toLowerCase() || '';
            switch (equipmentType) {
              case 'projector':
                return desc.includes('projector') || desc.includes('projecteur');
              case 'microphones':
                return desc.includes('microphone');
              case 'microphoneStands':
                return desc.includes('microphone stand') || desc.includes('support pour microphone');
              case 'speakers':
                return desc.includes('speaker') && !desc.includes('stand') && !desc.includes('subwoofer');
              case 'speakerStands':
                return desc.includes('speaker stand') || desc.includes('support de haut-parleur');
              case 'subwoofers':
                return desc.includes('subwoofer') || desc.includes('caisson de basse');
              case 'mixer':
                return desc.includes('audio mixer') || desc.includes('mixeur audio');
              case 'bbq':
                return desc.includes('barbecue') || desc.includes('bbq');
              default:
                return false;
            }
          });
          const bookedQuantity = bookedItem ? Number(bookedItem.quantity || 0) : 0;
          totalBooked += bookedQuantity;
        }
      }

      availability[equipmentType] = Math.max(0, totalAvailable - totalBooked);
    }
        }
      }

      availability[equipmentType] = Math.max(0, totalAvailable - totalBooked);
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(availability));
  } catch (error) {
    console.error('Error checking equipment availability:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to check availability' }));
  }
}