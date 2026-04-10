<script setup>
import { ref, computed } from 'vue';
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

const title = ref('');
const slug = ref('');
const excerpt = ref('');
const metaTitle = ref('');
const metaDescription = ref('');
const ogTitle = ref('');
const ogDescription = ref('');
const ogImage = ref('');

const articleBody = ref('');
const markdownContent = ref('');

const date = new Date(Date.now());
const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
});
const publicationMessage = `Publicado em ${formattedDate}`;

const renderedArticle = computed(() => {
    markdownContent.value = `# ${title.value}\n\n<div class="publication-date">publicationMessage</div>\n\n${articleBody.value}`;
    return marked(markdownContent.value.replace('publicationMessage', publicationMessage));
})

const isTitleValid = computed(() => {
    return title.value.length <= 160 && title.value.length > 0;
});
const isSlugValid = computed(() => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug.value) && slug.value.length <= 100 && slug.value.length > 0;
});
const isExcerptValid = computed(() => {
    return excerpt.value.length <= 300;
});
const isMetaTitleValid = computed(() => {
    return metaTitle.value.length <= 60;
});
const isMetaDescriptionValid = computed(() => {
    return metaDescription.value.length <= 160;
});
const isOgTitleValid = computed(() => {
    return ogTitle.value.length <= 60;
});
const isOgDescriptionValid = computed(() => {
    return ogDescription.value.length <= 160;
});
const isOgImageValid = computed(() => {
    return ogImage.value === null ||
        ogImage.value === '' ||
        (ogImage.value.length > 0 && ogImage.value.startsWith('https://kdlouvor.com/'));
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
const validationFailed = ref(false);

function saveArticle() {
    if (!isFormValid.value) {
        alert('Por favor, corrija os erros no formulário antes de salvar.');
        validationFailed.value = true;
        return;
    }

    createArticle();
    validationFailed.value = false;
}

function createArticle() {
    $api.post("/api/articles", {
            title: title.value,
            slug: slug.value,
            content: markdownContent.value,
            excerpt: excerpt.value,
            seoMetadata: {
                metaTitle: metaTitle.value,
                metaDescription: metaDescription.value,
                ogTitle: ogTitle.value,
                ogDescription: ogDescription.value,
                ogImageUrl: ogImage.value === '' ? null : ogImage.value
            }
        })
        .then(() => {
            alert('Artigo salvo com sucesso!');
            title.value = '';
            slug.value = '';
            excerpt.value = '';
            metaTitle.value = '';
            metaDescription.value = '';
            ogTitle.value = '';
            ogDescription.value = '';
            ogImage.value = '';
            articleBody.value = '';
        })
        .catch(() => {
            console.error("There was an error!");
            alert('Ocorreu um erro ao salvar o artigo. Por favor, tente novamente.');
        });
}

const searchByDraftActivated = ref(false);
function toggleSearchByDraft() {
    searchByDraftActivated.value = !searchByDraftActivated.value;

    requestArticleSuggestions();
}

const searchInput = ref('');
const articleSuggestions = ref([]);
const filteredArticleSuggestions = computed(() => {
    return articleSuggestions.value.filter(suggestion =>
        String(suggestion.title).toLowerCase().includes(searchInput.value.toLowerCase())
    );
});
const inputFocused = ref(false);
const showArticleSuggestions = computed(() => {
    return (searchInput.value.length > 2 || searchByDraftActivated.value) && filteredArticleSuggestions.value.length > 0 && inputFocused.value;
});

function handleInputBlur() {
    setTimeout(() => {inputFocused.value = false}, 250);
}

const lastArticleSuggestionsSearch = ref('');

function onInputChange(event) {
    if (event.target.value[0] === " ") {
        searchInput.value = "";
    } else {
        searchInput.value = event.target.value;
    }

    if (searchInput.value.length > 2) {
        let firstThreeLetters = searchInput.value.substring(0, 3);

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

    $api.get(`/api/articles/${suggestion.slug}`)
        .then(response => {
            const article = response.data;
            title.value = article.title;
            slug.value = article.slug;
            excerpt.value = article.excerpt;
            metaTitle.value = article.metaTitle;
            metaDescription.value = article.metaDescription;
            ogTitle.value = article.ogTitle;
            ogDescription.value = article.ogDescription;
            ogImage.value = article.ogImageUrl;
            articleBody.value = article.content;
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
                                :validationFailed="validationFailed" :isValueValid="isTitleValid" v-model="title"/>
                            <ArticleEditingInputField label="Slug" placeholder="Digite o slug do artigo"
                                :validationFailed="validationFailed" :isValueValid="isSlugValid" v-model="slug"/>
                            <ArticleEditingInputTextarea label="Trecho" placeholder="Digite o trecho do artigo"
                                :validationFailed="validationFailed" :isValueValid="isExcerptValid" v-model="excerpt"/>
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
                                    :validationFailed="validationFailed" :isValueValid="isMetaTitleValid" v-model="metaTitle"/>
                                <ArticleEditingInputTextarea label="meta description" placeholder="Digite a meta descrição do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isMetaDescriptionValid" v-model="metaDescription"/>
                            </div>
                            <div class="w-full space-y-2">
                                <ArticleEditingInputField label="og title" placeholder="Digite o og title do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isOgTitleValid" v-model="ogTitle"/>
                                <ArticleEditingInputTextarea label="og description" placeholder="Digite o og description do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isOgDescriptionValid" v-model="ogDescription"/>
                                <ArticleEditingInputField label="og image" placeholder="Digite o og image do artigo"
                                    :validationFailed="validationFailed" :isValueValid="isOgImageValid" v-model="ogImage"/>
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
                    <textarea class="w-full h-[30rem] p-2 text-sm sm:text-md shadow-xl resize-none focus:outline-none" v-model="articleBody"></textarea>
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
