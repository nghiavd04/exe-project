export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://dopaless.cloud').replace(/\/$/, '');
export const SITE_NAME = 'Dopaless';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;

export const buildUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const stripHtml = (value = '') =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const makeDescription = (value, fallback) => {
  const text = stripHtml(value || fallback || '');
  return text.length > 160 ? `${text.slice(0, 157).trim()}...` : text;
};
