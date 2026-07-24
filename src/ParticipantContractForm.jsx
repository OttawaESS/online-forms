import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useLanguage } from './LanguageContext';

const contractType = '101-week-contract';

function getDefaultRsg1(language) {
  return language === 'fr'
    ? 'Association des étudiant·e·s en génie'
    : 'Engineering Students Society';
}

const copy = {
  en: {
    title: '101 Week Participant Contract & Waiver',
    subtitle: 'Capture participant details, emergency information, and agreement acknowledgements for 101 Week.',
    backHome: '← Home',
    adminLogin: 'Admin Login',
    languageToggle: 'FR',
    bioTitle: 'Biographical Information',
    emergencyTitle: 'Emergency Contact',
    agreementsTitle: 'Agreement Acknowledgements',
    signatureTitle: 'Signature Page',
    participantTitle: 'Participant Signature',
    guardianTitle: 'Parent / Legal Guardian Signature',
    under18Label: 'Participant is under 18',
    under18Note: 'This status is calculated automatically from the date of birth entered below.',
    participantNote: 'This page logs the participant details and acknowledgement of the 101 Week terms.',
    guardianNote: 'Required only when the participant is under 18.',
    firstName: 'First name',
    lastName: 'Last name',
    dateOfBirth: 'Date of birth',
    pronouns: 'Pronouns',
    languages: 'Language(s)',
    program: 'Program',
    rsg1: 'Recognized Student Government (RSG) 1',
    rsg2: 'Recognized Student Government (RSG) 2',
    email: 'Email',
    phone: 'Phone number',
    medicalRestrictions: 'Relevant medical restrictions / limitations / information',
    accessibilityRequests: 'Accessibility requests',
    emergencyName: 'Emergency contact name',
    emergencyPhone: 'Emergency contact phone number',
    emergencyRelationship: 'Relationship',
    participantLegalName: 'Full legal name',
    guardianLegalName: 'Full legal name',
    signatureDate: 'Date (YYYY-MM-DD)',
    clearSignature: 'Clear signature',
    submit: 'Submit Contract',
    saving: 'Saving...',
    successTitle: 'Submission successful',
    successMessage: 'The 101 Week contract has been logged successfully.',
    close: 'Close',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    signatureRequired: 'Please provide a signature',
    agreementsRequired: 'Please confirm all agreement sections',
    guardianRequired: 'Parent / legal guardian information is required for participants under 18',
    codeTitle: 'UOSU 101 Week Code (POL-GEN 5)',
    codeSummary: 'I have read and agree to be bound by the official 101 Week Code.',
    bagTitle: 'Bag Checks',
    bagSummary: 'I consent to bag checks at 101 Week events by authorized UOSU personnel or volunteers.',
    insuranceTitle: 'Insurance and Medical Disclaimer',
    insuranceSummary: 'I understand UOSU does not provide medical or liability insurance and that I am responsible for my own coverage.',
    miscTitle: 'Miscellaneous',
    miscSummary: 'I agree to the photo/video, Ontario law, wristband, shirt, and transportation conditions described in the contract.',
    waiverTitle: 'Waiver, Release, and Indemnity',
    waiverSummary: 'I understand the waiver affects my legal rights and I agree to the release and indemnity terms.',
    guardianAgreement: 'Parent / legal guardian agrees to the waiver terms for the minor participant.',
  },
  fr: {
    title: 'Contrat et renonciation pour les participants de la Semaine 101',
    subtitle: 'Consignez les renseignements du participant, les contacts d’urgence et les confirmations d’accord pour la Semaine 101.',
    backHome: '← Accueil',
    adminLogin: 'Connexion Admin',
    languageToggle: 'EN',
    bioTitle: 'Informations biographiques',
    emergencyTitle: 'Personne contact en cas d’urgence',
    agreementsTitle: 'Accusés de réception',
    signatureTitle: 'Page de signature',
    participantTitle: 'Signature de la personne participante',
    guardianTitle: 'Signature du parent / tuteur légal',
    under18Label: 'La personne participante a moins de 18 ans',
    under18Note: 'Ce statut est calculé automatiquement à partir de la date de naissance saisie ci-dessous.',
    participantNote: 'Cette page consigne les renseignements du participant et les confirmations des conditions de la Semaine 101.',
    guardianNote: 'Obligatoire seulement si la personne participante a moins de 18 ans.',
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    dateOfBirth: 'Date de naissance',
    pronouns: 'Pronoms',
    languages: 'Langue(s)',
    program: 'Programme',
    rsg1: 'Gouvernement étudiant reconnu (GÉR) 1',
    rsg2: 'Gouvernement étudiant reconnu (GÉR) 2',
    email: 'Courriel',
    phone: 'Numéro de téléphone',
    medicalRestrictions: 'Restrictions / limitations / informations médicales pertinentes',
    accessibilityRequests: 'Demandes d’accessibilité',
    emergencyName: 'Nom du contact d’urgence',
    emergencyPhone: 'Numéro de téléphone du contact d’urgence',
    emergencyRelationship: 'Relation',
    participantLegalName: 'Nom légal complet',
    guardianLegalName: 'Nom légal complet',
    signatureDate: 'Date (AAAA-MM-JJ)',
    clearSignature: 'Effacer la signature',
    submit: 'Soumettre le contrat',
    saving: 'Enregistrement...',
    successTitle: 'Soumission réussie',
    successMessage: 'Le contrat de la Semaine 101 a été enregistré avec succès.',
    close: 'Fermer',
    required: 'Ce champ est obligatoire',
    invalidEmail: 'Veuillez entrer une adresse courriel valide',
    signatureRequired: 'Veuillez fournir une signature',
    agreementsRequired: 'Veuillez confirmer toutes les sections d’accord',
    guardianRequired: 'Les renseignements du parent / tuteur légal sont obligatoires pour les participants de moins de 18 ans',
    codeTitle: 'Code de la Semaine 101 du SÉUO (POL-GEN 5)',
    codeSummary: 'J’ai lu et j’accepte d’être lié·e par le Code officiel de la Semaine 101.',
    bagTitle: 'Contrôle des sacs',
    bagSummary: 'Je consens aux contrôles de sacs aux événements de la Semaine 101 par du personnel ou des bénévoles autorisés du SÉUO.',
    insuranceTitle: 'Avis de non-responsabilité en matière d’assurance et médical',
    insuranceSummary: 'Je comprends que le SÉUO ne fournit pas d’assurance médicale ou responsabilité civile et que je suis responsable de ma propre couverture.',
    miscTitle: 'Conditions diverses',
    miscSummary: 'J’accepte les conditions relatives aux photos, vidéos, aux lois de l’Ontario, au bracelet, au chandail et au transport décrites dans le contrat.',
    waiverTitle: 'Renonciation, décharge et indemnité',
    waiverSummary: 'Je comprends que la renonciation a une incidence sur mes droits légaux et j’accepte les modalités de décharge et d’indemnité.',
    guardianAgreement: 'Le parent / tuteur légal accepte les conditions de renonciation pour le participant mineur.',
  },
};

const agreementKeys = ['code', 'bag', 'insurance', 'misc', 'waiver'];

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isUnder18FromDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) {
    return false;
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age < 18;
}

function TextField({ id, label, value, onChange, error, required = false, type = 'text', placeholder = '' }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">
        {label}{required ? ' *' : ''}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

function TextAreaField({ id, label, value, onChange, error, rows = 3, placeholder = '' }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">{label}</label>
      <textarea
        id={id}
        name={id}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}

function renderClauseText(text, clauseId, partIndex, partType) {
  const referenceBase = `${clauseId}-${partType}-${partIndex}`;
  const parts = [];
  const pattern = /(https?:\/\/[^\s)]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

  const emphasizeUppercaseTokens = (value) => {
    const tokens = value.match(/\s+|\S+/g) || [];

    return tokens.map((token, index) => {
      if (/^\s+$/.test(token)) {
        return token;
      }

      const lettersOnly = token.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '');
      const isUppercase = lettersOnly.length > 0 && lettersOnly === lettersOnly.toUpperCase();

      return isUppercase
        ? <strong key={`${referenceBase}-upper-${partIndex}-${index}`}>{token}</strong>
        : token;
    });
  };

  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const value = match[0];
    const isEmail = value.includes('@');
    const href = isEmail ? `mailto:${value}` : value;

    parts.push(
      <a
        key={`${referenceBase}-${match.index}`}
        href={href}
        target={isEmail ? undefined : '_blank'}
        rel={isEmail ? undefined : 'noreferrer'}
        data-clause-reference={referenceBase}
        data-clause-value={value}
        onClick={(event) => event.stopPropagation()}
      >
        {value}
      </a>
    );

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(...emphasizeUppercaseTokens(text.slice(lastIndex)));
  }

  return parts;
}

function FileField({ id, label, onChange, inputRef, files = [], accept = '', helperText = '' }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">{label}</label>
      <input
        id={id}
        ref={inputRef}
        name={id}
        type="file"
        className="form-control"
        onChange={onChange}
        accept={accept}
        multiple
      />
      {helperText && <div className="form-text">{helperText}</div>}
      {files.length > 0 && (
        <ul className="list-group list-group-flush mt-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="list-group-item px-0 py-2 small d-flex justify-content-between gap-3">
              <span className="text-truncate">{file.name}</span>
              <span className="text-muted text-nowrap">{file.type || 'file'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AgreementCard({ id, title, summary, checked, onChange, error }) {
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        <div className="form-check mb-2">
          <input
            id={id}
            name={id}
            className={`form-check-input ${error ? 'is-invalid' : ''}`}
            type="checkbox"
            checked={checked}
            onChange={onChange}
          />
          <label className="form-check-label fw-semibold" htmlFor={id}>
            {title}
          </label>
        </div>
        <p className="mb-0 text-muted small">{summary}</p>
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>
    </div>
  );
}

function ContractSection({ id, title, paragraphs = [], bullets = [], checked, onChange, error, signatureNote = '' }) {
  const handleSectionClick = (event) => {
    const interactiveElement = event.target.closest('a, button, input, textarea, select, label');
    if (interactiveElement) {
      return;
    }

    onChange({
      target: {
        name: id,
        type: 'checkbox',
        checked: !checked,
      },
    });
  };

  const handleSectionKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange({
        target: {
          name: id,
          type: 'checkbox',
          checked: !checked,
        },
      });
    }
  };

  return (
    <div
      className="card shadow-sm mb-3"
      role="button"
      tabIndex={0}
      onClick={handleSectionClick}
      onKeyDown={handleSectionKeyDown}
      style={{
        cursor: 'pointer',
        border: checked ? '2px solid #52009a' : '1px solid rgba(82, 0, 154, 0.14)',
        backgroundColor: checked ? '#fbf7ff' : '#fff',
      }}
    >
      <div className="card-body">
        <div className="form-check mb-3">
          <input
            id={id}
            name={id}
            className={`form-check-input ${error ? 'is-invalid' : ''}`}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            onClick={(event) => event.stopPropagation()}
          />
          <span className="form-check-label fw-semibold" style={{ userSelect: 'none' }}>
            {title}
          </span>
        </div>

        <div className="small text-body-secondary lh-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={index === paragraphs.length - 1 && bullets.length === 0 ? 'mb-0' : 'mb-3'} style={{ whiteSpace: 'pre-wrap' }}>
              {renderClauseText(paragraph, id, index, 'paragraph')}
            </p>
          ))}

          {bullets.length > 0 && (
            <ul className="mb-0 ps-4">
              {bullets.map((bullet, index) => (
                <li key={index} className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {renderClauseText(bullet, id, index, 'bullet')}
                </li>
              ))}
            </ul>
          )}

          {signatureNote && <p className="mt-3 mb-0 fw-semibold">{signatureNote}</p>}
        </div>

        {error && <div className="invalid-feedback d-block mt-2">{error}</div>}
      </div>
    </div>
  );
}

function SignatureBlock({ label, note, intro, canvasRef, dateFieldName, dateValue, onDateChange, error, dateError, clearLabel, children }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current || !wrapperRef.current) {
        return;
      }

      const canvas = canvasRef.current.getCanvas();
      if (!canvas) {
        return;
      }

      const width = Math.max(wrapperRef.current.clientWidth, 320);
      const height = 220;
      const ratio = window.devicePixelRatio || 1;

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext('2d');
      if (context) {
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      }

      canvasRef.current.clear();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [canvasRef]);

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title">{label}</h5>
        <p className="text-muted small">{note}</p>
        {intro && <div className="alert alert-warning small lh-lg mb-3" style={{ whiteSpace: 'pre-wrap' }}>{intro}</div>}
        {children}
        <div ref={wrapperRef} style={{ border: '1px solid #cfd4da', borderRadius: '0.5rem', overflow: 'hidden', background: '#fff', width: '100%', minHeight: '220px' }}>
          <SignatureCanvas
            ref={canvasRef}
            canvasProps={{
              className: 'sigCanvas',
              style: {
                width: '100%',
                height: '220px',
                display: 'block'
              }
            }}
            backgroundColor="white"
          />
        </div>
        {error && <div className="text-danger small mt-2">{error}</div>}
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mt-3">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => canvasRef.current && canvasRef.current.clear()}>
            {clearLabel}
          </button>
          <div className="flex-grow-1 ms-0 ms-md-3" style={{ minWidth: '220px' }}>
            <input
              id={dateFieldName}
              name={dateFieldName}
              type="date"
              className={`form-control ${dateError ? 'is-invalid' : ''}`}
              value={dateValue}
              onChange={onDateChange}
            />
            {dateError && <div className="invalid-feedback">{dateError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractIntro({ text }) {
  return (
    <div className="card border-0 bg-light mb-3 shadow-sm">
      <div className="card-body">
        <p className="mb-0 text-body-secondary lh-lg" style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h3 className="h5 mb-1" style={{ color: '#52009a' }}>{title}</h3>
      {subtitle && <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-wrap' }}>{subtitle}</p>}
    </div>
  );
}

function GuardianPrompt({ text }) {
  return (
    <div className="card border-0 bg-white shadow-sm mb-3">
      <div className="card-body">
        <p className="mb-0 text-body-secondary lh-lg" style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
      </div>
    </div>
  );
}

function SignatureIntro({ language }) {
  if (language === 'en') {
    return (
      <div className="card border-0 bg-light mb-3 shadow-sm">
        <div className="card-body">
          {/* <p className="mb-3"><strong>SIGNATURE PAGE</strong></p> */}
          <p className="mb-3"><strong>THIS WAIVER AFFECTS YOUR LEGAL RIGHTS.</strong> You must read it carefully. If you do not wish to waive your legal rights, do not sign this waiver and do not participate in these activities.</p>
          <p className="mb-3">I, hereinafter referred to as “the Participant”, <strong>HEREBY AGREE AND ACKNOWLEDGE</strong> having read, understood, and agreed to all terms and conditions contained in the following codes, policies, release, waiver, and otherwise of the University of Ottawa Student Union:</p>
          <ul className="mb-3 ps-4">
            <li className="mb-2"><strong>(a) UOSU 101 Week Code;</strong></li>
            <li className="mb-2"><strong>(b) Bag Checks Policy;</strong></li>
            <li className="mb-2"><strong>(c) Insurance and Medical Disclaimer;</strong></li>
            <li className="mb-2"><strong>(d) Miscellaneous; and</strong></li>
            <li className="mb-0"><strong>(e) Waiver, Release and Indemnity for 101 Week.</strong></li>
          </ul>
          <p className="mb-3">The Participant <strong>FURTHER AGREES AND ACKNOWLEDGES</strong> that copies of the above-listed waivers are available online at <a href="https://www.seuo-uosu.com/student-life/101-week" target="_blank" rel="noreferrer" data-clause-reference="signature-intro-en" data-clause-value="https://www.seuo-uosu.com/student-life/101-week" onClick={(event) => event.stopPropagation()}>https://www.seuo-uosu.com/student-life/101-week</a> and have been attached to the Signature Page.</p>
          <p className="mb-0"><strong>I HAVE READ AND UNDERSTOOD THIS WAIVER</strong> and agree to all conditions contained therein.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 bg-light mb-3 shadow-sm">
      <div className="card-body">
        <p className="mb-3"><strong>PAGE DE SIGNATURE</strong></p>
        <p className="mb-3"><strong>CE RENONCIATION A UNE INCIDENCE SUR VOS DROITS LÉGAUX.</strong> LISEZ-LE ATTENTIVEMENT. SI VOUS NE SOUHAITEZ PAS RENONCER À VOS DROITS LÉGAUX, NE SIGNEZ PAS CETTE RENONCIATION ET NE PARTICIPEZ PAS À CES ACTIVITÉS.</p>
        <p className="mb-3">Je, ci-après « la personne participante », <strong>ACCEPTE ET RECONNAIS</strong> avoir lu, compris et accepté toutes les conditions contenues dans les codes, politiques, la renonciation et les autres modalités du Syndicat étudiant de l’Université d’Ottawa :</p>
        <ul className="mb-3 ps-4">
          <li className="mb-2"><strong>(a) le Code de la Semaine 101 du SÉUO;</strong></li>
          <li className="mb-2"><strong>(b) la Politique de contrôle des sacs;</strong></li>
          <li className="mb-2"><strong>(c) l’Avis de non-responsabilité en matière d’assurance et médical;</strong></li>
          <li className="mb-2"><strong>(d) les Conditions diverses; et</strong></li>
          <li className="mb-0"><strong>(e) la Renonciation, décharge et indemnité pour la Semaine 101.</strong></li>
        </ul>
        <p className="mb-3">La personne participante <strong>ACCEPTE ET RECONNAÎT</strong> que des copies des renonciations susmentionnées sont disponibles en ligne à <a href="https://www.seuo-uosu.com/fr/student-life/101-week" target="_blank" rel="noreferrer" data-clause-reference="signature-intro-fr" data-clause-value="https://www.seuo-uosu.com/fr/student-life/101-week" onClick={(event) => event.stopPropagation()}>https://www.seuo-uosu.com/fr/student-life/101-week</a> et ont été jointes à la page de signature.</p>
        <p className="mb-0"><strong>J’AI LU ET COMPRIS CETTE RENONCIATION</strong> et j’accepte toutes les conditions qu’elle contient.</p>
      </div>
    </div>
  );
}

function getAgreementItems(language) {
  if (language === 'fr') {
    return [
      {
        id: 'code',
        title: '(a) CODE DE LA SEMAINE 101 DU SÉUO (POL-GEN-05)',
        paragraphs: [
          'LA PERSONNE PARTICIPANTE ACCEPTE ET RECONNAÎT PAR LA PRÉSENTE avoir lu le Code de la Semaine 101 officiel.',
          'Une copie du règlement susmentionné du Syndicat étudiant de l’Université d’Ottawa est disponible pour examen :',
          '(i) À l’adresse : https://www.seuo-uosu.com/fr/student-life/101-week',
          '(ii) Sur demande au bureau du SÉUO, situé au 85, rue Université, pièce 07, Ottawa, ON, K1N 8Z4',
          '(iii) Sur demande à studentlife@seuo-uosu.com',
          'LA PERSONNE PARTICIPANTE COMPREND PAR LA PRÉSENTE qu’un manquement au Code de la Semaine 101 peut entraîner son exclusion immédiate de tous les événements de la Semaine 101.',
          'LA PERSONNE PARTICIPANTE ACCEPTE PAR LA PRÉSENTE de se conformer au Code de la Semaine 101 du SÉUO.',
        ],
        signatureNote: 'En signant la page de signature ci-dessous, LA PERSONNE PARTICIPANTE accepte de se conformer au Code de la Semaine 101 du SÉUO.',
      },
      {
        id: 'bag',
        title: '(b) CONTRÔLE DES SACS',
        paragraphs: [
          'LA PERSONNE PARTICIPANTE ACCEPTE ET RECONNAÎT PAR LA PRÉSENTE que des contrôles de sacs peuvent être effectués tout au long de la Semaine 101.',
          'LA PERSONNE PARTICIPANTE ACCEPTE ET RECONNAÎT EXPRESSÉMENT que, par sa participation volontaire à tout événement, elle consent à ce que son ou ses sacs soient contrôlés à l’entrée des événements de la Semaine 101 par le personnel ou les bénévoles autorisé·e·s du SÉUO. La personne participante consent, par sa participation volontaire à tout événement, à ce que son ou ses sacs soient contrôlés à la demande de l’équipe de la Semaine 101 du SÉUO, des ambassadeur·drice·s pour la sécurité et des guides des gouvernements étudiants reconnus du SÉUO durant tout événement.',
          'LA PERSONNE PARTICIPANTE ACCEPTE ET RECONNAÎT EXPRESSÉMENT que tout objet trouvé durant le contrôle des sacs qui est considéré comme une violation ou une violation potentielle de toute loi applicable, du Code de la Semaine 101 ou des règlements établis par l’Université d’Ottawa ou par l’établissement dans lequel l’événement de la Semaine 101 a lieu, entraînera le refus d’entrée, l’expulsion de l’événement et/ou la confiscation d’objets (conformément à la loi applicable) de la personne participante à la Semaine 101. Toute violation peut entraîner l’exclusion de la personne participante de toute participation à d’autres événements de la Semaine 101.',
          'La personne participante a le droit de refuser un contrôle des sacs, ce qui entraînera le refus d’entrée ou l’exclusion de l’événement, la personne participante n’étant alors plus autorisée à participer à la Semaine 101.',
          'Une copie de la politique du contrôle des sacs peut être trouvée ici : https://docs.google.com/document/d/1JINbjtgWWdINeLi9_kyQfIr6mfPp-HzfExCVafjBTbE/edit?usp=sharing',
        ],
        signatureNote: 'En signant la page de signature ci-dessous, LA PERSONNE PARTICIPANTE accepte de se conformer à la Politique de contrôle des sacs.',
      },
      {
        id: 'insurance',
        title: '(c) AVIS DE NON-RESPONSABILITÉ EN MATIÈRE D’ASSURANCE ET MÉDICAL',
        paragraphs: [
          'LA PERSONNE PARTICIPANTE ACCEPTE ET COMPRENDS PAR LA PRÉSENTE que le Syndicat étudiant de l’Université d’Ottawa (SÉUO) ne fournit aucune assurance médicale ou assurance responsabilité civile pour tout incident ou accident qui pourrait survenir à la suite de la participation de la personne participante à l’un des événements de la Semaine 101 ou à des activités connexes. La personne participante comprend que l’obtention d’une couverture d’assurance relève de sa seule responsabilité et qu’elle doit prendre toutes les dispositions nécessaires de manière indépendante.',
          'LA PERSONNE PARTICIPANTE CERTIFIE PAR LA PRÉSENTE qu’elle ne souffre d’aucun problème médical susceptible de mettre en danger sa sécurité ou celle d’autrui, du fait de sa participation à l’un des événements de la Semaine 101 ou à des activités connexes.',
        ],
        signatureNote: 'En signant la page de signature ci-dessous, LA PERSONNE PARTICIPANTE accepte de se conformer à l’Avis de non-responsabilité en matière d’assurance et médical.',
      },
      {
        id: 'misc',
        title: '(d) CONDITIONS DIVERSES',
        paragraphs: [
          'LA PERSONNE PARTICIPANTE ACCEPTE ET RECONNAÎT PAR LA PRÉSENTE que des photos et des vidéos peuvent être prises durant les activités de la Semaine 101 par le SÉUO, par les gouvernements étudiants reconnus du SÉUO, par toute entité associée ou liée, par leurs directeur·trice·s, responsables, employé·e·s, héritier·tière·s, agent·e·s, représentant·e·s, participant·e·s, promoteurs, etc., l’organisme de sanction ou toute subdivision de celui-ci, les propriétaires et les locataires des lieux utilisés pour l’organisation desdits événement; et que ces images et vidéos sont réputées être la propriété exclusive du SÉUO et (ou) des gouvernements étudiants reconnus du SÉUO.',
          'LA PERSONNE PARTICIPANTE ACCEPTE PAR LA PRÉSENTE que le présent accord est régi et interprété conformément aux lois de la Province de l’Ontario.',
          'LA PERSONNE PARTICIPANTE ACCEPTE ET RECONNAÎT PAR LA PRÉSENTE que tout manquement au présent contrat, au Code de la Semaine 101 du SÉUO, ou à toute directive donnée par l’équipe de la Semaine 101 du SÉUO ou par les gouvernements étudiants reconnus (GÉR), peut entraîner la révocation immédiate de son bracelet et de ses accès aux événements de la Semaine 101. La personne participante comprend et accepte que cette décision est finale, sans appel, et applicable pour le reste de la Semaine 101.',
          'LA PERSONNE PARTICIPANTE ACCEPTE ET RECONNAÎT que le chandail de 101er fourni dans le cadre de la Semaine 101 ne peut être porté que durant les événements officiels de la Semaine 101 ou dans le cadre d’activités autorisées par le SÉUO ou les gouvernements étudiants reconnus (GÉR). Tout usage inapproprié, non autorisé ou contraire aux directives de la Semaine 101 peut entraîner des mesures disciplinaires, y compris la coupure du bracelet et la révocation des accès aux événements de la Semaine 101.',
          'LA PERSONNE PARTICIPANTE ACCEPTE ET RECONNAÎT que, pour tout événement de la Semaine 101 se déroulant à l’extérieur du campus, le transport officiel fourni par le SÉUO et/ou les gouvernements étudiants reconnus (GÉR) doit obligatoirement être utilisé. La personne participante comprend et accepte qu’elle ne peut se rendre à ces événements par ses propres moyens ni quitter l’événement autrement que par le transport officiel fourni. Le non-respect de cette exigence peut entraîner la coupure du bracelet ainsi que la révocation des accès aux événements de la Semaine 101 pour le reste de la semaine.',
        ],
        signatureNote: 'En signant la page de signature ci-dessous, LA PERSONNE PARTICIPANTE accepte de se conformer aux Conditions diverses.',
      },
      {
        id: 'waiver',
        title: '(e) RENONCIATION, DÉCHARGE ET INDEMNITÉ POUR LA SEMAINE 101',
        paragraphs: [
          'CE DOCUMENT A UNE INCIDENCE SUR VOS DROITS LÉGAUX. LISEZ-LE ATTENTIVEMENT. SI VOUS NE SOUHAITEZ PAS RENONCER À VOS DROITS LÉGAUX, NE SIGNEZ PAS CE DOCUMENT ET NE PARTICIPEZ PAS À CES ACTIVITÉS.',
          'POUR PARTICIPER À UNE PARTIE QUELCONQUE DE LA SEMAINE 101, VOUS (ET SI VOUS AVEZ MOINS DE DIX-HUIT (18) ANS, VOTRE PARENT/TUTEUR·TRICE LÉGAL·E) DEVEZ ACCEPTER LA PRÉSENTE RENONCIATION, DÉCHARGE ET INDEMNITÉ, QUI COMPREND LA RENONCIATION À VOS DROITS D’ENGAGER DES POURSUITES JUDICIAIRES.',
          'SI VOUS AVEZ MOINS DE 18 ANS, VOUS ET VOTRE PARENT/TUTEUR·TRICE LÉGAL·E DEVEZ TOUS OU TOUTES DEUX ACCEPTER ET SIGNER LA PRÉSENTE RENONCIATION, DÉCHARGE ET INDEMNITÉ.',
        ],
        bullets: [
          'EN SIGNANT LA PRÉSENTE RENONCIATION, DÉCHARGE ET INDEMNITÉ :',
          'VOUS ACCEPTEZ ET RECONNAISSEZ qu’en participant à la Semaine 101, vous vous exposez à divers risques et dangers, y compris des risques et dangers imprévus, qui pourraient entraîner des blessures physiques ou émotionnelles, la mort ou des dommages aux biens, des dommages à vous-même et/ou des dommages à de tierces parties.',
          'VOUS COMPRENEZ ET ACCEPTEZ QUE LE SYNDICAT ÉTUDIANT DE L’UNIVERSITÉ D’OTTAWA (« SÉUO »), tout club associé, tout gouvernement étudiant reconnu, et/ou toute entité associée ne peut pas éliminer tous les risques ou vous avertir pleinement de tous les risques/dangers associés à cette activité.',
          'VOUS COMPRENEZ ET ACCEPTEZ que votre participation à cette activité est purement volontaire.',
          'EN CHOISISSANT DE PARTICIPER, VOUS CHOISISSEZ VOLONTAIREMENT ET LIBREMENT d’accepter et d’assumer tous les risques et dangers, y compris les blessures physiques ou émotionnelles, la mort ou les dommages aux biens, à vous-même et/ou à de tierces parties.',
          'PAR LA PRÉSENTE, VOUS RENONCEZ VOLONTAIREMENT, VOUS DÉCHARGEZ À TOUT JAMAIS et ACCEPTEZ D’INDEMNISER ET DE LIBÉRER DE SES RESPONSABILITÉS le SÉUO et/ou toute entité associée ou liée (notamment les clubs et les gouvernements étudiants reconnus) ainsi que leurs directeur·trice·s, responsables, employé·e·s, héritier·tière·s, agent·e·s, représentant·e·s, participant·e·s, promoteurs, organisme de sanction, propriétaires et locataires des lieux utilisés pour l’organisation de l’activité (collectivement « renonciataires ») pour toute réclamation, demande ou cause d’action que vous avez ou pourriez avoir à l’avenir, en lien avec votre participation à un événement ou à une activité de la Semaine 101.',
          'PAR LA PRÉSENTE, VOUS RENONCEZ VOLONTAIREMENT, VOUS DÉCHARGEZ À TOUT JAMAIS et ACCEPTEZ D’INDEMNISER ET DE LIBÉRER les renonciataires DE TOUTE RESPONSABILITÉ, connue ou inconnue, liée à votre participation à cette activité POUR QUELQUE CAUSE QUE CE SOIT, notamment la négligence, la responsabilité délictuelle, la rupture de contrat et la violation de toute loi, notamment la Loi sur la responsabilité des occupants, et pour toute responsabilité, y compris la perte ou le dommage en raison d’une blessure à la personne (y compris la mort) ou d’un dommage aux biens.',
          'VOUS COMPRENEZ ET ACCEPTEZ que cela comprend une renonciation, une décharge et une indemnité pour toute responsabilité envers VOUS, votre plus proche parent, votre famille et/ou toute personne mineure dont vous êtes responsable, ou toute tierce partie résultant de cette activité.',
          'VOUS COMPRENEZ ET ACCEPTEZ ÉGALEMENT QUE SI VOUS FAITES L’OBJET DE POURSUITES JUDICIAIRES POUR UN ACTE OU UNE OMISSION LIÉS À CETTE ACTIVITÉ, LE PRÉSENT ACCORD VOUS EMPÊCHE D’INTENTER UNE ACTION OU DE DEMANDER UNE FORME QUELCONQUE DE DÉFENSE OU D’INDEMNITÉ DE LA PART DES RENONCIATAIRES, POUR QUELQUE RAISON QUE CE SOIT.',
          'VOUS ACCEPTEZ ET COMPRENEZ que le SÉUO ne fournit aucune assurance médicale ou assurance responsabilité civile pour tout incident ou accident pouvant résulter de votre participation à cet événement. Si vous souhaitez souscrire à une assurance, quelle qu’elle soit, il est de VOTRE SEULE RESPONSABILITÉ DE PRENDRE VOS PROPRES DISPOSITIONS.',
          'VOUS CERTIFIEZ que vous ne souffrez d’aucun problème médical susceptible de mettre en danger votre sécurité ou celle d’autrui du fait de votre participation à cette activité.',
          'VOUS AVEZ LU LE PRÉSENT ACCORD DE DÉCHARGE DE RESPONSABILITÉ ET D’INDEMNITÉ avant de le signer. VOUS comprenez et acceptez ses conditions. VOUS reconnaissez qu’en le signant, vous renoncez aux droits légaux que vous ou vos héritier·tière·s, votre plus proche parent, exécuteur·trice·s, administrateur·trice·s et ayants droit pourraient avoir à l’encontre des renonciataires.',
          'VOUS ACCEPTEZ ET COMPRENEZ EXPRESSÉMENT que le présent accord de renonciation, de décharge et d’indemnité est régi et interprété conformément aux lois de la Province de l’Ontario et qu’il se veut aussi large et inclusif que le permet la loi dans la Province de l’Ontario et que si une partie de cet accord est jugée invalide, il est convenu que le reste restera pleinement en vigueur.',
          'En signant la page de signature ci-dessous, LA PERSONNE PARTICIPANTE accepte de se conformer à la Renonciation, décharge et indemnité.',
        ],
        signatureNote: 'Signature required at the bottom',
      },
    ];
  }

  return [
    {
      id: 'code',
      title: '(a) UOSU 101 Week Code (POL-GEN 5)',
      paragraphs: [
        'THE PARTICIPANT HEREBY AGREES AND ACKNOWLEDGES having read the official 101 Week Code.',
        'A copy of the aforementioned regulation of the University of Ottawa Students\' Union is available for review online at https://www.seuo-uosu.com/student-life/101-week , upon request at the UOSU Office located at #07, 85 University Private, Ottawa, ON, K1N8Z4, and upon request at studentlife@seuo-uosu.com.',
        'THE PARTICIPANT HEREBY understands that a failure to abide by the 101 Week Code can result in their immediate exclusion from all 101 Week events.',
        'THE PARTICIPANT HEARBY AGREES to be bound by the 101 Week Code of the UOSU.',
      ],
      signatureNote: 'Signature required at the bottom',
    },
    {
      id: 'bag',
      title: '(b) Bag Checks',
      paragraphs: [
        'THE PARTICIPANT HEREBY AGREES AND ACKNOWLEDGES that bag checks may be performed throughout 101 Week.',
        'THE PARTICIPANT FURTHER EXPRESSLY AGREES AND ACKNOWLEDGES that by their voluntary participation in any event, they consent to having their bag(s) checked at the entrances to 101 Week Events by authorized UOSU personnel or volunteers. The Participant further consents, by their voluntary participation in any event, to having their bag(s) checked upon the demand of the 101 Week Crew of the UOSU, Safety Ambassadors and the guides of the Recognized Student Governments of the UOSU during any event.',
        'THE PARTICIPANT FURTHER EXPRESSLY AGREES AND ACKNOWLEDGES that any item found during the bag check, which is considered to be a violation or potential violation of any applicable laws, the 101 Week Code, or regulations established by the University of Ottawa or by the establishment in which the 101 Week event is taking place, will result in denied entry, removal from the event, and/or confiscation of items (in accordance with applicable law) from the 101 Week Participant. Any violation may result in the Participant being excluded from participation in any further 101 Week events.',
        'The Participant has the right to refuse a bag check, which will result in denied entry or exclusion from the event with the result that the Participant is no longer permitted to participate in 101 Week.',
        'A copy of the Bag Checks Policy can be found here: https://docs.google.com/document/d/1JINbjtgWWdINeLi9_kyQfIr6mfPp-HzfExCVafjBTbE/edit?usp=sharing',
      ],
      signatureNote: 'Signature required at the bottom',
    },
    {
      id: 'insurance',
      title: '(c) Insurance and Medical Disclaimer',
      paragraphs: [
        'THE PARTICIPANT ACKNOWLEDGES AND AGREES that the University of Ottawa Students\' Union (UOSU) does not provide medical or liability insurance for any incidents or accidents that may occur as a result of the Participant\'s involvement in any 101 Week events or related activities. The Participant understands that obtaining any insurance coverage is solely their responsibility, and they must make all necessary arrangements independently.',
        'THE PARTICIPANT HEREBY CERTIFIES that they do not suffer from any conditions which may endanger the safety of the Participant or anyone else, by their participation in any of the 101 Week events or related activities.',
      ],
      signatureNote: 'Signature required at the bottom',
    },
    {
      id: 'misc',
      title: '(d) Miscellaneous',
      paragraphs: [
        'THE PARTICIPANT HEREBY AGREES AND AWKNOWLEDGES that pictures and videos may be taken during the activities of 101 Week by the UOSU, by the Recognized Student Governments of the UOSU, any associated or related entities, their directors, officers, employees, heirs, agents, representatives, participants promoters, etc., sanctioning organization or any subdivision thereof, owners and lessees of the premises used to conduct said event; and that such pictures and videos are deemed to be the exclusive property of the UOSU and (or) the Recognized Student Governments of the UOSU.',
        'THE PARTICIPANT HEREBY AGREES that this agreement shall be governed by and construed in accordance with the laws of the Province of Ontario.',
        'THE PARTICIPANT HEREBY AGREES AND ACKNOWLEDGES that any breach of this Agreement, the UOSU 101 Week Code, or any directive issued by the UOSU 101 Week team or by the Recognized Student Governments (RSGs), may result in the immediate revocation of their wristband and access to 101 Week events. The participant understands and agrees that such a decision is final, non-appealable, and applicable for the remainder of 101 Week.',
        'THE PARTICIPANT AGREES AND ACKNOWLEDGES that the 101er shirt provided as part of 101 Week may only be worn during official 101 Week events or during activities authorized by the UOSU or the Recognized Student Governments (RSGs). Any inappropriate, unauthorized, or non-compliant use contrary to 101 Week directives may result in disciplinary measures, including the cutting of the wristband and the revocation of access to 101 Week events.',
        'THE PARTICIPANT AGREES AND ACKNOWLEDGES that, for any 101 Week event taking place off campus, the official transportation provided by the UOSU and/or the Recognized Student Governments (RSGs) must be used at all times. The participant understands and agrees that they may not travel to these events by their own means nor leave the event by any means other than the official transportation provided. Failure to comply with this requirement may result in the cutting of the wristband and the revocation of access to 101 Week events for the remainder of the week.',
      ],
      signatureNote: 'Signature required at the bottom',
    },
    {
      id: 'waiver',
      title: '(e) Waiver, Release, and Indemnity for 101 Week',
      paragraphs: [
        'THIS DOCUMENT AFFECTS YOUR LEGAL RIGHTS. YOU MUST READ IT CAREFULLY. IF YOU DO NOT WISH TO WAIVE YOUR LEGAL RIGHTS, DO NOT SIGN THIS DOCUMENT AND DO NOT PARTICIPATE IN THESE ACTIVITIES.',
        'IN ORDER TO PARTICIPATE IN ANY PART OF 101 WEEK, YOU (AND IF YOU ARE UNDER EIGHTEEN (18) YEARS OLD, YOUR PARENT/LEGAL GUARDIAN) ARE REQUIRED TO AGREE TO THIS WAIVER, RELEASE AND INDEMNITY, WHICH INCLUDES WAIVING YOUR RIGHTS TO SUE.',
        'IF YOU ARE UNDER 18 YEARS OLD, YOU AND YOUR PARENT/LEGAL GUARDIAN ARE BOTH REQUIRED TO AGREE TO AND EXECUTE THIS WAIVER, RELEASE, AND INDEMNITY.',
      ],
      bullets: [
        'YOU AGREE AND ACKNOWLEDGE that by participating in 101 WEEK, you will be exposed to various risks/hazards including unforeseen risks/hazards, that could result in physical or emotional injury, death, or damage to property, yourself and/or damage to third parties;',
        'YOU UNDERSTAND AND AGREE THAT THE UNIVERSITY OF OTTAWA STUDENTS’ UNION (“UOSU”), any associated club, any recognized student government, and/or any associated entities cannot eliminate all risks or fully warn you concerning all risks/hazards associated with this activity;',
        'YOU UNDERSTAND AND AGREE that your participation in this activity is purely voluntary;',
        'BY ELECTING TO PARTICIPATE, YOU VOLUNTARILY AND FREELY choose to accept and assume any and all risks/hazards including physical or emotional injury, death, or damage to property, yourself and/or damage to third parties;',
        'YOU HEREBY VOLUNTARILY WAIVE, RELEASE, FOREVER DISCHARGE, and AGREE TO INDEMNIFY AND HOLD HARMLESS the UOSU and/or any associated or related entities (including, but not limited to, clubs and recognized student governments) as well as their directors, officers, employees, heirs, agents, representatives, participants, promoters, sanctioning organization, owners and lessees of the premises used to conduct the activity (collectively referred to as the “Releasees”) for any and all claims, demands, or causes of action that you have or may have in the future, in relation to or connected with your participation in any 101 week event or activity.',
        'YOU HEREBY VOLUNTARILY WAIVE, RELEASE, FOREVER DISCHARGE, and AGREE TO INDEMNIFY AND HOLD HARMLESS the Releasees from any and all liability OF ANY KIND, known or unknown, in relation to or connected with your participation in this activity DUE TO ANY CAUSE WHATSOEVER INCLUDING, BUT NOT LIMITED TO, NEGLIGENCE, ANY TORT, BREACH OF CONTRACT, AND THE BREACH OF ANY STATUTE, INCLUDING BUT NOT LIMITED TO THE OCCUPIER\'S LIABILITY ACT, and for any and all liability including loss or damage on the account of injury to person (including death) or damage to property.',
        'YOU UNDERSTAND AND AGREE this includes a waiver, release and indemnity for any and all liability to YOU, your next of kin, your family, and/or any minor persons for whom you are responsible, or any third party resulting from this activity.',
        'YOU ALSO UNDERSTAND AND AGREE THAT IF YOU ARE SUED FOR ANY ACT OR OMMISSION RELATED TO OR CONNECTED WITH THIS ACTIVITY, THIS AGREEMENT DISENTITLES YOU FROM COMMENCING ANY ACTION OR SEEKING ANY FORM OF DEFENCE OR INDEMNITY FROM THE RELEASEES, FOR ANY REASON.',
        'YOU AGREE AND UNDERSTAND that the UOSU does not provide any medical or liability insurance whatsoever, for any incident or accident which may arise as a result of your participation in this event. If you want insurance of any kind, it is YOUR SOLE RESPONSIBILITY TO MAKE YOUR OWN ARRANGEMENTS.',
        'YOU CERTIFY that you do not suffer from any conditions which may endanger your safety or the safety of anyone else, by you participation in this activity.',
        'YOU HAVE READ THIS WAIVER OF LIABILITY AND INDEMNITY AGREEMENT prior to signing it. YOU understand and accept its terms. YOU acknowledge that in signing it you are waiving legal rights which you or your heirs, next of kin, executors, administrators and assigns may have against the Releasees.',
        'YOU EXPRESSLY AGREE AND UNDERSTAND that this waiver, release and indemnity agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and is intended to be as broad and inclusive as is permitted by law in the Province of Ontario and if any portion thereof is held invalid it is agreed that the balance shall continue in full force and effect.',
        'LEGAL GUARDIAN/PARENT: By signing below, the parent/legal guardian warrants that they UNDERSTAND AND AGREE that they are also required to assume all liability because they are legally responsible for the Minor Participant. By signing below, the parent/legal guardian, hereby agrees to defend and indemnify the Releasees from any and all claims arising from the Minor Participant\'s participation in this activity, including any claims made by the Minor Participant, any party covered by the Family Law Act, and any third party.',
      ],
      signatureNote: 'Signature required at the bottom',
    },
  ];
}

export default function ParticipantContractForm() {
  const { language, toggleLanguage } = useLanguage();
  const strings = copy[language] || copy.en;
  const defaultRsg1 = getDefaultRsg1(language);
  const participantSignatureRef = useRef(null);
  const guardianSignatureRef = useRef(null);
  const medicalAttachmentInputRef = useRef(null);
  const previousLanguageRef = useRef(language);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(() => ({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    pronouns: '',
    languages: '',
    program: '',
    rsg1: defaultRsg1,
    rsg2: '',
    email: '',
    phone: '',
    medicalRestrictions: '',
    medicalRestrictionAttachments: [],
    accessibilityRequests: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    code: false,
    bag: false,
    insurance: false,
    misc: false,
    waiver: false,
    participantLegalName: '',
    participantSignatureDate: getToday(),
    guardianLegalName: '',
    guardianSignatureDate: getToday(),
  }));
  const agreementItems = getAgreementItems(language);

  const under18 = isUnder18FromDateOfBirth(formData.dateOfBirth);

  useEffect(() => {
    if (!formData.participantSignatureDate) {
      setFormData((prev) => ({ ...prev, participantSignatureDate: getToday() }));
    }
  }, [formData.participantSignatureDate]);

  useEffect(() => {
    if (previousLanguageRef.current === language) {
      return;
    }

    const previousDefaultRsg1 = getDefaultRsg1(previousLanguageRef.current);

    if (!formData.rsg1 || formData.rsg1 === previousDefaultRsg1) {
      setFormData((prev) => ({ ...prev, rsg1: getDefaultRsg1(language) }));
    }

    previousLanguageRef.current = language;
  }, [language]);

  useEffect(() => {
    if (under18 && !formData.guardianSignatureDate) {
      setFormData((prev) => ({ ...prev, guardianSignatureDate: getToday() }));
    }
    if (!under18 && (formData.guardianLegalName || formData.guardianSignatureDate)) {
      setFormData((prev) => ({
        ...prev,
        guardianLegalName: '',
        guardianSignatureDate: getToday(),
      }));
      if (guardianSignatureRef.current) {
        guardianSignatureRef.current.clear();
      }
    }
  }, [under18, formData.guardianSignatureDate, formData.guardianLegalName]);

  const resetForm = () => {
    if (participantSignatureRef.current) {
      participantSignatureRef.current.clear();
    }
    if (guardianSignatureRef.current) {
      guardianSignatureRef.current.clear();
    }
    if (medicalAttachmentInputRef.current) {
      medicalAttachmentInputRef.current.value = '';
    }
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      pronouns: '',
      languages: '',
      program: '',
      rsg1: defaultRsg1,
      rsg2: '',
      email: '',
      phone: '',
      medicalRestrictions: '',
      medicalRestrictionAttachments: [],
      accessibilityRequests: '',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelationship: '',
      code: false,
      bag: false,
      insurance: false,
      misc: false,
      waiver: false,
      participantLegalName: '',
      participantSignatureDate: getToday(),
      guardianLegalName: '',
      guardianSignatureDate: getToday(),
    });
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleAttachmentChange = async (event) => {
    const fileList = Array.from(event.target.files || []);

    if (fileList.length === 0) {
      setFormData((prev) => ({ ...prev, medicalRestrictionAttachments: [] }));
      return;
    }

    const attachments = await Promise.all(fileList.map(async (file) => {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
        reader.readAsDataURL(file);
      });

      return {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      };
    }));

    setFormData((prev) => ({ ...prev, medicalRestrictionAttachments: attachments }));
  };


  const validate = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = strings.required;
    if (!formData.lastName.trim()) nextErrors.lastName = strings.required;
    if (!formData.dateOfBirth) nextErrors.dateOfBirth = strings.required;
    if (!formData.pronouns.trim()) nextErrors.pronouns = strings.required;
    if (!formData.languages.trim()) nextErrors.languages = strings.required;
    if (!formData.program.trim()) nextErrors.program = strings.required;
    if (!formData.rsg1.trim()) nextErrors.rsg1 = strings.required;
    if (!formData.email.trim() || !formData.email.includes('@')) nextErrors.email = strings.invalidEmail;
    if (!formData.phone.trim()) nextErrors.phone = strings.required;
    if (!formData.emergencyName.trim()) nextErrors.emergencyName = strings.required;
    if (!formData.emergencyPhone.trim()) nextErrors.emergencyPhone = strings.required;
    if (!formData.emergencyRelationship.trim()) nextErrors.emergencyRelationship = strings.required;
    if (!formData.participantLegalName.trim()) nextErrors.participantLegalName = strings.required;
    if (!formData.participantSignatureDate) nextErrors.participantSignatureDate = strings.required;

    agreementKeys.forEach((key) => {
      if (!formData[key]) {
        nextErrors[key] = strings.required;
      }
    });

    if (!participantSignatureRef.current || participantSignatureRef.current.isEmpty()) {
      nextErrors.participantSignature = strings.signatureRequired;
    }

    if (under18) {
      if (!formData.guardianLegalName.trim()) nextErrors.guardianLegalName = strings.required;
      if (!formData.guardianSignatureDate) nextErrors.guardianSignatureDate = strings.required;
      if (!guardianSignatureRef.current || guardianSignatureRef.current.isEmpty()) {
        nextErrors.guardianSignature = strings.signatureRequired;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        type: contractType,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        date: formData.participantSignatureDate,
        under18,
        participantSignature: participantSignatureRef.current?.getTrimmedCanvas().toDataURL('image/png') || '',
        guardianSignature: under18 && guardianSignatureRef.current
          ? guardianSignatureRef.current.getTrimmedCanvas().toDataURL('image/png')
          : '',
      };

      const response = await fetch('/api/submit-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Submission failed');
      }

      resetForm();
      setShowSuccess(true);
    } catch (error) {
      console.error('Contract submission error:', error);
      alert(language === 'en'
        ? 'Failed to submit the contract. Please try again.'
        : 'Échec de la soumission du contrat. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleLabel = language === 'en' ? 'EN' : 'FR';

  return (
    <div style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', minHeight: '100vh' }}>
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-4">
          <a href="/" className="btn btn-outline-light">{strings.backHome}</a>
          <button onClick={toggleLanguage} className="btn btn-light" style={{ minWidth: '80px' }}>
            {titleLabel === 'EN' ? 'FR' : 'EN'}
          </button>
          <a href="/login" className="btn btn-outline-light">{strings.adminLogin}</a>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div>
                    <h1 className="display-6 mb-2 fw-bold" style={{ color: '#52009a' }}>{strings.title}</h1>
                    {/* <p className="text-muted mb-0">{strings.subtitle}</p> */}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12 col-lg-6">
                      <div className="card border-0 bg-light h-100">
                        <div className="card-body">
                          <SectionHeader
                            title={language === 'en' ? 'BIOGRAPHICAL INFORMATION' : 'INFORMATIONS BIOGRAPHIQUES'}
                          />
                          <div className="row">
                            <div className="col-md-6">
                              <TextField id="firstName" label={strings.firstName} value={formData.firstName} onChange={handleChange} error={errors.firstName} required />
                            </div>
                            <div className="col-md-6">
                              <TextField id="lastName" label={strings.lastName} value={formData.lastName} onChange={handleChange} error={errors.lastName} required />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <TextField id="dateOfBirth" label={strings.dateOfBirth} type="date" value={formData.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} required />
                            </div>
                            <div className="col-md-6">
                              <TextField id="pronouns" label={strings.pronouns} value={formData.pronouns} onChange={handleChange} error={errors.pronouns} required />
                            </div>
                          </div>
                          {formData.dateOfBirth && (
                            <div className="alert alert-info mb-3" role="status">
                              <div className="small mt-1">
                                {under18
                                  ? (language === 'en' ? 'Under 18 years old.' : 'Moins de 18 ans.')
                                  : (language === 'en' ? 'Over 18 years old.' : 'Être âgé de plus de 18 ans.')}
                              </div>
                            </div>
                          )}
                          <TextField id="languages" label={strings.languages} value={formData.languages} onChange={handleChange} error={errors.languages} required />
                          <TextField id="program" label={strings.program} value={formData.program} onChange={handleChange} error={errors.program} required />
                          <div className="small text-muted mb-2">
                            {language === 'en'
                              ? 'With which Recognized Student Government(s) (RSG) did you register for 101 Week? *(Double major students can register in either or both RSG’s 101 Week. First Nations, Metis and Inuits students can register in their program’s RSG and/or the Indigenous Students’ Association 101 Week)*'
                              : 'Auprès de quel(s) Gouvernement(s) étudiant(s) reconnu(s) (GÉR) vous êtes-vous inscrit·e pour la Semaine 101? (*Les étudiant·e·s en double majeure peuvent s’inscrire à la Semaine 101 de l’un ou l’autre des GÉR, ou aux deux. Les étudiant·e·s des Premières Nations, Métis et Inuit peuvent s’inscrire à la Semaine 101 du GÉR de leur programme et/ou à celle de l’Association des étudiant·e·s autochtones*.)**'}
                          </div>
                          <div className="row">
                            <div className="col-12">
                              <TextField id="rsg1" label={strings.rsg1} value={formData.rsg1} onChange={handleChange} error={errors.rsg1} required />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-12">
                              <TextField id="rsg2" label={strings.rsg2} value={formData.rsg2} onChange={handleChange} error={errors.rsg2} />
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <TextField id="email" label={strings.email} type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                            </div>
                            <div className="col-md-6">
                              <TextField id="phone" label={strings.phone} value={formData.phone} onChange={handleChange} error={errors.phone} required />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-lg-6">
                      <div className="card border-0 bg-light h-100">
                        <div className="card-body">
                          <SectionHeader
                            title={language === 'en' ? 'EMERGENCY CONTACT' : 'PERSONNE CONTACT EN CAS D’URGENCE'}
                          />
                          <TextField id="emergencyName" label={strings.emergencyName} value={formData.emergencyName} onChange={handleChange} error={errors.emergencyName} required />
                          <TextField id="emergencyPhone" label={strings.emergencyPhone} value={formData.emergencyPhone} onChange={handleChange} error={errors.emergencyPhone} required />
                          <TextField id="emergencyRelationship" label={strings.emergencyRelationship} value={formData.emergencyRelationship} onChange={handleChange} error={errors.emergencyRelationship} required />
                          <TextAreaField id="medicalRestrictions" label={strings.medicalRestrictions} value={formData.medicalRestrictions} onChange={handleChange} error={errors.medicalRestrictions} rows={3} />
                          <FileField
                            id="medicalRestrictionAttachments"
                            label={language === 'en' ? 'Attach document(s) for medical restrictions / limitations / information' : 'Joindre un ou des document(s) pour les restrictions / limitations / informations médicales pertinentes'}
                            onChange={handleAttachmentChange}
                            inputRef={medicalAttachmentInputRef}
                            files={formData.medicalRestrictionAttachments}
                            accept=".pdf,image/*"
                            helperText={language === 'en'
                              ? 'PDF and image files only. You can attach multiple files if needed.'
                              : 'Fichiers PDF et images seulement. Vous pouvez joindre plusieurs fichiers au besoin.'}
                          />
                          <TextAreaField id="accessibilityRequests" label={strings.accessibilityRequests} value={formData.accessibilityRequests} onChange={handleChange} error={errors.accessibilityRequests} rows={3} />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <SectionHeader
                            subtitle={language === 'en'
                              ? 'Please review and acknowledge each clause before signing the contract.'
                              : 'Veuillez examiner et reconnaître chaque clause avant de signer le contrat.'
                            }
                          />
                          {agreementItems.map((item) => (
                            <ContractSection
                              key={item.id}
                              id={item.id}
                              title={item.title}
                              paragraphs={item.paragraphs}
                              bullets={item.bullets}
                              checked={formData[item.id]}
                              onChange={handleChange}
                              error={errors[item.id]}
                              signatureNote={item.signatureNote}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <SectionHeader
                            title={language === 'en' ? 'Signature Page' : 'Page de signature'}
                            subtitle={language === 'en'
                              ? 'If the participant is under 18 years old, the parent/guardian section below must also be completed.'
                              : 'Si la personne participante a moins de 18 ans, la section du parent/tuteur ci-dessous doit également être remplie.'
                            }
                          />
                          <SignatureIntro language={language} />
                          <div className="row g-4">
                            <div className="col-12">
                              <SignatureBlock
                                label={strings.participantTitle}
                                canvasRef={participantSignatureRef}
                                dateFieldName="participantSignatureDate"
                                dateValue={formData.participantSignatureDate}
                                onDateChange={handleChange}
                                error={errors.participantSignature}
                                dateError={errors.participantSignatureDate}
                                clearLabel={strings.clearSignature}
                              >
                                <div className="mt-3">
                                  <TextField
                                    id="participantLegalName"
                                    label={strings.participantLegalName}
                                    value={formData.participantLegalName}
                                    onChange={handleChange}
                                    error={errors.participantLegalName}
                                    required
                                  />
                                </div>
                              </SignatureBlock>
                            </div>

                            {under18 && (
                              <div className="col-12">
                                <SignatureBlock
                                  label={strings.guardianTitle}
                                  note={strings.guardianNote}
                                  intro={language === 'en'
                                    ? 'By signing below, the parent/legal guardian warrants that they UNDERSTAND AND AGREE to the terms and conditions set out herein.'
                                    : 'En signant ci-dessous, le parent / tuteur légal atteste qu’il / elle / iel COMPREND ET ACCEPTE les modalités et conditions énoncées aux présentes.'
                                  }
                                  canvasRef={guardianSignatureRef}
                                  dateFieldName="guardianSignatureDate"
                                  dateValue={formData.guardianSignatureDate}
                                  onDateChange={handleChange}
                                  error={errors.guardianSignature}
                                  dateError={errors.guardianSignatureDate}
                                  clearLabel={strings.clearSignature}
                                >
                                  <div className="mt-3">
                                    <TextField
                                      id="guardianLegalName"
                                      label={strings.guardianLegalName}
                                      value={formData.guardianLegalName}
                                      onChange={handleChange}
                                      error={errors.guardianLegalName}
                                      required
                                    />
                                    <div className="text-muted small">{strings.guardianAgreement}</div>
                                  </div>
                                </SignatureBlock>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 d-flex justify-content-end gap-2">
                      <a href="/" className="btn btn-outline-secondary">{strings.backHome}</a>
                      <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting} style={{ backgroundColor: '#52009a', borderColor: '#52009a' }}>
                        {isSubmitting ? strings.saving : strings.submit}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">{strings.successTitle}</h5>
              </div>
              <div className="modal-body">
                <p className="mb-0">{strings.successMessage}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowSuccess(false)}>
                  {strings.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
