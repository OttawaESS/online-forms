import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

export default function Login() {
  const { language, toggleLanguage, t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('password', password);

    try {
      const response = await fetch('/login', {
        method: 'POST',
        body: formData,
      });

      if (response.redirected && response.url.includes('/admin')) {
        // Successful login, redirect to admin
        window.location.href = '/admin';
      } else if (response.redirected && response.url.includes('/login?error=1')) {
        setError(t('invalidPassword'));
      } else {
        setError(t('loginFailed'));
      }
    } catch (err) {
      setError(t('loginFailed'));
    }
  };

  return (
    <div style={{ background: 'linear-gradient(120deg, #2d0a4e 0%, #52009a 50%, #ffffff 100%)', minHeight: '100vh'}}>
      <div className="container pt-5">
        <div className="text-start mb-3">
          <button 
            onClick={toggleLanguage} 
            className="btn btn-outline-primary"
            style={{ minWidth: '80px' }}
          >
            {language === 'en' ? 'FR' : 'EN'}
          </button>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-4">
            <h2 className="text-center mb-4 text-white">{t('adminLogin')}</h2>
            <form onSubmit={handleSubmit} className='w-25'>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">{t('password')}</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <button type="submit" className="btn btn-primary">{t('login')}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}