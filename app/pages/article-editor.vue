<script setup>
import { ref, computed } from 'vue';
import { marked } from 'marked';
import ArticleEditingInputField from '~/components/ArticleEditingInputField.vue';
import ArticleEditingInputTextarea from '~/components/ArticleEditingInputTextarea.vue';

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
</script>

<template>
    <div class="flex flex-col items-center justify-center min-w-full 2xl:px-20">
        <div class="mt-10 bg-white rounded-xl border-8 border-white text-2xl sm:text-3xl text-[#5D00F5] font-bold shadow-lg">Editor de Artigos</div>

        <div class="w-full p-8 sm:p-16 xl:p-10">
            <div class="flex bg-white max-w-[30rem] p-3 space-x-3 shadow-lg">
                <input type="text" class="border border-gray-300 rounded-md p-1 w-full text-sm sm:text-md focus:outline-none" placeholder="Buscar artigo por slug" />
                <button class="flex justify-center items-center h-8 w-24 mr-1 rounded-lg bg-[#5D00F5]">
                    <span class="sm:text-lg text-white">Buscar</span>
                </button>
            </div>
            <div class="flex flex-col xl:flex-row w-full mt-10 xl:space-x-5 space-y-10 xl:space-y-0">
                <div id="principal" class="">
                    <div class="flex w-fit px-2 justify-center bg-white border-[#5D00F5] border-l-2 shadow-md">
                        <label class="text-center text-md sm:text-lg font-bold">Principal</label>
                    </div>
                    <div class="max-w-full sm:w-[26rem] h-fit bg-white shadow-md mt-2 p-4">
                        <div class="flex flex-col space-y-2">
                            <ArticleEditingInputField label="Título" placeholder="Digite o título do artigo" v-model="title"/>
                            <ArticleEditingInputField label="Slug" placeholder="Digite o slug do artigo" v-model="slug"/>
                            <ArticleEditingInputTextarea label="Trecho" placeholder="Digite o trecho do artigo" v-model="excerpt"/>
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
                                <ArticleEditingInputField label="meta title" placeholder="Digite o meta título do artigo" v-model="metaTitle"/>
                                <ArticleEditingInputTextarea label="meta description" placeholder="Digite a meta descrição do artigo" v-model="metaDescription"/>
                            </div>
                            <div class="w-full space-y-2">
                                <ArticleEditingInputField label="og title" placeholder="Digite o og title do artigo" v-model="ogTitle"/>
                                <ArticleEditingInputTextarea label="og description" placeholder="Digite o og description do artigo" v-model="ogDescription"/>
                                <ArticleEditingInputField label="og image" placeholder="Digite o og image do artigo" v-model="ogImage"/>
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
                    <button class="flex justify-center items-center sm:text-lg text-white h-7 sm:h-8 w-24 sm:w-28 mr-1 rounded-lg bg-[#5D00F5]">salvar</button>
                    <button class="flex justify-center items-center sm:text-lg text-white h-7 sm:h-8 w-24 sm:w-28 mr-1 rounded-lg bg-[#5D00F5]">{{ true ? 'publicar': 'publicado' }}</button>
                    <button class="flex justify-center items-center sm:text-lg text-white h-7 sm:h-8 w-24 sm:w-28 mr-1 rounded-lg bg-[#5D00F5]">arquivar</button>
                </div>
            </div>
        </div>
    </div> 
</template>
