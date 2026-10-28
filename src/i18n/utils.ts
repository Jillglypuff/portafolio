import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang?: string | keyof typeof ui) {
  const safeLang = (lang && lang in ui) ? (lang as keyof typeof ui) : defaultLang;
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[safeLang]?.[key] || ui[defaultLang][key];
  };
}

// Force reload timestamp: 2026-04-09T22:48:30Z
