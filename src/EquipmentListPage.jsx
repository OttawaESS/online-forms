import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

const formatDate = (dateString) => {
  if (!dateString) return '—';

  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const formatTime = (timeString) => {
  if (!timeString) return '—';

  const [hours, minutes] = timeString.split(':');
  if (hours === undefined || minutes === undefined) return timeString;

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

const isBookingOnDate = (booking, targetDate) => {
  const target = new Date(`${targetDate}T12:00:00`);
  const start = new Date(`${booking.startDate || targetDate}T00:00:00`);
  const end = new Date(`${booking.endDate || booking.startDate || targetDate}T23:59:59`);
  return target >= start && target <= end;
};

const getLocalDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const equipmentCatalog = [
  { key: 'projectors', label: 'Projectors', inventory: 1, category: 'av', match: (description) => description.toLowerCase().includes('projector') },
  { key: 'microphones', label: 'Microphones', inventory: 2, category: 'av', match: (description) => description.toLowerCase().includes('microphone') && !description.toLowerCase().includes('podcast') },
  { key: 'podcastMicrophones', label: 'Podcast Mics', inventory: 2, category: 'av', match: (description) => description.toLowerCase().includes('podcast') || (description.toLowerCase().includes('usb') && description.toLowerCase().includes('microphone')) },
  { key: 'microphoneStands', label: 'Microphone Stands', inventory: 2, category: 'av', match: (description) => description.toLowerCase().includes('microphone stand') },
  { key: 'speakers', label: 'Speakers', inventory: 2, category: 'av', match: (description) => description.toLowerCase().includes('speaker') && !description.toLowerCase().includes('stand') && !description.toLowerCase().includes('subwoofer') },
  { key: 'speakerStands', label: 'Speaker Stands', inventory: 2, category: 'av', match: (description) => description.toLowerCase().includes('speaker stand') },
  { key: 'subwoofers', label: 'Subwoofers', inventory: 2, category: 'av', match: (description) => description.toLowerCase().includes('subwoofer') },
  { key: 'mixer', label: 'Audio Mixer', inventory: 1, category: 'av', match: (description) => description.toLowerCase().includes('audio mixer') || description.toLowerCase().includes('mixeur audio') },
  { key: 'foldingTables', label: 'Folding Tables', inventory: 4, category: 'event', match: (description) => description.toLowerCase().includes('folding table') || description.toLowerCase().includes('table pliante') || description.toLowerCase().includes('6 ft') || description.toLowerCase().includes('8 ft') },
  { key: 'canopies', label: 'Canopies', inventory: 2, category: 'event', match: (description) => description.toLowerCase().includes('canopy') || description.toLowerCase().includes('voile') || description.toLowerCase().includes('13x13') || description.toLowerCase().includes('8x8') || description.toLowerCase().includes('6x6') },
  { key: 'cooler', label: 'Cooler', inventory: 3, category: 'event', match: (description) => description.toLowerCase().includes('cooler') || description.toLowerCase().includes('igloo') || description.toLowerCase().includes('maxcold') },
  { key: 'bbq', label: 'Barbecue', inventory: 1, category: 'cooking', match: (description) => description.toLowerCase().includes('barbecue') || description.toLowerCase().includes('bbq') },
  { key: 'griddles', label: 'Griddles', inventory: 2, category: 'cooking', match: (description) => description.toLowerCase().includes('griddle') },
];

export default function EquipmentListPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateInputValue());
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bookings');
        if (!response.ok) {
          throw new Error('Failed to load equipment bookings');
        }

        const data = await response.json();
        setBookings(data || []);
      } catch (err) {
        console.error('Error loading equipment bookings:', err);
        setError(t('unableToLoadBookings'));
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => isBookingOnDate(booking.extendedProps || booking, selectedDate));
  }, [bookings, selectedDate]);

  const equipmentGroups = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const groups = {
      av: { title: 'A/V Equipment', items: [] },
      event: { title: 'Event Equipment', items: [] },
      cooking: { title: 'Cooking Equipment', items: [] },
    };

    equipmentCatalog.forEach((item) => {
      const signedOut = filteredBookings.flatMap((booking) => {
        const details = booking.extendedProps || {};
        const equipmentItems = Array.isArray(details.equipment) ? details.equipment : [];
        const matches = equipmentItems.filter((entry) => item.match(entry.description || ''));

        return matches.map((entry) => {
          const organization = details.organization || booking.title || 'Unknown organization';
          return {
            organization,
            quantity: Number(entry.quantity || 1),
            pickupTime: details.pickupTime || booking.pickupTime,
            dropoffTime: details.dropoffTime || booking.dropoffTime,
          };
        });
      });

      const signedOutTotal = signedOut.reduce((sum, entry) => sum + entry.quantity, 0);
      const row = {
        key: item.key,
        label: item.label,
        total: signedOutTotal,
        inStock: item.inventory,
        available: Math.max(0, item.inventory - signedOutTotal),
        entries: signedOut,
      };

      const matchesSearch = !normalizedSearch ||
        item.label.toLowerCase().includes(normalizedSearch) ||
        row.entries.some((entry) => (entry.organization || '').toLowerCase().includes(normalizedSearch));

      if (matchesSearch) {
        groups[item.category].items.push(row);
      }
    });

    return groups;
  }, [filteredBookings, searchTerm]);

  return (
    <div className="pt-3" style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 42%, #6c2bd9 100%)', minHeight: '100vh' }}>
      <div className="container pb-5 pt-3">
        <div className="d-flex justify-content-between align-items-center mb-4 px-1">
          <button onClick={() => navigate('/')} className="btn btn-outline-light btn-sm">{t('backHome')}</button>
          <button onClick={toggleLanguage} className="btn btn-light btn-sm" style={{ minWidth: '72px', borderColor: '#ddd' }}>
            {language === 'en' ? 'FR' : 'EN'}
          </button>
          <a href="/login" className="btn btn-outline-light btn-sm">{t('adminLogin')}</a>
        </div>

        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white border-0 py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-2">
              <div className="d-flex align-items-center gap-3">
                <img src="/ess-logo.png" alt="ESS Logo" style={{ height: '48px', width: 'auto' }} />
                <div>
                  <h2 className="mb-0 fw-bold" style={{ color: '#52009a', fontSize: '1.6rem' }}>{t('equipmentSignOutListTitle')}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-4">
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="equipment-date" className="form-label fw-semibold small text-uppercase text-secondary">{t('selectDate')}</label>
                <input
                  id="equipment-date"
                  type="date"
                  className="form-control form-control-lg border-0 shadow-sm"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  style={{ background: '#f8f9fa' }}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="equipment-search" className="form-label fw-semibold small text-uppercase text-secondary">Search equipment</label>
                <input
                  id="equipment-search"
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Projector, cooler, table..."
                  style={{ background: '#f8f9fa' }}
                />
              </div>
            </div>

            {loading && <div className="alert alert-info rounded-3">{t('loadingBookings')}</div>}
            {error && <div className="alert alert-danger rounded-3">{error}</div>}

            {!loading && !error && (
              <>
                {Object.values(equipmentGroups).every((group) => group.items.length === 0) && (
                  <div className="alert alert-light border rounded-3 text-center">No equipment matches “{searchTerm}”.</div>
                )}

                <div className="row g-4">
                {Object.entries(equipmentGroups).map(([groupKey, group]) => (
                  <div key={groupKey} className="col-lg-4 col-md-6">
                    <div className="card h-100 border-0 shadow-sm rounded-4" style={{ background: '#f9f7ff' }}>
                      <div className="card-header bg-white border-0 px-3 py-3 rounded-top-4">
                        <h5 className="mb-0 fw-bold" style={{ color: '#52009a' }}>{group.title}</h5>
                      </div>
                      <div className="card-body px-3 py-2">
                        <div className="list-group list-group-flush">
                          {group.items.map((row) => (
                            <div key={row.key} className="list-group-item px-0 py-3 border-0 border-bottom last:border-0" style={{ background: 'transparent' }}>
                              <div className="d-flex justify-content-between align-items-start gap-3">
                                <div className="fw-semibold" style={{ color: '#2b2b2b' }}>{row.label}</div>
                                <div className="text-end small">
                                  <span className="badge rounded-pill bg-light text-dark border mb-1 d-block">{row.inStock} {t('inStock')}</span>
                                  <span className={`badge rounded-pill ${row.total > 0 ? 'bg-secondary-subtle text-secondary' : 'bg-success-subtle text-success'} d-block`}>
                                    {row.total > 0 ? `${row.total} ${t('signedOut')}` : t('notSignedOut')}
                                  </span>
                                </div>
                              </div>

                              {row.total > 0 ? (
                                <ul className="mb-0 mt-2 ps-3 small text-secondary">
                                  {row.entries.map((entry, index) => (
                                    <li key={`${row.label}-${entry.organization}-${index}`} className="mb-1">
                                      {row.label === 'Cooler' ? '1 x Igloo - Maxcold Latitude 90QT Rolling Cooler' : `${entry.organization} — ${entry.quantity} item${entry.quantity > 1 ? 's' : ''}`}
                                      {row.label !== 'Cooler' && entry.pickupTime && entry.dropoffTime ? ` (${formatTime(entry.pickupTime)} - ${formatTime(entry.dropoffTime)})` : ''}
                                      {row.label === 'Cooler' && entry.organization ? ` — ${entry.organization}` : ''}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-muted small mt-2">{t('noBookingsForEquipment')} {formatDate(selectedDate)}.</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
