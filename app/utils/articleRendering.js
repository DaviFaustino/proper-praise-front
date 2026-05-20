import { marked } from 'marked';

export const ARTICLE_OG_IMAGE_PLACEHOLDER = '{{og_image}}';

const ALLOWED_OG_IMAGE_ORIGIN = 'https://kdlouvor.com';

function normalizeArticleValue(value) {
    return value == null ? '' : String(value);
}

function escapeHtmlAttribute(value) {
    return normalizeArticleValue(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function isAllowedOgImageUrl(value) {
    const imageUrl = normalizeArticleValue(value).trim();

    if (imageUrl === '') {
        return false;
    }

    try {
        const parsedUrl = new URL(imageUrl);
        return parsedUrl.origin === ALLOWED_OG_IMAGE_ORIGIN;
    } catch {
        return false;
    }
}

function buildOgImageElement(imageUrl, altText) {
    if (!isAllowedOgImageUrl(imageUrl)) {
        return '';
    }

    const parsedUrl = new URL(normalizeArticleValue(imageUrl).trim());
    const escapedUrl = escapeHtmlAttribute(parsedUrl.href);
    const escapedAltText = escapeHtmlAttribute(altText);

    return `<img src="${escapedUrl}" alt="" aria-label="${escapedAltText}" class="article-og-image" onerror="this.remove()">`;
}

export function injectArticleOgImage(content, imageUrl, altText = '') {
    return normalizeArticleValue(content)
        .split(ARTICLE_OG_IMAGE_PLACEHOLDER)
        .join(buildOgImageElement(imageUrl, altText));
}

export function renderArticleMarkdown(content, imageUrl = '', altText = '') {
    return marked(injectArticleOgImage(content, imageUrl, altText));
}
