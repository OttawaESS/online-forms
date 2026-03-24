import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function LandingPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error('Failed to load bookings:', err));
  }, []);

  const landingTranslations = {
    en: {
      welcome: 'Welcome',
      selectForm: 'Select a Form',
      expenseReport: 'Expense Report',
      expenseReportDesc: 'Submit your expenses for reimbursement',
      equipmentLoan: 'Equipment Loan',
      equipmentLoanDesc: 'Request to borrow equipment for your event',
      vemsRequest: 'VEMS Request',
      vemsRequestDesc: 'Submit a VEMS request',
      chooseForm: 'Choose the form you need',
      bookingsCalendar: 'Equipment Bookings Calendar',
      bookingDetails: 'Booking Details',
      email: 'Email',
      phone: 'Phone',
      organization: 'Organization',
      dates: 'Dates',
      pickupTime: 'Pickup Time',
      dropoffTime: 'Dropoff Time',
      equipment: 'Equipment',
      usage: 'Usage',
      onCampus: 'On Campus',
      needsAssistance: 'Needs On-Site Assistance',
      close: 'Close',
    },
    fr: {
      welcome: 'Bienvenue',
      selectForm: 'Sélectionner un formulaire',
      expenseReport: 'Rapport de dépenses',
      expenseReportDesc: 'Soumettez vos dépenses pour remboursement.',
      equipmentLoan: 'Emprunt d\'équipement',
      equipmentLoanDesc: 'Demandez à emprunter de l\'équipement pour votre événement',
      vemsRequest: 'Demande VEMS',
      vemsRequestDesc: 'Soumettre une demande VEMS',
      chooseForm: 'Choisissez le formulaire dont vous avez besoin',
      bookingsCalendar: 'Calendrier des réservations d\'équipement',
      bookingDetails: 'Détails de la réservation',
      email: 'Email',
      phone: 'Téléphone',
      organization: 'Organisation',
      dates: 'Dates',
      pickupTime: 'Heure de ramassage',
      dropoffTime: 'Heure de dépôt',
      equipment: 'Équipement',
      usage: 'Utilisation',
      onCampus: 'Sur le campus',
      needsAssistance: 'Besoin d\'assistance sur site',
      close: 'Fermer',
    },
  };

  const handleEventClick = (clickInfo) => {
    setSelectedBooking(clickInfo.event.extendedProps);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  return (
    <div className="pt-3" style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', minHeight: '100vh'}}>
      <div className="container d-flex flex-column h-100" style={{ minHeight: '50vh' }}>
        {/* Language Toggle */}
        <div className="d-flex justify-content-between align-items-center">
          <button 
            onClick={toggleLanguage} 
            className="btn btn-light"
            style={{ minWidth: '80px' }}
          >
            {language === 'en' ? 'FR' : 'EN'}
          </button>
          <a href="/login" className="btn btn-outline-light">{t('adminLogin')}</a>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="w-100">
            <div className="text-center mb-5">
              <h1 className="display-4 text-white mb-3">{t_landing('welcome')}</h1>
              {/* <p className="lead text-white-50 mb-5">{t_landing('chooseForm')}</p> */}
            </div>

            {/* Form Selection Cards */}
            <div className="row justify-content-center">
              {/* Expense Report Card */}
              <div className="col-md-4 mb-4">
                <div 
                  className="card shadow-lg h-100 cursor-pointer"
                  style={{ 
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => navigate('/expense-report')}
                >
                  <div className="card-body text-center p-5">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
                    <h3 className="card-title mb-3">{t_landing('expenseReport')}</h3>
                    <p className="card-text text-muted">{t_landing('expenseReportDesc')}</p>
                  </div>
                </div>
              </div>

              {/* Equipment Loan Card */}
              <div className="col-md-4 mb-4">
                <div 
                  className="card shadow-lg h-100 cursor-pointer"
                  style={{ 
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => navigate('/equipment-loan')}
                >
                  <div className="card-body text-center p-5">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎧</div>
                    <h3 className="card-title mb-3">{t_landing('equipmentLoan')}</h3>
                    <p className="card-text text-muted">{t_landing('equipmentLoanDesc')}</p>
                  </div>
                </div>
              </div>
              
              {/* VEMS Request Form */}
              <div className="col-md-4 mb-4">
                <div 
                  className="card shadow-lg h-100 cursor-pointer"
                  style={{ 
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdiP7kF5FX21FRCZ8CmVm2Q9q0BcJM8mlzhSpTgKRbkwGTiUg/viewform?usp=dialog', '_blank')}
                >
                  <div className="card-body text-center p-5">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <h3 className="card-title mb-3">{t_landing('vemsRequest')}</h3>
                    <p className="card-text text-muted">{t_landing('vemsRequestDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Bookings Calendar */}
        <div className="mt-5">
          <h2 className="text-white text-center mb-4">{t_landing('bookingsCalendar')}</h2>
          <div className="bg-white p-3 rounded shadow">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={bookings}
              height="auto"
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
            />
          </div>
        </div>

        <div className="text-center">
          <a href="https://www.essaeg.ca" target="_blank" rel="noopener noreferrer">
            <img src="/ess-logo.png" alt="ESS Website" className="img-fluid mt-5" style={{ maxHeight: '100px', margin: '0 auto' }}/>
          </a>
        </div>

        <a href="https://www.cyruschoi.ca" target="_blank" rel="noopener noreferrer" alt="Cyrus Choi Website" className='text-decoration-none'>
          <p className="text-light text-center small py-5" style={{ fontSize: '0.75rem' }}>© 2025–2026 Cyrus Choi. All rights reserved.</p>
        </a>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t_landing('bookingDetails')}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>{t_landing('organization')}:</strong> {selectedBooking.organization}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>{t_landing('dates')}:</strong> {selectedBooking.startDate} {selectedBooking.endDate && selectedBooking.endDate !== selectedBooking.startDate ? ` - ${selectedBooking.endDate}` : ''}</p>
                    <p><strong>{t_landing('pickupTime')}:</strong> {selectedBooking.pickupTime || 'Not specified'}</p>
                    <p><strong>{t_landing('dropoffTime')}:</strong> {selectedBooking.dropoffTime || 'Not specified'}</p>
                    <p><strong>{t_landing('onCampus')}:</strong> {selectedBooking.onCampus === 'yes' ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p><strong>{t_landing('equipment')}:</strong></p>
                  <ul>
                    {selectedBooking.equipment && selectedBooking.equipment.length > 0 ? (
                      selectedBooking.equipment.map((item, index) => (
                        <li key={index}>{item.description} (Quantity: {item.quantity})</li>
                      ))
                    ) : (
                      <li>No equipment specified</li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>{t_landing('close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
