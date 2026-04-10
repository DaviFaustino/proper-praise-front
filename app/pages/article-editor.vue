<script setup>
import { computed, reactive, ref } from 'vue';
import { marked } from 'marked';
import ArticleEditingInputField from '~/components/ArticleEditingInputField.vue';
import ArticleEditingInputTextarea from '~/components/ArticleEditingInputTextarea.vue';

const { $api } = useNuxtApp();

definePageMeta({
    middleware: 'auth'
});

useHead({
    meta: [
        { name: 'robots', content: 'noindex' }
    ]
});

const date = new Date(Date.now());
const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
});
const publicationMessage = `Publicado em ${formattedDate}`;

function createEmptyArticle() {
    return {
        title: '',
        slug: '',
        excerpt: '',
        metaTitle: '',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        body: ''
    };
}

function normalizeArticleValue(value) {
    return value == null ? '' : String(value);
}

function extractArticleBody(content, title) {
    let parsedContent = normalizeArticleValue(content).replace(/\r\n/g, '\n');
    const heading = `# ${normalizeArticleValue(title)}`;

    if (normalizeArticleValue(title) && parsedContent.startsWith(heading)) {
        parsedContent = parsedContent.slice(heading.length);
    }

    parsedContent = parsedContent.replace(/^\n+/, '');
    parsedContent = parsedContent.replace(/^<div class="publication-date">.*?<\/div>\n*/s, '');

    return parsedContent.replace(/^\n+/, '');
}

const Article = {
    create(data = {}) {
        return {
            ...createEmptyArticle(),
            ...data
        };
    },
    assign(target, source = {}) {
        Object.assign(target, Article.create(source));
        return target;
    },
    reset(target) {
        Article.assign(target, createEmptyArticle());
    },
    fromApi(article = {}) {
        return Article.create({
            title: normalizeArticleValue(article.title),
            slug: normalizeArticleValue(article.slug),
            excerpt: normalizeArticleValue(article.excerpt),
            metaTitle: normalizeArticleValue(article.metaTitle ?? article.seoMetadata?.metaTitle),
            metaDescription: normalizeArticleValue(article.metaDescription ?? article.seoMetadata?.metaDescription),
            ogTitle: normalizeArticleValue(article.ogTitle ?? article.seoMetadata?.ogTitle),
            ogDescription: normalizeArticleValue(article.ogDescription ?? article.seoMetadata?.ogDescription),
            ogImage: normalizeArticleValue(article.ogImageUrl ?? article.seoMetadata?.ogImageUrl),
            body: extractArticleBody(article.content, article.title)
        });
    },
    buildContent(article) {
        return `# ${normalizeArticleValue(article.title)}\n\n<div class="publication-date">${publicationMessage}</div>\n\n${normalizeArticleValue(article.body)}`;
    },
    toPayload(article) {
        return {
            title: normalizeArticleValue(article.title),
            slug: normalizeArticleValue(article.slug),
            content: Article.buildContent(article),
            excerpt: normalizeArticleValue(article.excerpt),
            seoMetadata: {
                metaTitle: normalizeArticleValue(article.metaTitle),
                metaDescription: normalizeArticleValue(article.metaDescription),
                ogTitle: normalizeArticleValue(article.ogTitle),
                ogDescription: normalizeArticleValue(article.ogDescription),
                ogImageUrl: normalizeArticleValue(article.ogImage) === '' ? null : normalizeArticleValue(article.ogImage)
            }
        };
    }
};

const currentArticle = reactive(Article.create());

const validationFailed = ref(false);

const isTitleValid = computed(() => {
    return currentArticle.title.length <= 160 && currentArticle.title.length > 0;
});
const isSlugValid = computed(() => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(currentArticle.slug) && currentArticle.slug.length <= 100 && currentArticle.slug.length > 0;
});
const isExcerptValid = computed(() => {
    return currentArticle.excerpt.length <= 300;
});
const isMetaTitleValid = computed(() => {
    return currentArticle.metaTitle.length <= 60;
});
const isMetaDescriptionValid = computed(() => {
    return currentArticle.metaDescription.length <= 160;
});
const isOgTitleValid = computed(() => {
    return currentArticle.ogTitle.length <= 60;
});
const isOgDescriptionValid = computed(() => {
    return currentArticle.ogDescription.length <= 160;
});
const isOgImageValid = computed(() => {
    return currentArticle.ogImage === '' ||
        (currentArticle.ogImage.length > 0 && currentArticle.ogImage.startsWith('https://kdlouvor.com/'));
});
const isFormValid = computed(() => {
    return isTitleValid.value &&
        isSlugValid.value &&
        isExcerptValid.value &&
        isMetaTitleValid.value &&
        isMetaDescriptionValid.value &&
        isOgTitleValid.value &&
        isOgDescriptionValid.value &&
        isOgImageValid.value;
});
const renderedArticle = computed(() => {
    return marked(Article.buildContent(currentArticle));
});

async function saveArticle() {
    if (!isFormValid.value) {
        alert('Por favor, corrija os erros no formulário antes de salvar.');
        validationFailed.value = true;
        return;
    }

    validationFailed.value = false;

    try {
        await createArticle();
    } catch (error) {
        console.error('There was an error!', error);
        alert('Ocorreu um erro ao salvar o artigo. Por favor, tente novamente.');
    }
}

async function createArticle() {
    await $api.post('/api/articles', Article.toPayload(currentArticle));

    alert('Artigo salvo com sucesso!');
    Article.reset(currentArticle);
}

const searchByDraftActivated = ref(false);
function toggleSearchByDraft() {
    searchByDraftActivated.value = !searchByDraftActivated.value;

    if (searchByDraftActivated.value) {
        requestArticleSuggestions();
        inputFocused.value = true;
    }
}

const searchInput = ref('');
const articleSuggestions = ref([]);
const inputFocused = ref(false);
const lastArticleSuggestionsSearch = ref('');

const filteredArticleSuggestions = computed(() => {
    return articleSuggestions.value.filter(suggestion =>
        String(suggestion.title).toLowerCase().includes(searchInput.value.toLowerCase())
    );
});
const showArticleSuggestions = computed(() => {
    return (searchInput.value.length > 2 || searchByDraftActivated.value) && filteredArticleSuggestions.value.length > 0 && inputFocused.value;
});

function handleInputBlur() {
    setTimeout(() => {inputFocused.value = false}, 250);
}

function onInputChange(event) {
    if (event.target.value[0] === " ") {
        searchInput.value = "";
    } else {
        searchInput.value = event.target.value;
    }

    if (searchInput.value.length > 2) {
        const firstThreeLetters = searchInput.value.substring(0, 3);

        if (firstThreeLetters.toLowerCase() !== String(lastArticleSuggestionsSearch.value).toLowerCase()) {
            requestArticleSuggestions(firstThreeLetters);
        }
    }
}

function requestArticleSuggestions(firstThreeLetters) {
    return $api.get('/api/articles/suggestions', {
            params: {
                onlyDraft: searchByDraftActivated.value,
                titleFilter: firstThreeLetters
            }
        })
        .then(response => {
            lastArticleSuggestionsSearch.value = firstThreeLetters;
            articleSuggestions.value = response.data;
            articleSuggestions.value.sort((a, b) => a.title.localeCompare(b.title));
        })
        .catch(() => {
            console.error('Error fetching article suggestions.');
        });
}

function handleSuggestionClick(suggestion) {
    searchInput.value = suggestion.title;
    inputFocused.value = false;

    $api.get(`/api/articles/${suggestion.slug}`)
        .then(response => {
            const fetchedArticle = Article.fromApi(response.data);

            Article.assign(currentArticle, fetchedArticle);
        })
        .catch(() => {
            console.error('Error fetching article details.');
        });
}
</script>

<template>
    <div class="flex flex-col items-center justify-center min-w-full 2xl:px-20">
        <div class="mt-10 bg-white rounded-xl border-8 border-white text-2xl sm:text-3xl text-[#5D00F5] font-bold shadow-lg">Editor de Artigos</div>

        <div class="w-full p-8 sm:p-16 xl:p-10">
            <div class="relative flex bg-white max-w-[30rem] p-3 space-x-3 shadow-lg">
                <input v-if="!searchByDraftActivated" v-model="searchInput" @input="onInputChange($event)" @focus="inputFocused = true" @blur="handleInputBlur" type="text" class="border border-gray-300 rounded-md p-1 w-full text-sm sm:text-md focus:outline-none" placeholder="Buscar artigo por título" />
                <button @click="toggleSearchByDraft" class="flex justify-center items-center h-8 mr-1 rounded-lg" :class="[ searchByDraftActivated ? 'w-full bg-[#a40084]': 'w-fit px-1 bg-[#5D00F5]' ]">
                    <span v-if="!searchByDraftActivated" class="sm:text-lg text-white">Rascunhos</span>
                    <span v-if="searchByDraftActivated" class="sm:text-lg text-white">Buscar por título</span>
                </button>

                <div v-if="showArticleSuggestions" class="absolute top-full left-0 w-fit max-h-44 overflow-y-auto mt-0.5 rounded-lg bg-[#5D00F5] text-white z-10">
                    <ul class="mt-1">
                        <li v-for="fas in filteredArticleSuggestions" :key="fas" :id="fas" class="hover:bg-white px-2 pr-5">
                            <button type="button" @click="handleSuggestionClick(fas)" class="w-full hover:text-[#5D00F5] text-left">{{ fas.title }}</button>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="flex flex-col xl:flex-row w-full mt-10 xl:space-x-5 space-y-10 xl:space-y-0">
                <div id="principal" class="">
                    <div class="flex w-fit px-2 justify-center bg-white border-[#5D00F5] border-l-2 shadow-md">
                        <label class="text-center text-md sm:text-lg font-bold">Principal</label>
                    </div>
                    <div class="max-w-full sm:w-[26rem] h-fit bg-white shadow-md mt-2 p-4">
                        <div class="flex flex-col space-y-2">
                            <ArticleEditingInputField label="Título" placeholder="Digite o título do artigo"
                                :validationFailed="validationFailed" :isValueValid="isTitleValid" v-model="currentArticle.title"/>
                            <ArticleEditingInputField label="Slug" placeholder="Digite o slug do artigo"
                                :validationFailed="validationFailed" :isValueValid="isSlugValid" v-model="currentArticle.slug"/>
                            <ArticleEditingInputTextarea label="Trecho" placeholder="Digite o trecho do artigo"
                                :validationFailed="validationFailed" :isValueValid="isExcerptValid" v-model="currentArticle.excerpt"/>
                        </div>
                    </div>
                </div>
                <div id="metadados" class="">
                    <div class="flex w-fit px-2 justify-center bg-white border-[#5D00F5] border-l-2 shadow-md">
                        <label class="text-center text-md sm:text-lg font-bold">Metadados</label>
                    </div>
                    <div class="max-w-full sm:w-[26rem] lg:w-[50rem] h-fit bg-white shadow-md mt-2 p-4">
                        <div class="flex flex-col lg:flex-row w-full space-y-2 lg:space-y-0 lg:space-x-2">
                            <div class="w-full space-y-2">
                                <ArticleEditingInputField label="meta title" placeholder="Digite o meta título do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isMetaTitleValid" v-model="currentArticle.metaTitle"/>
                                <ArticleEditingInputTextarea label="meta description" placeholder="Digite a meta descrição do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isMetaDescriptionValid" v-model="currentArticle.metaDescription"/>
                            </div>
                            <div class="w-full space-y-2">
                                <ArticleEditingInputField label="og title" placeholder="Digite o og title do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isOgTitleValid" v-model="currentArticle.ogTitle"/>
                                <ArticleEditingInputTextarea label="og description" placeholder="Digite o og description do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isOgDescriptionValid" v-model="currentArticle.ogDescription"/>
                                <ArticleEditingInputField label="og image" placeholder="Digite o og image do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isOgImageValid" v-model="currentArticle.ogImage"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex w-fit mt-5 px-2 justify-center bg-white border-[#5D00F5] border-l-2 shadow-md">
                <label class="text-center text-md sm:text-lg font-bold">Conteúdo</label>
            </div>
            <div class="flex flex-col lg:flex-row w-full mt-5 lg:space-x-10 space-y-10 lg:space-y-0">
                <div class="flex flex-col w-full">
                    <label class="w-20 text-center text-sm sm:text-md bg-white">markdown</label>
                    <textarea
                        class="w-full h-[30rem] p-2 text-sm sm:text-md shadow-xl resize-none focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                        v-model="currentArticle.body"
                    ></textarea>
                </div>
                <div class="flex flex-col w-full">
                    <label class="w-12 text-center text-sm sm:text-md bg-white">html</label>
                    <div class="markdown-content bg-white w-full h-[30rem] p-4 text-sm sm:text-md shadow-xl overflow-auto" v-html="renderedArticle"></div>
                </div>
            </div>

            <div class="flex w-full items-end justify-end mt-5">
                <div class="flex p-3 bg-white shadow-lg">
                    <button class="flex justify-center items-center sm:text-lg text-white h-7 sm:h-8 w-24 sm:w-28 mr-1 rounded-lg bg-[#5D00F5]" @click="saveArticle">salvar</button>
                    <button class="flex justify-center items-center sm:text-lg text-white h-7 sm:h-8 w-24 sm:w-28 mr-1 rounded-lg bg-[#5D00F5]">{{ true ? 'publicar': 'publicado' }}</button>
                    <button class="flex justify-center items-center sm:text-lg text-white h-7 sm:h-8 w-24 sm:w-28 mr-1 rounded-lg bg-[#5D00F5]">arquivar</button>
                </div>
            </div>
        </div>
    </div> 
</template>
