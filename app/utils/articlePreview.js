export const ARTICLE_PREVIEW_STORAGE_KEY = 'kdlouvor:article-preview';

export function saveArticlePreview(article) {
    if (!import.meta.client) {
        return false;
    }

    localStorage.setItem(ARTICLE_PREVIEW_STORAGE_KEY, JSON.stringify({
        ...article,
        previewSavedAt: new Date().toISOString()
    }));

    return true;
}

export function readArticlePreview() {
    if (!import.meta.client) {
        return null;
    }

    const storedArticle = localStorage.getItem(ARTICLE_PREVIEW_STORAGE_KEY);

    if (!storedArticle) {
        return null;
    }

    try {
        return JSON.parse(storedArticle);
    } catch {
        localStorage.removeItem(ARTICLE_PREVIEW_STORAGE_KEY);
        return null;
    }
}
