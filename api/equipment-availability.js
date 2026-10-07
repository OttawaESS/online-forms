import { loadSubmissions, parseJsonBody } from './_utils.js';

// Equipment availability (current inventory levels)
const EQUIPMENT_AVAILABILITY = {
  projector: 1,      // 1 projector available
  microphones: 2,    // 2 microphones available
  podcastMicrophones: 2, // 2 podcast mics available
  microphoneStands: 2, // 2 microphone stands available
  speakers: 2,       // 2 speakers available
  speakerStands: 2,  // 2 speaker stands available
  subwoofers: 2,     // 2 subwoofers available
  tvCbyA04: 1,       // 1 CBY A04 TV available
  tvCart: 1,          // 1 TV cart available
  foldingTable6Ft: 2, // 2 six-foot folding tables available
  foldingTable8Ft: 2, // 2 eight-foot folding tables available
  canopy13x13: 1,    // 1 13x13 canopy available
  canopy8x8: 1,      // 1 8x8 canopy available
  cooler: 3,         // 3 coolers available
  mixer: 1,          // 1 audio mixer available
  bbq: 1,            // 1 BBQ available
  griddleBlackDecker: 1, // 1 BLACK + DECKER griddle available
  griddleStarfrit: 1     // 1 Starfrit griddle available
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const { startDate, endDate, pickupTime, dropoffTime } = await parseJsonBody(req);

    // Calculate requested start and end times with 30-minute buffers
    const requestedStart = new Date(`${startDate}T${pickupTime || '09:00'}`);
    const requestedEnd = endDate && dropoffTime
      ? new Date(`${endDate}T${dropoffTime}`)
      : new Date(`${startDate}T${dropoffTime || '17:00'}`);

    // Add 30-minute buffer before and after the requested booking
    const requestedStartWithBuffer = new Date(requestedStart.getTime() - 30 * 60 * 1000); // 30 minutes before
    const requestedEndWithBuffer = new Date(requestedEnd.getTime() + 30 * 60 * 1000);   // 30 minutes after

    const submissions = await loadSubmissions();
    const equipmentBookings = submissions.filter(s => s.type === 'equipment-loan');

    const availability = {};

    // Check availability for each equipment type
    for (const [equipmentType, totalAvailable] of Object.entries(EQUIPMENT_AVAILABILITY)) {
      let totalBooked = 0;
      const conflictingBookings = [];

      // Check overlapping bookings
      for (const booking of equipmentBookings) {
        const bookingStart = new Date(`${booking.startDate}T${booking.pickupTime || '09:00'}`);
        const bookingEnd = booking.endDate && booking.dropoffTime
          ? new Date(`${booking.endDate}T${booking.dropoffTime}`)
          : new Date(`${booking.startDate}T${booking.dropoffTime || '17:00'}`);

        // Check for time overlap with 30-minute buffers
        // A conflict occurs if:
        // 1. The buffered requested start overlaps with existing booking
        // 2. The buffered requested end overlaps with existing booking
        if (requestedStartWithBuffer < bookingEnd && requestedEndWithBuffer > bookingStart) {
          // Parse equipment items to get quantity for this equipment type
          const equipmentItems = booking.equipmentItems || [];
          const bookedItem = equipmentItems.find(item => {
            const desc = item.description?.toLowerCase() || '';
            switch (equipmentType) {
              case 'projector':
                return desc.includes('projector') || desc.includes('projecteur');
              case 'microphones':
                return desc.includes('microphone') && !desc.includes('podcast');
              case 'podcastMicrophones':
                return desc.includes('podcast') && (desc.includes('microphone') || desc.includes('mic') || desc.includes('usb connected')) || desc.includes('usb connected') && desc.includes('condenser');
              case 'microphoneStands':
                return desc.includes('microphone stand') || desc.includes('support pour microphone');
              case 'speakers':
                return desc.includes('speaker') && !desc.includes('stand') && !desc.includes('subwoofer');
              case 'speakerStands':
                return desc.includes('speaker stand') || desc.includes('support de haut-parleur');
              case 'subwoofers':
                return desc.includes('subwoofer') || desc.includes('caisson de basse');
              case 'tvCbyA04':
                return desc.includes('cby a04 tv') || desc.includes('cby a04 tv and cart');
              case 'tvCart':
                return desc === 'cart' || desc.includes('tv cart') || desc.includes('cby a04 tv and cart');
              case 'foldingTable6Ft':
                return desc.includes('folding table (6 ft)') || desc.includes('table pliante (6 pi)') || desc.includes('6 ft') || desc.includes('6ft');
              case 'foldingTable8Ft':
                return desc.includes('folding table (8 ft)') || desc.includes('table pliante (8 pi)') || desc.includes('8 ft') || desc.includes('8ft');
              case 'canopy13x13':
                return desc.includes('13x13') || desc.includes('13 x 13') || desc.includes('13 x 13 canopy');
              case 'canopy8x8':
                return desc.includes('8x8') || desc.includes('8 x 8') || desc.includes('8 x 8 canopy');
              case 'cooler':
                return desc.includes('igloo') && desc.includes('cooler') || desc.includes('maxcold') || desc.includes('latitude 90qt');
              case 'mixer':
                return desc.includes('audio mixer') || desc.includes('mixeur audio');
              case 'bbq':
                return desc.includes('barbecue') || desc.includes('bbq');
              case 'griddleBlackDecker':
                return desc.includes('BLACK + DECKER Family-Sized Electric Griddle');
              case 'griddleStarfrit':
                return desc.includes('Starfrit The Rock Electric Griddle');
              default:
                return false;
            }
          });
          const bookedQuantity = bookedItem ? Number(bookedItem.quantity || 0) : 0;
          totalBooked += bookedQuantity;

          // If this booking conflicts, collect the details
          if (bookedQuantity > 0) {
            conflictingBookings.push({
              organization: booking.organization || 'Unknown',
              startDate: booking.startDate,
              endDate: booking.endDate || booking.startDate,
              pickupTime: booking.pickupTime || '09:00',
              dropoffTime: booking.dropoffTime || '17:00',
              quantity: bookedQuantity
            });
          }
        }
      }

      const availableQuantity = Math.max(0, totalAvailable - totalBooked);
      availability[equipmentType] = {
        available: availableQuantity,
        bookings: availableQuantity === 0 ? conflictingBookings : []
      };
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