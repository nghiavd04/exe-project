import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://dopaless.cloud').replace(/\/$/, '');
const SITE_NAME = 'Dopaless';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      element.removeAttribute(key);
      return;
    }
    element.setAttribute(key, value);
  });
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const upsertJsonLd = (id, data) => {
  let element = document.getElementById(id);
  if (!data) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
};

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

export default function Seo({
  title,
  description,
  canonicalPath,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const location = useLocation();
  const canonicalUrl = buildUrl(canonicalPath || location.pathname);
  const fullTitle = title?.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const metaDescription = makeDescription(description, 'Dopaless giúp người trẻ hiểu cơ chế dopamine, kiểm tra thói quen số và xây dựng lộ trình lấy lại sự tập trung.');
  const imageUrl = image && /^https?:\/\//i.test(image) ? image : buildUrl(image || DEFAULT_IMAGE);

  useEffect(() => {
    const applyMetadata = () => {
    document.documentElement.lang = 'vi';
    document.title = fullTitle;

    upsertMeta('meta[name="description"]', { name: 'description', content: metaDescription });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    upsertMeta('meta[name="theme-color"]', { name: 'theme-color', content: '#0d7a6e' });

    upsertLink('canonical', canonicalUrl);

    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: metaDescription });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'vi_VN' });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: metaDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });

    upsertJsonLd('seo-jsonld', jsonLd);
    };

    applyMetadata();
    const timeoutId = window.setTimeout(applyMetadata, 0);
    return () => window.clearTimeout(timeoutId);
  }, [canonicalUrl, fullTitle, imageUrl, jsonLd, metaDescription, noindex, type]);

  return null;
}

export { SITE_NAME, SITE_URL, DEFAULT_IMAGE };
