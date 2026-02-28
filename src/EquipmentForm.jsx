import { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import '../styles/EquipmentForm.css';

function EquipmentForm({ onSubmit }) {
  const { language, toggleLanguage, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Contact Info
    fullName: '',
    email: '',
    organization: '',
    otherOrganization: '',
    startDate: '',
    endDate: '',
    pickupTime: '',
    dropoffTime: '',
    onCampus: '',
    equipmentUsage: '',
    needsOnSiteAssistance: '',
    // Step 2 - Equipment
    projector: 0,
    amplifier: 0,
    microphones: 0,
    microphoneStands: 0,
    speakers: 0,
    speakerStands: 0,
    subwoofers: 0,
    mixer: 0,
    bbq: false,
    bbqTerm1: false,
    bbqTerm2: false,
    bbqTerm3: false,
    bbqPropane: '',
    bbqTermsAccepted: false,
    finalComments: '',
    // Step 3 - Contract
    contractAccepted: false,
    signatureName: '',
    signatureData: '',
    signatureDate: '',
  });

  const [errors, setErrors] = useState({});
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const organizations = [
    'AÉG // ESS',
    'IEEE uOttawa',
    'AÉGCi // CESA',
    'AÉGC // ChESS',
    'SÉGM // MESS',
    'WISE',
    'AÉS // SSA',
    'EWB uOttawa',
    'PERSONNEL - look out for an email from merch@uottawaess.ca for a quote',
    'Other',
  ];

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = true;
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = true;
    if (!formData.organization) newErrors.organization = true;
    if (formData.organization === 'Other' && !formData.otherOrganization.trim()) {
      newErrors.otherOrganization = true;
    }
    
    // Date validations (using Toronto EST timezone)
    const today = new Date();
    // Convert to Toronto timezone
    const torontoToday = new Date(today.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
    torontoToday.setHours(0, 0, 0, 0);
    
    if (!formData.startDate) {
      newErrors.startDate = 'required';
    } else {
      const startDate = new Date(formData.startDate + 'T00:00:00');
      if (startDate < torontoToday) {
        newErrors.startDate = 'invalidStartDate';
      }
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'required';
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate + 'T00:00:00');
      const endDate = new Date(formData.endDate + 'T00:00:00');
      if (endDate < startDate) {
        newErrors.endDate = 'invalidEndDate';
      }
    }
    
    if (!formData.pickupTime) newErrors.pickupTime = true;
    if (!formData.dropoffTime) newErrors.dropoffTime = true;
    if (!formData.onCampus) newErrors.onCampus = true;
    if (!formData.equipmentUsage.trim()) newErrors.equipmentUsage = true;
    if (!formData.needsOnSiteAssistance) newErrors.needsOnSiteAssistance = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const hasEquipment = formData.projector > 0 || formData.amplifier > 0 || formData.microphones > 0 ||
                        formData.microphoneStands > 0 || formData.speakers > 0 || formData.speakerStands > 0 ||
                        formData.subwoofers > 0 || formData.mixer > 0 || formData.bbq;
    
    if (!hasEquipment) newErrors.equipment = true;
    if (formData.bbq && (!formData.bbqTerm1 || !formData.bbqTerm2 || !formData.bbqTerm3 || !formData.bbqTermsAccepted)) {
      newErrors.bbqTermsAccepted = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.contractAccepted) {
      newErrors.contractAccepted = true;
    }
    if (!formData.signatureName.trim()) {
      newErrors.signatureName = true;
    }
    if (!formData.signatureData) {
      newErrors.signatureData = true;
    }
    if (!formData.signatureDate) {
      newErrors.signatureDate = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    if (step === 1) return validateStep1();
    if (step === 2) return validateStep2();
    if (step === 3) return validateStep3();
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const numericFields = ['projector', 'amplifier', 'microphones', 'microphoneStands', 'speakers', 'speakerStands', 'subwoofers', 'mixer'];
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' || (type === 'radio' && numericFields.includes(name)) || (type === 'select-one' && numericFields.includes(name)) ? parseInt(value) : value),
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else if (step === 3) {
        onSubmit(formData);
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          organization: '',
          otherOrganization: '',
          startDate: '',
          endDate: '',
          pickupTime: '',
          dropoffTime: '',
          onCampus: '',
          equipmentUsage: '',
          needsOnSiteAssistance: '',
          projector: 0,
          amplifier: 0,
          microphones: 0,
          microphoneStands: 0,
          speakers: 0,
          speakerStands: 0,
          subwoofers: 0,
          mixer: 0,
          bbq: false,
          bbqTerm1: false,
          bbqTerm2: false,
          bbqTerm3: false,
          bbqPropane: '',
          bbqTermsAccepted: false,
          finalComments: '',
          contractAccepted: false,
          signatureName: '',
          signatureData: '',
          signatureDate: '',
        });
        clearCanvas();
        setStep(1);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
    setErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Canvas signature handling
  useEffect(() => {
    if (step === 3 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      // Autofill today's date for signature if not already set
      if (!formData.signatureDate) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${yyyy}-${mm}-${dd}`;
        
        setFormData(prev => ({
          ...prev,
          signatureDate: todayFormatted
        }));
      }
    }
  }, [step, formData.signatureDate]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    
    // Save signature data
    setFormData(prev => ({
      ...prev,
      signatureData: canvas.toDataURL()
    }));
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFormData(prev => ({
        ...prev,
        signatureData: ''
      }));
    }
  };

  const getEquipmentList = () => {
    const items = [];
    if (formData.projector > 0) items.push({ name: language === 'en' ? 'Projector' : 'Projecteur', qty: formData.projector });
    if (formData.amplifier > 0) items.push({ name: language === 'en' ? 'Amplifier' : 'Amplificateur', qty: formData.amplifier });
    if (formData.microphones > 0) items.push({ name: language === 'en' ? 'Microphones' : 'Microphones', qty: formData.microphones });
    if (formData.microphoneStands > 0) items.push({ name: language === 'en' ? 'Microphone Stands' : 'Supports pour microphones', qty: formData.microphoneStands });
    if (formData.speakers > 0) items.push({ name: language === 'en' ? 'Speakers' : 'Haut-parleurs', qty: formData.speakers });
    if (formData.speakerStands > 0) items.push({ name: language === 'en' ? 'Speaker Stands' : 'Supports de haut-parleurs', qty: formData.speakerStands });
    if (formData.subwoofers > 0) items.push({ name: language === 'en' ? 'Subwoofers' : 'Caissons de basse', qty: formData.subwoofers });
    if (formData.mixer > 0) items.push({ name: language === 'en' ? 'Audio Mixer' : 'Mixeur audio', qty: formData.mixer });
    if (formData.bbq) items.push({ name: language === 'en' ? 'Barbecue' : 'Barbecue', qty: 1 });
    return items;
  };

  return (
    <div className=""style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', padding: '0 0' }}>
      <div className="d-flex align-items-center" >
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
          <a href="/" className="btn btn-outline-light">{t('backHome')}</a>
          <button 
            onClick={toggleLanguage} 
            className="btn btn-light"
            style={{ minWidth: '80px' }}
          >
            {language === 'en' ? 'FR' : 'EN'}
          </button>
          <a href="/login" className="btn btn-outline-light">{t('adminLogin')}</a>
        </div>
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-7">
              <div className="card shadow-lg">
                {/* Header */}
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-3 px-2 pt-3">
                    <div className="d-flex align-items-center gap-3">
                      <img src="/ess-logo.png" alt="ESS Logo" style={{ height: '60px', width: 'auto' }} />
                      <div>
                        <h2 className="mb-0 fw-bold" style={{ color: '#52009a' }}>{t('title')}</h2>
                      </div>
                    </div>
                  </div>

                  {/* Step Indicator */}
                  <div className="d-flex justify-content-center align-items-center gap-2 mt-4 px-3 ">
                    <div className="text-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mb-2 mx-auto"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: step >= 1 ? '#52009a' : '#6c757d',
                        }}
                      >
                        1
                      </div>
                      <small className={step === 1 ? 'fw-bold' : 'text-muted'} style={step === 1 ? { color: '#52009a' } : undefined}>{t('step1')}</small>
                    </div>
                    <div className="flex-grow-1" style={{ height: '2px', backgroundColor: step >= 2 ? '#52009a' : '#6c757d', marginBottom: '28px', maxWidth: '100px' }}></div>
                    <div className="text-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mb-2 mx-auto"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: step >= 2 ? '#52009a' : '#6c757d',
                        }}
                      >
                        2
                      </div>
                      <small className={step === 2 ? 'fw-bold' : 'text-muted'} style={step === 2 ? { color: '#52009a' } : undefined}>{t('step2')}</small>
                    </div>
                    <div className="flex-grow-1" style={{ height: '2px', backgroundColor: step >= 3 ? '#52009a' : '#6c757d', marginBottom: '28px', maxWidth: '100px' }}></div>
                    <div className="text-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mb-2 mx-auto"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: step >= 3 ? '#52009a' : '#6c757d',
                        }}
                      >
                        3
                      </div>
                      <small className={step === 3 ? 'fw-bold' : 'text-muted'} style={step === 3 ? { color: '#52009a' } : undefined}>{t('step3')}</small>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 pt-3 pb-2 px-2 border-top small text-muted">
                    <p className="mb-1">{t('quoteEmail')} <a href="mailto:merch@uottawaess.ca">merch@uottawaess.ca</a></p>
                    <p className="mb-0">{t('techEmail')} <a href="mailto:admin@uottawaess.ca">admin@uottawaess.ca</a></p>
                  </div>
                </div>

                {/* Form Body */}
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    {step === 1 && (
                      <>
                        {/* Step 1: Contact Information */}
                        <div className="mb-3">
                          <label htmlFor="fullName" className="form-label fw-bold">
                            {t('fullName')} <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder={language === 'en' ? 'Enter your full name' : 'Entrez votre nom complet'}
                          />
                          {errors.fullName && <div className="invalid-feedback">{t('required')}</div>}
                        </div>

                        <div className="mb-3">
                          <label htmlFor="email" className="form-label fw-bold">
                            {t('email')} <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                          />
                          {errors.email && <div className="invalid-feedback">{t('invalidEmail')}</div>}
                        </div>

                        <div className="mb-3">
                          <label htmlFor="organization" className="form-label fw-bold">
                            {t('organization')} <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${errors.organization ? 'is-invalid' : ''}`}
                            id="organization"
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                          >
                            <option value="">{language === 'en' ? 'Select an organization...' : 'Sélectionnez une organisation...'}</option>
                            {organizations.map((org) => (
                              <option key={org} value={org}>{org}</option>
                            ))}
                          </select>
                          {errors.organization && <div className="invalid-feedback">{t('required')}</div>}
                        </div>

                        {formData.organization === 'Other' && (
                          <div className="mb-3">
                            <label htmlFor="otherOrganization" className="form-label fw-bold">
                              {t('otherOrganizationLabel')} <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors.otherOrganization ? 'is-invalid' : ''}`}
                              id="otherOrganization"
                              name="otherOrganization"
                              value={formData.otherOrganization}
                              onChange={handleChange}
                              placeholder={language === 'en' ? 'Enter your organization name' : 'Entrez le nom de votre organisation'}
                            />
                            {errors.otherOrganization && <div className="invalid-feedback">{t('required')}</div>}
                          </div>
                        )}

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="startDate" className="form-label fw-bold">
                              {t('startDate')} <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                              id="startDate"
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleChange}
                            />
                            {errors.startDate && <div className="invalid-feedback">{t(errors.startDate === 'required' ? 'required' : errors.startDate)}</div>}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="endDate" className="form-label fw-bold">
                              {t('endDate')} <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                              id="endDate"
                              name="endDate"
                              value={formData.endDate}
                              onChange={handleChange}
                            />
                            {errors.endDate && <div className="invalid-feedback">{t(errors.endDate === 'required' ? 'required' : errors.endDate)}</div>}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="pickupTime" className="form-label fw-bold">
                              {t('pickupTime')} <span className="text-danger">*</span>
                            </label>
                            <input
                              type="time"
                              className={`form-control ${errors.pickupTime ? 'is-invalid' : ''}`}
                              id="pickupTime"
                              name="pickupTime"
                              value={formData.pickupTime}
                              onChange={handleChange}
                            />
                            {errors.pickupTime && <div className="invalid-feedback">{t('required')}</div>}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="dropoffTime" className="form-label fw-bold">
                              {t('dropoffTime')} <span className="text-danger">*</span>
                            </label>
                            <input
                              type="time"
                              className={`form-control ${errors.dropoffTime ? 'is-invalid' : ''}`}
                              id="dropoffTime"
                              name="dropoffTime"
                              value={formData.dropoffTime}
                              onChange={handleChange}
                            />
                            {errors.dropoffTime && <div className="invalid-feedback">{t('required')}</div>}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            {t('onCampus')} <span className="text-danger">*</span>
                          </label>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="onCampus"
                              id="onCampusYes"
                              value="yes"
                              checked={formData.onCampus === 'yes'}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="onCampusYes">
                              {t('yes')}
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="onCampus"
                              id="onCampusNo"
                              value="no"
                              checked={formData.onCampus === 'no'}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="onCampusNo">
                              {t('no')}
                            </label>
                          </div>
                          {errors.onCampus && <div className="text-danger small mt-1">{t('required')}</div>}
                        </div>

                        <div className="mb-3">
                          <label htmlFor="equipmentUsage" className="form-label fw-bold">
                            {t('equipmentUsage')} <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className={`form-control ${errors.equipmentUsage ? 'is-invalid' : ''}`}
                            id="equipmentUsage"
                            name="equipmentUsage"
                            value={formData.equipmentUsage}
                            onChange={handleChange}
                            placeholder={language === 'en' ? 'Please describe how the equipment will be used...' : 'Veuillez décrire comment l\'équipement sera utilisé...'}
                            rows="3"
                          />
                          {errors.equipmentUsage && <div className="invalid-feedback">{t('required')}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            {t('needsOnSiteAssistance')} <span className="text-danger">*</span>
                          </label>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="needsOnSiteAssistance"
                              id="assistanceYes"
                              value="yes"
                              checked={formData.needsOnSiteAssistance === 'yes'}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="assistanceYes">
                              {t('yes')}
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="needsOnSiteAssistance"
                              id="assistanceNo"
                              value="no"
                              checked={formData.needsOnSiteAssistance === 'no'}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="assistanceNo">
                              {t('no')}
                            </label>
                          </div>
                          {errors.needsOnSiteAssistance && <div className="text-danger small mt-1">{t('required')}</div>}
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        {/* Step 2: Equipment Selection */}
                        <h5 className="mb-3">{t('equipmentTitle')}</h5>
                        <p className="text-muted mb-2">{t('equipmentDescription')}</p>
                        <div className="alert alert-info mb-4">
                          <strong>{language === 'en' ? 'Note:' : 'Remarque:'}</strong> {t('equipmentNote')}
                        </div>

                        {errors.equipment && (
                          <div className="alert alert-danger">{t('selectEquipment')}</div>
                        )}

                        {/* Equipment Items */}
                        {[ { name: 'projector', label: t('projectors'), detail: '1 x Epson Projector' },
                          { name: 'amplifier', label: t('amplifiers'), detail: '1 x Ampeg BA115T' },
                        ].map((item) => (
                          <div key={item.name} className="card mb-2">
                            <div className="card-body py-3">
                              <label className="form-label fw-bold mb-2" htmlFor={item.name}>{item.label}</label>
                              <small className="text-muted d-block mb-2">{item.detail}</small>
                              <select
                                className="form-select"
                                id={item.name}
                                name={item.name}
                                value={formData[item.name]}
                                onChange={handleChange}
                              >
                                <option value={0}>0</option>
                                <option value={1}>1</option>
                              </select>
                            </div>
                          </div>
                        ))}

                        {/* Microphones */}
                        <div className="card mb-2">
                          <div className="card-body py-3">
                            <label className="form-label fw-bold mb-2" htmlFor="microphones">{t('microphones')}</label>
                            <small className="text-muted d-block mb-2">2 x Shure SM58</small>
                            <select
                              className="form-select"
                              id="microphones"
                              name="microphones"
                              value={formData.microphones}
                              onChange={handleChange}
                            >
                              <option value={0}>0</option>
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                            </select>
                          </div>
                        </div>

                        {/* Microphone Stands */}
                        <div className="card mb-2">
                          <div className="card-body py-3">
                            <label className="form-label fw-bold mb-2" htmlFor="microphoneStands">{t('microphoneStands')}</label>
                            <small className="text-muted d-block mb-2">2 x Yorkville MS608B</small>
                            <small className="text-muted d-block mb-2">{language === 'en' ? '(Will be loaned based on number of microphones requested)' : '(Prêts en fonction du nombre de microphones demandés)'}</small>
                            <select
                              className="form-select"
                              id="microphoneStands"
                              name="microphoneStands"
                              value={formData.microphoneStands}
                              onChange={handleChange}
                            >
                              <option value={0}>0</option>
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                            </select>
                          </div>
                        </div>

                        {/* Speakers */}
                        <div className="card mb-2">
                          <div className="card-body py-3">
                            <label className="form-label fw-bold mb-2" htmlFor="speakers">{t('speakers')}</label>
                            <small className="text-muted d-block mb-2">2 x Yorkville PS12P</small>
                            <small className="text-muted d-block mb-2">{language === 'en' ? 'Input: Mic (XLR), Line (XLR), 3.5mm, TRS | Output: Link (XLR)' : 'Entrée: Mic (XLR), Line (XLR), 3.5mm, TRS | Sortie: Link (XLR)'}</small>
                            <select
                              className="form-select"
                              id="speakers"
                              name="speakers"
                              value={formData.speakers}
                              onChange={handleChange}
                            >
                              <option value={0}>0</option>
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                            </select>
                          </div>
                        </div>

                        {/* Speaker Stands */}
                        <div className="card mb-2">
                          <div className="card-body py-3">
                            <label className="form-label fw-bold mb-2" htmlFor="speakerStands">{t('speakerStands')}</label>
                            <small className="text-muted d-block mb-2">{t('speakerStandsNote')}</small>
                            <select
                              className="form-select"
                              id="speakerStands"
                              name="speakerStands"
                              value={formData.speakerStands}
                              onChange={handleChange}
                            >
                              <option value={0}>0</option>
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                            </select>
                          </div>
                        </div>

                        {/* Subwoofers */}
                        <div className="card mb-2">
                          <div className="card-body py-3">
                            <label className="form-label fw-bold mb-2" htmlFor="subwoofers">{t('subwoofers')}</label>
                            <small className="text-muted d-block mb-2">2 x Yorkville PSA1S</small>
                            <select
                              className="form-select"
                              id="subwoofers"
                              name="subwoofers"
                              value={formData.subwoofers}
                              onChange={handleChange}
                            >
                              <option value={0}>0</option>
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                            </select>
                          </div>
                        </div>

                        {/* Audio Mixer */}
                        <div className="card mb-2">
                          <div className="card-body py-3">
                            <label className="form-label fw-bold mb-2" htmlFor="mixer">{t('audioMixer')}</label>
                            <small className="text-muted d-block mb-2">1 x Allen & Heath W4 16:2</small>
                            <select
                              className="form-select"
                              id="mixer"
                              name="mixer"
                              value={formData.mixer}
                              onChange={handleChange}
                            >
                              <option value={0}>0</option>
                              <option value={1}>1</option>
                            </select>
                          </div>
                        </div>

                        {/* BBQ */}
                        <div className="card mb-2 border-warning">
                          <div className="card-body py-3">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="bbq"
                                id="bbq"
                                checked={formData.bbq}
                                onChange={handleChange}
                              />
                              <label className="form-check-label" htmlFor="bbq">
                                <strong>{t('bbq')}</strong>
                                <br />
                                <small className="text-muted">{t('bbqModel')}</small>
                              </label>
                            </div>
                            {formData.bbq && (
                              <div className="mt-3 pt-3 border-top">
                                <div className="alert alert-warning mb-3">
                                  <strong>{t('bbqNoteTitle')}</strong> {language === 'en' ? 'By borrowing the barbecue, please agree to all of the following terms:' : 'En empruntant le barbecue, veuillez accepter tous les termes suivants:'}
                                </div>
                                
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="bbqTerms1"
                                      name="bbqTerm1"
                                      checked={formData.bbqTerm1}
                                      onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="bbqTerms1">
                                      {language === 'en' ? 'Accept the terms of the uOttawa ' : 'Acceptez les conditions g\u00e9n\u00e9rales des '}
                                      <a href="https://www.uottawa.ca/about-us/reservations/events-reservations-policies" target="_blank" rel="noopener noreferrer">
                                        {language === 'en' ? 'Conventions and Reservations' : 'congr\u00e8s et r\u00e9servations d\'uOttawa'}
                                      </a>
                                    </label>
                                  </div>
                                  <div className="form-check mt-2">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="bbqTerms2"
                                      name="bbqTerm2"
                                      checked={formData.bbqTerm2}
                                      onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="bbqTerms2">
                                      {language === 'en' ? 'Always grill on top of the provided (ESS owned) silicone mat' : 'Toujours faire cuire vos aliments sur le tapis en silicone fourni (appartenant \u00e0 l\'A\u00c9G)'}
                                    </label>
                                  </div>
                                  <div className="form-check mt-2">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="bbqTerms3"
                                      name="bbqTerm3"
                                      checked={formData.bbqTerm3}
                                      onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="bbqTerms3">
                                      {language === 'en' ? 'Contact Protection Services to borrow a fire extinguisher' : 'Contacter les services de protection pour emprunter un extincteur de feu'}
                                    </label>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-top">
                                  <label className="form-label fw-bold">
                                    {language === 'en' ? 'Will you supply your own propane?' : 'Fournirez-vous votre propre propane?'}
                                  </label>
                                  <p className="text-muted small mb-2">
                                    {language === 'en' ? 'The ESS/AÉG can provide propane with a flat rate of $150.00 CAD' : 'L\'AÉG/ESS peut fournir du propane au tarif fixe de 150,00 $ CAD'}
                                  </p>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="bbqPropane"
                                      id="bbqPropaneYes"
                                      value="yes"
                                      checked={formData.bbqPropane === 'yes'}
                                      onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="bbqPropaneYes">
                                      {language === 'en' ? 'Yes, I will supply my own propane' : 'Oui, je fournirai mon propre propane'}
                                    </label>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="bbqPropane"
                                      id="bbqPropaneNo"
                                      value="no"
                                      checked={formData.bbqPropane === 'no'}
                                      onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="bbqPropaneNo">
                                      {language === 'en' ? 'No, I would like ESS/AÉG to provide propane ($150.00 CAD)' : 'Non, je souhaite que l\'AÉG/ESS fournisse le propane (150,00 $ CAD)'}
                                    </label>
                                  </div>
                                </div>

                                <div className="form-check mt-3 pt-2 border-top">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="bbqTermsAccepted"
                                    id="bbqTerms"
                                    checked={formData.bbqTermsAccepted}
                                    onChange={handleChange}
                                  />
                                  <label className="form-check-label" htmlFor="bbqTerms">
                                    {t('bbqTermsAccept')}
                                  </label>
                                </div>
                                {errors.bbqTermsAccepted && <div className="text-danger small mt-2">{t('acceptBbqTerms')}</div>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Final Comments */}
                        <div className="mb-3">
                          <label htmlFor="finalComments" className="form-label fw-bold">
                            {t('finalComments')}
                          </label>
                          <textarea
                            className="form-control"
                            id="finalComments"
                            name="finalComments"
                            value={formData.finalComments}
                            onChange={handleChange}
                            placeholder={language === 'en' ? 'Enter any additional comments or requests...' : 'Entrez des commentaires ou demandes supplémentaires...'}
                            rows="2"
                          />
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        {/* Step 3: Contract */}
                        <div className="row">
                          <div className="col-lg-8">
                            <h5 className="mb-3 text-center">{t('contractTitle')}</h5>
                            <div className="contract-container" style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '1.5rem', backgroundColor: '#f8f9fa' }}>
                          {language === 'en' ? (
                            <div>
                              <p className="text-center fw-bold mb-3">{getTodayFormatted()}</p>
                              <h6 className="fw-bold">EQUIPMENT RENTAL AGREEMENT</h6>
                              <p><strong>RENT AND REGISTRATION.</strong> The rent for the Equipment will be subject to the Vice President of Services per item, per day (the "Rent") and the Rent will be paid prior to the Renter taking possession of the Equipment.</p>
                              <p><strong>TERM.</strong> The Agreement commences on {formatDate(formData.startDate) || '<<start>>'} and will continue until {formatDate(formData.endDate) || '<<end>>'} (the "Term").</p>
                              <p><strong>REPAIR AND MAINTENANCE.</strong> The Renter will use the Equipment in a good and careful manner and will comply with all of the manufacturer's requirements and recommendations respecting the Equipment and with any applicable law, whether local, state or federal respecting the use of the Equipment, including, but not limited to, environmental and copyright law. The Renter will use the Equipment for the purpose for which it was designed and not for any other purpose.</p>
                              <p><strong>WARRANTIES.</strong> The Equipment will be in good working order and good condition upon delivery. The Equipment is of merchantable quality and is fit for the following purpose: events, extracurriculars, etc.</p>
                              <p><strong>LOSS AND DAMAGE.</strong> If the Equipment is lost or damaged, the Renter will continue paying Rent, will provide the Owner with prompt written notice of such loss or damage and will, if the Equipment is repairable, put or cause the Equipment to be put in a state of good repair, appearance and condition.</p>
                              <p><strong>SURRENDER.</strong> At the end of the Term or upon earlier termination of this Agreement, the Renter will return the Equipment at the Renter's cost, expense and risk to the Owner by delivering the Equipment to A05 - 161 Louis-Pasteur Private, Ottawa, Ontario, K1N 6N5. If the Renter fails to return the Equipment to the Owner at the end of the Term or any earlier termination of this Agreement, the Renter will pay to the Owner any unpaid Rent for the Term plus 1.5 times the rental fee per day.</p>
                              <p><strong>NOTICE TO RENTER.</strong> This is a lease. You are not buying the equipment. Do not sign this Agreement before you read it. You are entitled to a completed copy of this Agreement when you sign it.</p>
                              <p><strong>CONTACT INFORMATION.</strong> The owner will contact the renter using the following information. Should there be a lack of communication and accessibility, the renter will no longer be eligible to rent from the owner.</p>
                              <p className="mt-4">By agreeing to rent from the Engineering Students' Society, you (the "renter"), agree to the following as specified above.</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-center fw-bold mb-3">{getTodayFormatted()}</p>
                              <h6 className="fw-bold">CONTRAT DE LOCATION D'ÉQUIPEMENT</h6>
                              <p><strong>LOYER ET INSCRIPTION.</strong> Le loyer pour l'équipement sera soumis au vice-président des services par article, par jour (le « loyer ») et le loyer sera payé avant que le locataire prenne possession de l'équipement.</p>
                              <p><strong>DURÉE.</strong> L'accord commence au {formatDate(formData.startDate) || '<<start>>'} et se poursuivra jusqu'à la {formatDate(formData.endDate) || '<<end>>'} (la « durée »).</p>
                              <p><strong>RÉPARATION ET ENTRETIEN.</strong> Le locataire utilisera l'équipement de manière soignée et prudente et se conformera à toutes les exigences et recommandations du fabricant concernant l'équipement ainsi qu'à toute loi applicable, qu'elle soit locale, étatique ou fédérale, incluant, mais sans s'y limiter, les lois environnementales et de droit d'auteur. Le locataire utilisera l'équipement uniquement pour les fins pour lesquelles il a été conçu et non à d'autres fins.</p>
                              <p><strong>GARANTIES.</strong> L'équipement sera en bon état de fonctionnement et en bonne condition lors de la livraison. L'équipement est de qualité marchande et adapté pour les fins suivantes : événements, activités parascolaires, etc.</p>
                              <p><strong>PERTE ET DOMMAGE.</strong> Si l'équipement est perdu ou endommagé, le locataire continuera de payer le loyer, fournira au propriétaire un avis écrit immédiat de cette perte ou de ce dommage et, si l'équipement est réparable, le remettra ou fera en sorte que l'équipement soit remis en bon état de fonctionnement, d'apparence et de condition.</p>
                              <p><strong>REMISE.</strong> À la fin de la durée ou lors de la résiliation anticipée de cet accord, le locataire restituera l'équipement au propriétaire, à ses frais, dépenses et risques, en livrant l'équipement à A05 - 161 Louis-Pasteur Private, Ottawa, Ontario, K1N 6N5. Si le locataire ne retourne pas l'équipement au propriétaire à la fin de la durée ou lors d'une résiliation anticipée de cet accord, le Locataire paiera au propriétaire tout loyer impayé pour la durée plus 1,5 fois les frais de loyer par jour.</p>
                              <p><strong>AVIS AU LOCATAIRE.</strong> Ceci est une location. Vous n'achetez pas l'équipement. Ne signez pas cet accord avant de l'avoir lu. Vous avez droit à une copie complète de cet Accord lorsque vous le signez.</p>
                              <p><strong>COORDONÉES.</strong> Le propriétaire contactera le locataire en utilisant les informations suivantes. En cas de manque de communication et d'accessibilité, le Locataire ne sera plus éligible pour louer auprès du propriétaire.</p>
                              <p className="mt-4">En acceptant de louer auprès de l'Association des étudiants en génie, vous (le « locataire ») acceptez les conditions suivantes, telles que spécifiées ci-dessus.</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="form-check mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="contractAccepted"
                            id="contractAccepted"
                            checked={formData.contractAccepted}
                            onChange={handleChange}
                          />
                          <label className="form-check-label fw-bold" htmlFor="contractAccepted">
                            {t('contractAcceptLabel')} <span className="text-danger">*</span>
                          </label>
                        </div>
                        {errors.contractAccepted && <div className="text-danger small mt-2">{t('acceptContract')}</div>}

                        {/* Signature Section */}
                        <div className="mt-4 pt-4 border-top">
                          <h3 className="fw-bold mb-3">{t('signatureSection')}</h3>
                          
                          <div className="mb-3">
                            <label htmlFor="signatureName" className="form-label fw-bold">
                              {t('typeName')} <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors.signatureName ? 'is-invalid' : ''}`}
                              id="signatureName"
                              name="signatureName"
                              value={formData.signatureName}
                              onChange={handleChange}
                              placeholder={language === 'en' ? 'John Doe' : 'Jean Dupont'}
                            />
                            {errors.signatureName && <div className="invalid-feedback">{t('nameRequired')}</div>}
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              {t('drawSignature')} <span className="text-danger">*</span>
                            </label>
                            <div className="w-100">
                              <canvas
                                ref={canvasRef}
                                height={150}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                style={{
                                  border: errors.signatureData ? '2px solid #dc3545' : '1px solid #dee2e6',
                                  borderRadius: '0.25rem',
                                  cursor: 'crosshair',
                                  backgroundColor: '#fff',
                                  display: 'block',
                                  maxWidth: '100%',
                                  height: 'auto'
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary mt-2"
                              onClick={clearCanvas}
                            >
                              {t('clearSignature')}
                            </button>
                            {errors.signatureData && <div className="text-danger small mt-1">{t('signatureRequired')}</div>}
                          </div>

                          <div className="mb-3">
                            <label htmlFor="signatureDate" className="form-label fw-bold">
                              {t('signatureDate')} <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className={`form-control ${errors.signatureDate ? 'is-invalid' : ''}`}
                              id="signatureDate"
                              name="signatureDate"
                              value={formData.signatureDate}
                              onChange={handleChange}
                            />
                            {errors.signatureDate && <div className="invalid-feedback">{t('dateRequired')}</div>}
                          </div>
                        </div>
                      </div>
                      
                      {/* Equipment Summary Sidebar */}
                      <div className="col-lg-4">
                        <div className="card sticky-top" style={{ top: '20px' }}>
                          <div className="card-header bg-primary text-white" style={{ backgroundColor: '#52009a' }}>
                            <h6 className="mb-0 fw-bold">{t('equipmentSummary')}</h6>
                          </div>
                          <div className="card-body">
                            {getEquipmentList().length > 0 ? (
                              <ul className="list-unstyled mb-0">
                                {getEquipmentList().map((item, index) => (
                                  <li key={index} className="mb-2 d-flex justify-content-between">
                                    <span>{item.name}</span>
                                    <span className="badge bg-secondary">{item.qty}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted mb-0">{language === 'en' ? 'No equipment selected' : 'Aucun équipement sélectionné'}</p>
                            )}
                          </div>
                          <div className="card-footer text-muted small">
                            <div className="mb-1"><strong>{language === 'en' ? 'Rental Period:' : 'Période de location:'}</strong></div>
                            <div>{formatDate(formData.startDate) || '—'}</div>
                            <div>{language === 'en' ? 'to' : 'à'}</div>
                            <div>{formatDate(formData.endDate) || '—'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                      </>
                    )}

                    {/* Form Actions */}
                    <div className="d-flex gap-2 justify-content-end mt-4">
                      {(step === 2 || step === 3) && (
                        <button type="button" className="btn btn-secondary" onClick={handleBack}>
                          {t('back')}
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary btn-ess-purple">
                        {step === 3 ? t('submit') : t('next')}
                      </button>
                    </div>

                    <p className="text-muted text-center small mt-3 mb-2">{t('disclaimer')}</p>
                    <p className="text-muted text-center small mb-0" style={{ fontSize: '0.75rem' }}>© 2025–2026 Cyrus Choi. All rights reserved.</p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquipmentForm;
