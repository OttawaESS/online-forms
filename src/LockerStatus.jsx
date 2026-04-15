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
        console.log('Payments data length:', payments.length);
        console.log('First payment:', payments.length > 0 ? payments[0] : 'No data');

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
          guestName: null,
          buyerName: null,
          buyerEmail: null,
          ticketNumber: null,
          ticketType: null,
          email: null,
          studentNumber: null,
          notes: null,
          hall: getHall(id)
        }));

        // Merge with Zeffy payments data
        payments.forEach(payment => {
          const buyer = payment.buyer || {};
          const buyerName = `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim();
          const buyerEmail = buyer.email || '';

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
              locker.buyerName = buyerName;
              locker.buyerEmail = buyerEmail;
              locker.notes = payment.description || '';
              locker.ticketNumber = payment.id;
              locker.ticketType = payment.campaign_type || 'donation';
            }
          }
        });

        // Check for expired bookings based on current date in EST
        const now = new Date();
        const estDate = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const currentMonth = estDate.getMonth(); // 0-11

        allLockers.forEach(locker => {
          if (locker.ticketType && locker.status !== 'available') {
            const hasFall = locker.ticketType.includes('Fall');
            const hasWinter = locker.ticketType.includes('Winter');
            let expired = false;

            if (hasFall && !hasWinter) {
              // Fall only: remove if after Fall (Jan-Apr, months 0-3)
              if (currentMonth >= 0 && currentMonth <= 3) {
                expired = true;
              }
            } else if (hasWinter && !hasFall) {
              // Winter only: remove if after Winter (May-Dec, months 4-11)
              if (currentMonth >= 4) {
                expired = true;
              }
            } else if (hasFall && hasWinter) {
              // Both terms: remove if after Winter (May-Dec, months 4-11)
              if (currentMonth >= 4) {
                expired = true;
              }
            }

            if (expired) {
              locker.status = 'expired';
              // Keep booking details for history
            }
          }
        });

        console.log('Final lockers:', allLockers); // Debug log
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
          <p className="text-white">{t('loading')}</p>
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
                          <td>{locker.ticketType || '-'}</td>
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
                <p>{t('locker')} {selectedLocker.id} - {t('previouslyBookedFor')} {selectedLocker.ticketType || 'Unknown'}</p>
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