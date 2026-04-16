import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

const halls = [
  { key: 'redHallwayStemTunnels', min: 1073, max: 1121 },
  { key: 'yellowBBlockHallway', min: 1001, max: 1076 },
  { key: 'purpleCBlockHallway', min: 1200, max: 1284 },
  { key: 'greenHallwayBehindC03', min: 1091, max: 1295 },
  { key: 'orangeHallwayKingEdward', min: 1, max: 371 },
  { key: 'pinkEBlockHallway', min: 540, max: 591 },
];

const getHall = (lockerNumber) => {
  const num = parseInt(lockerNumber);
  const hall = halls.find(h => num >= h.min && num <= h.max);
  return hall ? hall.key : 'other';
};

const extractTerm = (description) => {
  if (!description) return 'Unknown';
  
  // Handle combined terms like "Fall 2025 & Winter 2026"
  const combinedMatch = description.match(/Fall\s+(\d{4})\s*&\s*Winter\s+(\d{4})/i);
  if (combinedMatch) {
    return `Fall ${combinedMatch[1]} & Winter ${combinedMatch[2]}`;
  }
  
  // Handle single terms
  const terms = ['Fall', 'Winter', 'Spring', 'Summer'];
  for (const term of terms) {
    const match = description.match(new RegExp(`${term}\\s+(\\d{4})`, 'i'));
    if (match) {
      return `${term} ${match[1]}`;
    }
  }
  
  return 'Unknown';
};

export default function LockerStatus() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState(null);

  useEffect(() => {
    // Fetch payments from Zeffy API
    fetch('/api/payments')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch payments');
        return res.json();
      })
      .then(data => {
        const payments = data.data || [];

        // Generate all unique lockers
        const allIds = new Set();
        halls.forEach(hall => {
          for (let i = hall.min; i <= hall.max; i++) {
            allIds.add(i);
          }
        });
        const allLockers = Array.from(allIds).map(id => ({
          id: id,
          status: 'available',
          ticketNumber: null,
          ticketType: null,
          term: null,
          notes: null,
          hall: getHall(id)
        }));

        // Merge with Zeffy payments data
        payments.forEach(payment => {
          // Extract locker number from buyer_questions custom field
          let lockerId = null;
          if (payment.buyer_questions && Array.isArray(payment.buyer_questions)) {
            const lockerQuestion = payment.buyer_questions.find(q =>
              q.question && q.question.toLowerCase().includes('locker')
            );
            if (lockerQuestion && lockerQuestion.answer) {
              const match = lockerQuestion.answer.match(/(\d+)/);
              if (match) {
                lockerId = parseInt(match[1]);
              }
            }
          }

          // Fallback to items questions if not found
          if (!lockerId && payment.items && Array.isArray(payment.items)) {
            for (const item of payment.items) {
              if (item.questions && Array.isArray(item.questions)) {
                const lockerQuestion = item.questions.find(q =>
                  q.question && q.question.toLowerCase().includes('locker')
                );
                if (lockerQuestion && lockerQuestion.answer) {
                  const match = lockerQuestion.answer.match(/(\d+)/);
                  if (match) {
                    lockerId = parseInt(match[1]);
                    break;
                  }
                }
              }
            }
          }

          if (lockerId && !isNaN(lockerId) && allIds.has(lockerId)) {
            const locker = allLockers.find(l => l.id === lockerId);
            if (locker) {
              locker.status = payment.status === 'succeeded' ? 'occupied' : 'pending';
              
              locker.term = extractTerm(payment.description);
            }
          }
        });

        // Check for expired bookings based on current date in EST
        const now = new Date();
        const estDate = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const currentMonth = estDate.getMonth(); // 0-11

        allLockers.forEach(locker => {
          if (locker.term && locker.status !== 'available') {
            const currentYear = estDate.getFullYear();
            const currentMonth = estDate.getMonth(); // 0-11
            
            let expired = false;
            
            if (locker.term.includes('Fall 2025') && locker.term.includes('Winter 2026')) {
              // Combined term: expires after Winter 2026 (assume May 2026)
              if (currentYear > 2026 || (currentYear === 2026 && currentMonth >= 4)) {
                expired = true;
              }
            } else if (locker.term.includes('Winter 2026')) {
              // Winter 2026 only: expires after Winter 2026
              if (currentYear > 2026 || (currentYear === 2026 && currentMonth >= 4)) {
                expired = true;
              }
            } else if (locker.term.includes('Fall 2025')) {
              // Fall 2025 only: expires after Fall 2025 (assume Jan 2026)
              if (currentYear > 2025 || (currentYear === 2025 && currentMonth >= 0)) {
                expired = true;
              }
            }

            if (expired) {
              locker.status = 'expired';
              // Keep booking details for history
            }
          }
        });

        setLockers(allLockers);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load locker status:', err);
        setError(t('errorLoadingLockerStatus') + ': ' + err.message);
        setLoading(false);
      });
  }, [t]);

  if (error) {
    return (
      <div style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', minHeight: '100vh' }}>
        <div className="container mt-5 text-center">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-outline-light"
            >
              {t('backHome')}
            </button>
            <button 
              onClick={toggleLanguage} 
              className="btn btn-light"
              style={{ minWidth: '80px' }}
            >
              {language === 'en' ? 'FR' : 'EN'}
            </button>
            <a href="/login" className="btn btn-outline-light">{t('adminLogin')}</a>
          </div>
          <h1 className="text-white">{t('lockerStatus')}</h1>
          <p className="text-white">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', minHeight: '100vh' }}>
        <div className="container mt-5 text-center">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-outline-light"
            >
              {t('backHome')}
            </button>
            <button 
              onClick={toggleLanguage} 
              className="btn btn-light"
              style={{ minWidth: '80px' }}
            >
              {language === 'en' ? 'FR' : 'EN'}
            </button>
            <a href="/login" className="btn btn-outline-light">{t('adminLogin')}</a>
          </div>
          <h1 className="text-white">{t('lockerStatus')}</h1>
          <div className="d-flex justify-content-center align-items-center">
            <div className="spinner-border text-light me-3" role="status">
              <span className="visually-hidden">{t('loading')}</span>
            </div>
            <p className="text-white mb-0">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedLockers = halls.reduce((acc, hall) => {
    acc[hall.key] = [];
    return acc;
  }, {});

  lockers.forEach(locker => {
    groupedLockers[locker.hall].push(locker);
  });

  return (
    <div style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', minHeight: '100vh' }}>
      <div className="container pt-3 pb-5 ">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-outline-light"
          >
            {t('backHome')}
          </button>
          <button 
            onClick={toggleLanguage} 
            className="btn btn-light"
            style={{ minWidth: '80px' }}
          >
            {language === 'en' ? 'FR' : 'EN'}
          </button>
          <a href="/login" className="btn btn-outline-light">{t('adminLogin')}</a>
        </div>

        <h1 className="text-center mb-4 text-white">{t('lockerStatus')}</h1>

        {/* Reference Guide and Summary */}
        <div className="card shadow-lg mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <img src="/lockerlocations.png" alt="Locker Locations Guide" className="img-fluid" style={{ height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="col-md-6">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>{t('hall')}</th>
                      <th>{t('available')}</th>
                      <th>{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(groupedLockers).map(hall => {
                      const hallLockers = groupedLockers[hall];
                      const availableCount = hallLockers.filter(locker => locker.status === 'available').length;
                      const totalCount = hallLockers.length;
                      return (
                        <tr key={hall}>
                          <td>{t(hall)}</td>
                          <td>{availableCount}</td>
                          <td>{totalCount}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>{Object.keys(groupedLockers).reduce((sum, hall) => sum + groupedLockers[hall].filter(locker => locker.status === 'available').length, 0)}</strong></td>
                      <td><strong>{Object.keys(groupedLockers).reduce((sum, hall) => sum + groupedLockers[hall].length, 0)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      <div className="card shadow-lg">
        <div className="card-body">
          <div className="accordion" id="hallAccordion">
        {Object.keys(groupedLockers).map((hall, index) => (
          <div key={hall} className="accordion-item">
            <h2 className="accordion-header">
              <button 
                className="accordion-button" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target={`#collapse${index}`} 
                aria-expanded="true" 
                aria-controls={`collapse${index}`}
              >
                {t(hall)} ({groupedLockers[hall].filter(locker => locker.status === 'available').length}/{groupedLockers[hall].length} {t('lockers')})
              </button>
            </h2>
            <div 
              id={`collapse${index}`} 
              className={`accordion-collapse collapse`} 
              data-bs-parent="#hallAccordion"
            >
              <div className="accordion-body">
                <div className="table-responsive">
                  <table className="table table-striped table-sm">
                    <thead>
                      <tr>
                        <th>{t('locker')}</th>
                        <th>{t('status')}</th>
                        {/* <th>{t('guestName')}</th>
                        <th>{t('buyerName')}</th> */}
                        <th>{t('ticketType')}</th>
                        <th>{t('action')}</th>
                        {/* <th>{t('notes')}</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedLockers[hall].map(locker => (
                        <tr key={locker.id}>
                          <td>{locker.id}</td>
                          <td>
                            <span 
                              className={`badge ${locker.status === 'available' ? 'bg-success' : locker.status === 'occupied' ? 'bg-danger' : locker.status === 'expired' ? 'bg-secondary' : 'bg-warning'}`}
                              style={{ cursor: locker.status === 'expired' ? 'pointer' : 'default' }}
                              onClick={locker.status === 'expired' ? () => { setSelectedLocker(locker); setShowModal(true); } : undefined}
                            >
                              {t(locker.status)}
                            </span>
                          </td>
                          {/* <td>{locker.guestName || '-'}</td>
                          <td>{locker.buyerName || '-'}</td> */}
                          <td>{locker.term || '-'}</td>
                          <td>
                            {locker.status === 'available' ? (
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => window.open('https://www.zeffy.com/en-CA/ticketing/locker-rental-2025--2026-2', '_blank')}
                              >
                                {t('purchase')}
                              </button>
                            ) : (
                              '-'
                            )}
                          </td>
                          {/* <td>{locker.notes || '-'}</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>

      {/* Modal for expired locker details */}
      {showModal && selectedLocker && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog">
            <div className="modal-content bg-secondary text-white">
              <div className="modal-header">
                <h5 className="modal-title">{t('expiredLockerDetails')}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>{t('locker')} {selectedLocker.id} - {t('previouslyBookedFor')} {selectedLocker.term || 'Unknown'}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>{t('close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}