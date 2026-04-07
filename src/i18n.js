import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko from './locales/ko.json';
import en from './locales/en.json';
import vn from './locales/vn.json';

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  vn: { translation: vn }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // 기본 언어
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;

// 통화 포맷팅 유틸리티
// 추후 로컬스토리지나 유저 설정에서 가져온 국가 코드를 기반으로 변경할 수 있도록 설계
export const formatCurrency = (amount, currencyCode = 'KRW') => {
  try {
    return new Intl.NumberFormat(currencyCode === 'KRW' ? 'ko-KR' : currencyCode === 'VND' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (e) {
    if (currencyCode === 'KRW') return `${amount.toLocaleString()}원`;
    return `${amount.toLocaleString()}`;
  }
};

// 단위 포맷팅 유틸리티
export const formatUnit = (unitType = 'pyeong', lang = 'ko') => {
  if (unitType === 'pyeong') {
    if (lang === 'ko') return '평';
    return 'sqft'; // or m² based on specific business logic later
  }
  return unitType;
};
