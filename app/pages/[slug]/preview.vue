<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { readArticlePreview } from '~/utils/articlePreview';
import { renderArticleMarkdown } from '~/utils/articleRendering';

definePageMeta({
    middleware: 'auth',
    requiresAuth: true
});

useHead({
    title: 'Pré-visualização de artigo | KDLouvor',
    meta: [
        { name: 'robots', content: 'noindex' }
    ]
});

const { $api } = useNuxtApp();
const route = useRoute();

const article = reactive({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    ogTitle: '',
    ogImageUrl: '',
    status: ''
});

const isLoading = ref(true);
const errorMessage = ref('');
const previewSource = ref('');

const renderedArticle = computed(() => {
    return renderArticleMarkdown(article.content, article.ogImageUrl, article.ogTitle || article.title);
});

const statusLabel = computed(() => {
    if (article.status === 'PUBLISHED') {
        return 'publicado';
    }

    if (article.status === 'DRAFT') {
        return 'rascunho';
    }

    return 'pré-visualização';
});

function normalizeArticleValue(value) {
    return value == null ? '' : String(value);
}

function getRouteValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function assignArticle(nextArticle = {}) {
    article.title = normalizeArticleValue(nextArticle.title);
    article.slug = normalizeArticleValue(nextArticle.slug);
    article.excerpt = normalizeArticleValue(nextArticle.excerpt);
    article.content = normalizeArticleValue(nextArticle.content);
    article.ogTitle = normalizeArticleValue(nextArticle.ogTitle ?? nextArticle.seoMetadata?.ogTitle);
    article.ogImageUrl = normalizeArticleValue(nextArticle.ogImageUrl ?? nextArticle.seoMetadata?.ogImageUrl);
    article.status = normalizeArticleValue(nextArticle.status);
}

async function fetchArticlePreview(slug) {
    const response = await $api.get(`/api/articles/${encodeURIComponent(slug)}/preview`);
    assignArticle(response.data);
    previewSource.value = 'saved';
}

async function loadPreview() {
    isLoading.value = true;
    errorMessage.value = '';

    const source = normalizeArticleValue(getRouteValue(route.query.source));
    const slug = normalizeArticleValue(getRouteValue(route.params.slug));
    const storedPreview = readArticlePreview();

    try {
        if (source === 'editor' && storedPreview?.slug === slug) {
            assignArticle(storedPreview);
            previewSource.value = 'editor';
            return;
        }

        if (slug) {
            await fetchArticlePreview(slug);
            return;
        }

        errorMessage.value = 'Abra a pré-visualização pelo editor de artigos.';
    } catch (error) {
        console.error('Error loading article preview.');
        errorMessage.value = 'Não foi possível carregar a pré-visualização do artigo.';
    } finally {
        isLoading.value = false;
    }
}

function returnToEditor() {
    navigateTo('/article-editor');
}

onMounted(() => {
    loadPreview();
});
</script>

<template>
    <div class="w-full px-4 py-8 sm:px-8">
        <div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
            <div class="flex flex-col gap-4 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
                <div class="text-[#5D00F5]">
                    <div class="mb-1 flex flex-wrap items-center gap-2">
                        <span class="rounded-md bg-[#5D00F5] px-2 py-1 text-xs font-bold uppercase tracking-normal text-white">
                            Pré-visualização
                        </span>
                        <span class="rounded-md border border-[#a40084] px-2 py-1 text-xs font-bold uppercase tracking-normal text-[#a40084]">
                            {{ statusLabel }}
                        </span>
                    </div>
                    <h1 class="text-2xl font-bold sm:text-3xl">{{ article.title || 'Artigo sem título' }}</h1>
                    <p v-if="article.slug" class="mt-1 text-sm text-gray-600">/{{ article.slug }}/preview</p>
                    <p v-if="previewSource === 'editor'" class="mt-1 text-sm text-gray-600">Versão atual do editor.</p>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button
                        type="button"
                        class="h-8 rounded-lg border border-[#5D00F5] bg-white px-4 text-[#5D00F5]"
                        @click="loadPreview"
                    >
                        recarregar
                    </button>
                    <button
                        type="button"
                        class="h-8 rounded-lg bg-[#5D00F5] px-4 text-white"
                        @click="returnToEditor"
                    >
                        editor
                    </button>
                </div>
            </div>

            <div v-if="isLoading" class="bg-white p-8 text-center text-lg text-[#5D00F5] shadow-lg">
                Carregando pré-visualização...
            </div>

            <div v-else-if="errorMessage" class="bg-white p-8 text-center text-lg text-[#5D00F5] shadow-lg">
                {{ errorMessage }}
            </div>

            <article v-else class="markdown-content bg-white p-5 shadow-xl sm:p-10">
                <p v-if="article.excerpt" class="preview-excerpt">{{ article.excerpt }}</p>
                <div v-html="renderedArticle"></div>
            </article>
        </div>
    </div>
</template>

<style scoped>
.preview-excerpt {
    border-left: 4px solid #a40084;
    color: #4b5563;
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.4;
    margin: 0 0 1.5rem;
    padding-left: 1rem;
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
</style>
