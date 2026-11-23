import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import kn from './kn.json';
import en from './en.json';

const savedLanguage = localStorage.getItem('tumakuru_lang') || 'kn';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      kn: { translation: kn },
      en: { translation: en },
    },
    lng: savedLanguage, // Kannada is the default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
