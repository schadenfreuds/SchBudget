'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  translations,
  Language,
  CurrencyCode,
  CURRENCIES,
  formatCurrency,
  formatMonthDisplay,
  getCategoryName,
  getPersonName,
  translateTemplateTitle,
  translateQuickTitle,
  translatePersonRole,
} from '@/lib/i18n';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  currencySymbol: string;
  t: (keyPath: string, fallback?: string) => string;
  formatMoney: (amount: number) => string;
  formatMonth: (monthKey: string) => string;
  translateCategory: (cat: { id: string; name: string }) => string;
  translatePerson: (p: { id: string; name: string }) => string;
  translateTemplate: (title: string) => string;
  translateQuick: (title: string) => string;
  translateRole: (role?: string) => string | undefined;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('tr');
  const [currency, setCurrencyState] = useState<CurrencyCode>('TRY');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('aile_butcesi_lang') as Language;
      if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
        setLangState(savedLang);
      }
      const savedCurrency = localStorage.getItem('aile_butcesi_currency') as CurrencyCode;
      if (savedCurrency && CURRENCIES[savedCurrency]) {
        setCurrencyState(savedCurrency);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('aile_butcesi_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {}
  };

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('aile_butcesi_currency', newCurrency);
    } catch {}
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = translations[lang];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to TR
        let trCurrent: any = translations.tr;
        for (const trK of keys) {
          if (trCurrent && typeof trCurrent === 'object' && trK in trCurrent) {
            trCurrent = trCurrent[trK];
          } else {
            return fallback || path;
          }
        }
        return typeof trCurrent === 'string' ? trCurrent : fallback || path;
      }
    }
    return typeof current === 'string' ? current : fallback || path;
  };

  const formatMoney = (amount: number) => formatCurrency(amount, currency, lang);
  const formatMonth = (monthKey: string) => formatMonthDisplay(monthKey, lang);
  const translateCategory = (cat: { id: string; name: string }) => getCategoryName(cat, lang);
  const translatePerson = (p: { id: string; name: string }) => getPersonName(p, lang);
  const translateTemplate = (title: string) => translateTemplateTitle(title, lang);
  const translateQuick = (title: string) => translateQuickTitle(title, lang);
  const translateRole = (role?: string) => translatePersonRole(role, lang);

  return (
    <I18nContext.Provider
      value={{
        lang,
        setLang,
        currency,
        setCurrency,
        currencySymbol: CURRENCIES[currency]?.symbol || '₺',
        t,
        formatMoney,
        formatMonth,
        translateCategory,
        translatePerson,
        translateTemplate,
        translateQuick,
        translateRole,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};
