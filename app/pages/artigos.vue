<script setup>
import { computed } from 'vue';
import { isAllowedOgImageUrl } from '~/utils/articleRendering';

const { $api } = useNuxtApp();
const route = useRoute();
const router = useRouter();

const pageSize = 10;

function normalizeText(value) {
    return value == null ? '' : String(value);
}

function getQueryValue(value) {
    return Array.isArray(value) ? value[0] : value;
}

function normalizePage(value) {
    const pageNumber = Number.parseInt(getQueryValue(value), 10);

    if (!Number.isFinite(pageNumber) || pageNumber < 1) {
        return 1;
    }

    return pageNumber;
}

function normalizeArticleSummary(article = {}) {
    const title = normalizeText(article.title);

    return {
        slug: normalizeText(article.slug),
        title,
        excerpt: normalizeText(article.excerpt),
        ogImageUrl: isAllowedOgImageUrl(article.ogImageUrl) ? normalizeText(article.ogImageUrl) : '',
        imageAlt: title ? `Imagem do artigo ${title}` : 'Imagem do artigo'
    };
}

const currentPage = computed(() => normalizePage(route.query.page));
const apiPage = computed(() => currentPage.value - 1);

const {
    data: articlesResult,
    pending: isLoading,
    error: articlesError,
    refresh: refreshArticles
} = await useAsyncData(
    'articles-menu',
    async () => {
        const response = await $api.get('/api/articles/menu', {
            params: {
                page: apiPage.value,
                size: pageSize
            }
        });

        return response.data;
    },
    {
        watch: [apiPage]
    }
);

const articles = computed(() => (articlesResult.value?.content ?? []).map(normalizeArticleSummary));
const totalPages = computed(() => Number.parseInt(articlesResult.value?.totalPages ?? 0, 10) || 0);
const totalElements = computed(() => Number.parseInt(articlesResult.value?.totalElements ?? 0, 10) || 0);
const hasArticles = computed(() => articles.value.length > 0);
const showPagination = computed(() => totalPages.value > 1);
const safeCurrentPage = computed(() => {
    if (totalPages.value === 0) {
        return currentPage.value;
    }

    return Math.min(currentPage.value, totalPages.value);
});

function goToPage(page) {
    if (page < 1 || (totalPages.value > 0 && page > totalPages.value)) {
        return;
    }

    router.push({
        path: '/artigos',
        query: page === 1 ? {} : { page }
    });
}

useHead({
    title: 'Artigos | KDLouvor',
    meta: [
        { name: 'description', content: 'Leia artigos do KDLouvor sobre louvor, adoração, repertório e vida cristã.' },
        { property: 'og:title', content: 'Artigos | KDLouvor' },
        { property: 'og:description', content: 'Leia artigos do KDLouvor sobre louvor, adoração, repertório e vida cristã.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://kdlouvor.com/artigos' }
    ],
    link: [
        { rel: 'canonical', href: 'https://kdlouvor.com/artigos' }
    ]
});
</script>

<template>
    <main class="w-full px-8 py-8">
        <section class="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <header class="bg-white p-3 shadow-xl sm:p-6">
                <p class="text-sm font-bold uppercase text-[#5D00F5]">KDLouvor</p>
                <h1 class="mt-1 text-3xl font-bold leading-tight text-[#5D00F5] sm:text-4xl">Artigos</h1>
            </header>

            <div v-if="isLoading" class="bg-white p-8 text-center text-lg text-[#5D00F5] shadow-lg">
                Carregando artigos...
            </div>

            <div v-else-if="articlesError" class="bg-white p-8 text-center text-lg text-[#5D00F5] shadow-lg">
                <p>Não foi possível carregar os artigos.</p>
                <button type="button" class="mt-4 h-8 bg-[#5D00F5] px-4 text-white" @click="refreshArticles">
                    tentar novamente
                </button>
            </div>

            <div v-else-if="!hasArticles" class="bg-white p-8 text-center text-lg text-[#5D00F5] shadow-lg">
                Nenhum artigo encontrado.
            </div>

            <template v-else>
                <div class="flex flex-col gap-4">
                    <article v-for="article in articles" :key="article.slug || article.title" class="overflow-hidden bg-white shadow-xl">
                        <RouterLink :to="`/${article.slug}`" class="flex py-2 pr-2 sm:py-3 sm:pr-3 space-x-3">
                            <div class="shrink-0 bg-[#5D00F5] size-1/2 sm:size-2/5 md:size-1/3 lg:size-1/4 h-full pl-2">
                                <div v-if="article.ogImageUrl" class="aspect-[16/9] h-full w-full">
                                    <img :src="article.ogImageUrl" :alt="article.imageAlt" class="h-full w-full object-cover" loading="lazy">
                                </div>

                                <div v-else class="flex aspect-[16/9] h-full w-full items-center justify-center bg-[#5D00F5] px-4 text-center text-lg font-bold text-white">
                                    KDLouvor
                                </div>
                            </div>

                            <div class="flex min-w-0 flex-grow flex-col">
                                <h2 class="text-xl font-bold leading-tight text-[#5D00F5] md:text-2xl">{{ article.title }}</h2>
                                <p class="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-700 sm:text-base">{{ article.excerpt }}</p>
                            </div>
                        </RouterLink>
                    </article>
                </div>

                <div class="flex flex-col items-center justify-center gap-3 bg-white px-4 py-4 text-[#5D00F5] shadow-xl sm:flex-row sm:justify-between">
                    <span class="text-sm font-bold">
                        {{ totalElements }} artigo{{ totalElements === 1 ? '' : 's' }}
                    </span>

                    <div v-if="showPagination" class="flex items-center justify-center gap-2">
                        <button
                            type="button"
                            :disabled="safeCurrentPage === 1"
                            class="h-9 rounded-lg border border-[#5D00F5] px-3 font-bold disabled:opacity-50"
                            @click="goToPage(safeCurrentPage - 1)"
                        >
                            anterior
                        </button>
                        <span class="min-w-20 text-center font-bold">
                            {{ safeCurrentPage }} de {{ totalPages }}
                        </span>
                        <button
                            type="button"
                            :disabled="safeCurrentPage === totalPages"
                            class="h-9 rounded-lg border border-[#5D00F5] px-3 font-bold disabled:opacity-50"
                            @click="goToPage(safeCurrentPage + 1)"
                        >
                            próxima
                        </button>
                    </div>
                </div>
            </template>
        </section>
    </main>
</template>
