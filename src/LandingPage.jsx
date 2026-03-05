import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const landingTranslations = {
    en: {
      welcome: 'Welcome',
      selectForm: 'Select a Form',
      expenseReport: 'Expense Report / Reimbursement',
      expenseReportDesc: 'Submit your expenses and request reimbursement',
      equipmentLoan: 'Equipment Loan',
      equipmentLoanDesc: 'Request to borrow equipment for your event',
      vemsRequest: 'VEMS Request',
      vemsRequestDesc: 'Submit a VEMS request',
      chooseForm: 'Choose the form you need',
    },
    fr: {
      welcome: 'Bienvenue',
      selectForm: 'Sélectionner un formulaire',
      expenseReport: 'Rapport de dépenses / Remboursement',
      expenseReportDesc: 'Soumettez vos dépenses et demandez leur remboursement.',
      equipmentLoan: 'Emprunt d\'équipement',
      equipmentLoanDesc: 'Demandez à emprunter de l\'équipement pour votre événement',
      vemsRequest: 'Demande VEMS',
      vemsRequestDesc: 'Soumettre une demande VEMS',
      chooseForm: 'Choisissez le formulaire dont vous avez besoin',
    },
  };

  const t_landing = (key) => landingTranslations[language][key] || key;

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
              <p className="lead text-white-50 mb-5">{t_landing('chooseForm')}</p>
            </div>

            {/* Form Selection Cards */}
            <div className="row justify-content-center">
              {/* Expense Report Card */}
              <div className="col-md-5 mb-4 me-md-3">
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
              <div className="col-md-5 mb-4">
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
              <div className="col-md-5 mb-4">
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
        <p className="text-light text-center small mb-0" style={{ fontSize: '0.75rem' }}>© 2025–2026 Cyrus Choi. All rights reserved.</p>
      </div>
    </div>
  );
}
