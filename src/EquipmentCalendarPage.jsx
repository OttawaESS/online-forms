import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useLanguage } from './LanguageContext';

export default function EquipmentCalendarPage() {
  const { language, toggleLanguage, t } = useLanguage();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error('Failed to load bookings:', err));
  }, []);

  return (
    <div style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', minHeight: '100vh', padding: '1.5rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <a href="/" className="btn btn-outline-light">{t('backHome')}</a>
          <button
            onClick={toggleLanguage}
            className="btn btn-light"
            style={{ minWidth: '80px' }}
          >
            {language === 'en' ? 'FR' : 'EN'}
          </button>
        </div>

        <div className="card shadow-lg border-0">
          <div className="card-body p-4">
            <h2 className="mb-3 text-dark">{t('bookingsCalendar')}</h2>
            <div className="bg-light p-3 rounded border">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                events={bookings}
                timeZone="America/New_York"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                height="650px"
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                scrollTime="09:00:00"
                slotDuration="00:30:00"
                allDaySlot={false}
                eventDisplay="block"
                eventTextColor="#ffffff"
                eventColor="#52009a"
                eventBorderColor="#2d0a4e"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
