<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

definePageMeta({
    middleware: 'auth'
});

const { $api } = useNuxtApp();
const route = useRoute();

function normalizeArticleValue(value) {
    return value == null ? '' : String(value);
}

function normalizeTimestamp(value) {
    if (value == null || value === '') {
        return null;
    }

    const timestamp = Number.parseFloat(value);

    if (!Number.isFinite(timestamp)) {
        return null;
    }

    return new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
}

function getRouteValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function getErrorStatus(error) {
    return error?.statusCode ?? error?.status ?? error?.response?.status ?? error?.data?.statusCode;
}

function normalizeArticle(article = {}) {
    const seoMetadata = article.seoMetadata ?? {};

    return {
        title: normalizeArticleValue(article.title),
        slug: normalizeArticleValue(article.slug),
        excerpt: normalizeArticleValue(article.excerpt),
        content: normalizeArticleValue(article.content),
        metaTitle: normalizeArticleValue(article.metaTitle ?? seoMetadata.metaTitle),
        metaDescription: normalizeArticleValue(article.metaDescription ?? seoMetadata.metaDescription),
        ogTitle: normalizeArticleValue(article.ogTitle ?? seoMetadata.ogTitle),
        ogDescription: normalizeArticleValue(article.ogDescription ?? seoMetadata.ogDescription),
        ogImageUrl: normalizeArticleValue(article.ogImageUrl ?? seoMetadata.ogImageUrl),
        status: normalizeArticleValue(article.status),
        createdAt: normalizeTimestamp(article.createdAt),
        publishedAt: normalizeTimestamp(article.publishedAt),
        updatedAt: normalizeTimestamp(article.updatedAt)
    };
}

const requestedSlug = computed(() => normalizeArticleValue(getRouteValue(route.params.slug)));

const {
    data: articleResult,
    pending: isLoading,
    error: articleError,
    refresh: refreshArticle
} = await useAsyncData(
    () => `article:${requestedSlug.value}`,
    async () => {
        try {
            const response = await $api.get(`/api/articles/${encodeURIComponent(requestedSlug.value)}`);

            return {
                article: response.data,
                notFound: false
            };
        } catch (error) {
            if (getErrorStatus(error) === 404) {
                setResponseStatus(404);

                return {
                    article: null,
                    notFound: true
                };
            }

            throw error;
        }
    },
    {
        watch: [requestedSlug]
    }
);

const articleNotFound = computed(() => articleResult.value?.notFound === true);
const article = computed(() => normalizeArticle(articleResult.value?.article));
const renderedArticle = computed(() => article.value.content ? marked(article.value.content) : '');
const pageTitle = computed(() => article.value.metaTitle || article.value.title || 'Artigo | KDLouvor');
const pageDescription = computed(() => article.value.metaDescription || article.value.excerpt || 'Leia artigos sobre louvor, adoração e vida cristã no KDLouvor.');
const canonicalUrl = computed(() => `https://kdlouvor.com/${encodeURIComponent(article.value.slug || requestedSlug.value)}`);
const publicationDate = computed(() => {
    if (!article.value.publishedAt) {
        return '';
    }

    return article.value.publishedAt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    });
});

useHead(() => {
    if (articleNotFound.value) {
        return {
            title: 'Página não encontrada | KDLouvor',
            meta: [
                { name: 'robots', content: 'noindex' }
            ]
        };
    }

    const meta = [
        { name: 'description', content: pageDescription.value },
        { property: 'og:title', content: article.value.ogTitle || pageTitle.value },
        { property: 'og:description', content: article.value.ogDescription || pageDescription.value },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: canonicalUrl.value },
        { name: 'twitter:card', content: article.value.ogImageUrl ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: article.value.ogTitle || pageTitle.value },
        { name: 'twitter:description', content: article.value.ogDescription || pageDescription.value }
    ];

    if (article.value.ogImageUrl) {
        meta.push(
            { property: 'og:image', content: article.value.ogImageUrl },
            { name: 'twitter:image', content: article.value.ogImageUrl }
        );
    }

    if (article.value.publishedAt) {
        meta.push({ property: 'article:published_time', content: article.value.publishedAt.toISOString() });
    }

    if (article.value.updatedAt) {
        meta.push({ property: 'article:modified_time', content: article.value.updatedAt.toISOString() });
    }

    return {
        title: pageTitle.value,
        meta,
        link: [
            { rel: 'canonical', href: canonicalUrl.value }
        ]
    };
});
</script>

<template>
    <div class="w-full px-4 py-8 sm:px-8">
        <div class="mx-auto flex w-full max-w-4xl flex-col gap-5">
            <div v-if="isLoading" class="bg-white p-8 text-center text-lg text-[#5D00F5] shadow-lg">
                Carregando artigo...
            </div>

            <div v-else-if="articleError" class="bg-white p-8 text-center text-lg text-[#5D00F5] shadow-lg">
                <p>Não foi possível carregar este artigo.</p>
                <button
                    type="button"
                    class="mt-4 h-8 rounded-lg bg-[#5D00F5] px-4 text-white"
                    @click="refreshArticle"
                >
                    tentar novamente
                </button>
            </div>

            <ErrorState v-else-if="articleNotFound" />

            <article v-else class="bg-white p-5 shadow-xl sm:p-10">
                <header class="article-header">
                    <h1>{{ article.title }}</h1>
                    <p v-if="publicationDate" class="publication-date">Publicado em {{ publicationDate }}</p>
                </header>

                <div class="markdown-content">
                    <div v-html="renderedArticle"></div>
                </div>
            </article>
        </div>
    </div>
</template>

<style scoped>
.article-header h1 {
    color: #5D00F5;
    font-size: 2.2rem;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 0.75rem;
}

.markdown-content :deep(img) {
    border-radius: 8px;
    height: auto;
    margin-top: 1rem;
    max-width: 100%;
}

.markdown-content :deep(blockquote) {
    border-left: 4px solid #5D00F5;
    color: #4b5563;
    margin-top: 1rem;
    padding-left: 1rem;
}

@media screen and (min-width: 32rem) {
    .article-header h1 {
        font-size: 2.5rem;
    }
}
</style>
