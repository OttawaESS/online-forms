import React from 'react';
import { useLanguage } from './LanguageContext';
import { patchCategories } from './patchesData';

const PatchArchive = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', minHeight: '100vh' }}>
      <div className="d-flex align-items-center">
        <div className="container pb-5 pt-3">
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
            <div className="col-md-10">
              <div className="card shadow-lg px-3 pt-3">
                <div className="d-flex justify-content-between align-items-start mb-3 px-2 pt-3">
                  <div className="d-flex align-items-center gap-3">
                    <img src="/ess-logo.png" alt="ESS Logo" style={{ height: '60px', width: 'auto' }} />
                    <div>
                      <h2 className="mb-0 fw-bold" style={{ color: '#52009a' }}>{t('patchArchive')}</h2>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  {/* Category Navigation */}
                  <div className="pb-3">
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      {Object.entries(patchCategories).map(([categoryKey, category]) => (
                        <a
                          key={categoryKey}
                          href={`#category-${categoryKey}`}
                          className="btn btn-outline-primary btn-sm"
                          style={{ minWidth: '100px' }}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(`category-${categoryKey}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                        >
                          {category.title[language] || category.title.en}
                        </a>
                      ))}
                    </div>
                  </div>

                  {Object.entries(patchCategories).map(([categoryKey, category]) => (
                    <div key={categoryKey} id={`category-${categoryKey}`} className="mb-4">
                      <h4 className="mb-2" style={{ color: '#52009a', borderBottom: '2px solid #52009a', paddingBottom: '0.3rem' }}>
                        {category.title[language] || category.title.en}
                      </h4>
                      <div className="row">
                        {category.patches.map((patch, index) => (
                          <div key={index} className="col-md-3 col-6 mb-2">
                            <div className="card h-100">
                              <div className="card-body text-center p-2">
                                {patch.image && (
                                  <img
                                    src={patch.image}
                                    alt={patch.name[language] || patch.name.en}
                                    className="img-fluid mb-2"
                                    style={{ maxHeight: '100px', objectFit: 'contain' }}
                                  />
                                )}
                                <h5 className="card-title h6">{patch.name[language] || patch.name.en}</h5>
                                <p className="card-text text-muted small">Est. {patch.dateCreated}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatchArchive;