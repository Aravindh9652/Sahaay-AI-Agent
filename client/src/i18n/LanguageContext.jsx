import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('sahaay_language') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('sahaay_language', language);
  }, [language]);

  const t = (key) => {
    // Try direct key lookup first (flat keys)
    let value = translations[language] && translations[language][key];

    // If not found, attempt dotted/nested lookup
    if (value === undefined) {
      const keys = key.split('.');
      value = translations[language];
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
    }

    // If still not found, try searching for any translation key whose last segment matches
    if (value === undefined && translations[language]) {
      const entries = translations[language];
      for (const fullKey in entries) {
        const parts = fullKey.split('.');
        if (parts[parts.length - 1] === key && entries[fullKey]) {
          value = entries[fullKey];
          break;
        }
      }
    }

    // Final fallback to English using same resolution logic
    if (value === undefined) {
      value = translations['en'] && translations['en'][key];
      if (value === undefined) {
        const keys = key.split('.');
        value = translations['en'];
        for (const k of keys) {
          if (value && typeof value === 'object') {
            value = value[k];
          } else {
            value = undefined;
            break;
          }
        }
      }
      if (value === undefined) {
        const entries = translations['en'];
        for (const fullKey in entries) {
          const parts = fullKey.split('.');
          if (parts[parts.length - 1] === key && entries[fullKey]) {
            value = entries[fullKey];
            break;
          }
        }
      }
    }

    return value || key;
  };

  useEffect(() => {
    // Debug: log a few translated values when language changes
    try {
      // eslint-disable-next-line no-console
      console.log('Language changed:', language, {
        dashboardWelcome: t('dashboardWelcome'),
        learningCourse: t('learning.courseTitle'),
        savedItem: t('saved.pmKisan')
      })
    } catch (e) {
      // ignore
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};