<script setup>
import axios from 'axios';
import { onMounted, computed, reactive, ref } from 'vue';
import SearchTypeButton from '../components/SearchTypeButton.vue';
import arrowicon from '~/assets/arrow.svg';
import mglassicon from '~/assets/ma-glass-icon.svg';
import logo from '~/assets/logo.svg'

const { searchInput, themesNames, filteredThemeSuggestions, onInputChange, requestThemesNames } = useThemesSearch();

const byThemeOn = ref(true);

function showOption(optionId) {
    if ((optionId === 'by-theme' & byThemeOn.value === true) || (optionId === 'by-title' & byThemeOn.value === false)) {
        return;
    }
    byThemeOn.value = !byThemeOn.value;
    if (byThemeOn.value) {
        searchInput.value = lastSearchByThemeAndDynamics.value;
    } else {
        searchInput.value = lastSearchByTitle.value;
    }
}

const dynamicTrackOn = ref(false);

const { knobPosition, knobX, isKnobBig, startDragging } = useDynamics();

const searchInputPlaceHolder = computed(() => {
    return byThemeOn.value ? "Insira um tema" : "Insira um título";
});
const isSearchInputFull = computed(() => {
    let result = searchInput.value != "";
    if (result) {
        if (knobPosition.value > 28) {
            knobPosition.value = 28;
        }
    }
    isKnobBig.value = result;
    return result;
});

const inputFocused = ref(false);
const showThemeSuggestions = computed(() => {
    return (byThemeOn.value && searchInput.value.length > 2 && inputFocused.value)
});

function handleInputBlur() {
    setTimeout(() => {inputFocused.value = false}, 250);
}

const isRequestButtonDisabled = computed(() => {
    return (!dynamicTrackOn.value && searchInput.value.length < 2) || (dynamicTrackOn && searchInput.value.length === 1) || (!byThemeOn.value && searchInput.value.length < 2);
});

const lastSearchWasByTitle = ref(false);
const lastSearchByThemeAndDynamics = ref("");
const lastSearchByTitle = ref("");
const lastKnobPosition = ref(null);
const isLoading = ref(false);

async function newSearch(pageNumber, isPageNavigation) {
    window.scrollTo({ top: 300, behavior: 'smooth' });
    window.dispatchEvent(new Event('scroll'));
    stopedScrolling = false

    isLoading.value = true;

    if (!isPageNavigation) {
        if (byThemeOn.value) {
            lastSearchByThemeAndDynamics.value = searchInput.value;
            if (dynamicTrackOn.value) {
                lastKnobPosition.value = knobPosition.value;
            } else {
                lastKnobPosition.value = null;
            }

            let themeExists = false;
            if (!dynamicTrackOn.value || (dynamicTrackOn.value && searchInput.value.length > 1)) {
                themeExists = checkIfSearchedThemeExists();

                if (!themesNames.value.includes(searchInput.value)) {
                    await requestThemesNames(searchInput.value);
                    themeExists = checkIfSearchedThemeExists();
                }
            }

            if (themeExists || (dynamicTrackOn.value && searchInput.value.length === 0)) {
                await requestVersionsByThemeAndDynamics(pageNumber);
            } else {
                receivedVersions = [];
            }
            lastSearchWasByTitle.value = false;
        } else {
            lastSearchByTitle.value = searchInput.value;
            await requestVersionsByTitle(pageNumber);
            lastSearchWasByTitle.value = true;
        }
    } else {
        if (lastSearchWasByTitle.value) {
            byThemeOn.value = false;
            await requestVersionsByTitle(pageNumber);
        } else {
            byThemeOn.value = true;
            await requestVersionsByThemeAndDynamics(pageNumber);
        }
    }

    setVersions(isPageNavigation);
}

function checkIfSearchedThemeExists() {
    for (let i = 0; i < themesNames.value.length; i++) {
        if (themesNames.value.at(i).toLowerCase() === searchInput.value.toLowerCase()) {
            searchInput.value = themesNames.value.at(i);
            lastSearchByThemeAndDynamics.value = searchInput.value;
            return true;
        }
    }
    return false;
}

const config = useRuntimeConfig();
const backendURL = config.public.backendUrl;
let receivedVersions;
const versions = reactive({ values:[] })
const totalPages = ref(0);
const currentPage = ref(1);
const isVersionsListVisible = computed(() => {
    return versions.values.length > 0;
});
const zeroResultsFound = ref(false);

function requestVersionsByThemeAndDynamics(pageNumber) {
    let fullURL;
    currentPage.value = pageNumber;

    if (lastSearchByThemeAndDynamics.value !== "") {
        if (lastKnobPosition.value != null) {
            fullURL = `${backendURL}/api/song?theme=${lastSearchByThemeAndDynamics.value}&songDynamics=${lastKnobPosition.value}&pageNumber=${pageNumber}`;
        } else {
            fullURL = `${backendURL}/api/song?theme=${lastSearchByThemeAndDynamics.value}&pageNumber=${pageNumber}`;
        }
    } else {
        if (lastKnobPosition.value != null) {
            fullURL = `${backendURL}/api/song?songDynamics=${lastKnobPosition.value}&pageNumber=${pageNumber}`;
        } else {
            alert('Informe ao menos um parâmetro de busca.');
        }
    }

    return axios.get(fullURL)
        .then(response => {
            receivedVersions = response.data.versions;
            totalPages.value = response.data.totalPages;

            if (byThemeOn.value) {
                searchInput.value = lastSearchByThemeAndDynamics.value;
            }
            if (lastKnobPosition.value != null) {
                knobPosition.value = lastKnobPosition.value;
                dynamicTrackOn.value = true;
            } else {
                dynamicTrackOn.value = false;
            }
        })
        .catch(error => {
            console.log(error);
        });
}

function requestVersionsByTitle(pageNumber) {
    let fullURL = `${backendURL}/api/song/t?searchTerm=${lastSearchByTitle.value}&pageNumber=${pageNumber}`;
    currentPage.value = pageNumber;

    return axios.get(fullURL)
        .then(response => {
            receivedVersions = response.data.versions;
            totalPages.value = response.data.totalPages;

            if (!byThemeOn.value) {
                searchInput.value = lastSearchByTitle.value;
            }
        })
        .catch(error => {
            console.log(error);
        });
}

let isScrolling;
let stopedScrolling = true;

function setVersions(isPageNavigation) {
    if ((stopedScrolling || !isPageNavigation) && (receivedVersions != null)) {
        versions.values = receivedVersions;
        receivedVersions = null;
        isLoading.value = false;

        if (versions.values.length === 0) {
            zeroResultsFound.value = true;
        } else {
            zeroResultsFound.value = false;
        }
    }
}

const dynamicsColors = ['#03b6fa','#09aafa','#0f9ef9','#1493f9','#1a87f9','#207bf8','#266ff8','#2c63f8','#3158f7','#374cf7',
'#3d40f7','#4334f6','#4929f6','#4f1df6','#5411f5','#5a06f5','#6200ed','#6b00de','#7500cf','#7e00c0','#8800b1','#9100a2',
'#9b0093','#a40084','#ae0176','#b70167','#c10158','#ca0149','#d4013a','#dd012b','#e7011c','#f0010d']

const { isAuthenticated } = useAuth();
const versionToEdit = ref(null);
const showUpdateVersionModal = ref(false);

function closeUpdateVersionModal(version) {
    showUpdateVersionModal.value = false;

    if (version != null) {
        for (let i = 0; i < versions.values.length; i++) {
            if (versions.values[i].id === version.id) {
                versions.values[i] = version;
                break;
            }
        }
    }
}

onMounted(() => {
    window.addEventListener('scroll', () => {
        clearTimeout(isScrolling);

        isScrolling = setTimeout(() => {
            stopedScrolling = true;
            setVersions(true);
        }, 50);
    });
})
</script>

<template>
    <div class="flex flex-col justify-center items-center space-y-5">
        <div class=" bg-white py-5 px-10 mt-10 rounded-xl shadow">
            <img :src="logo" alt="Logo" class="w-72 sm:w-96 h-auto pointer-events-none"/>
        </div>

        <p class="sm:text-lg w-[15rem] sm:w-auto text-center text-[#5D00F5] bg-white px-2 rounded-lg shadow">Um lugar para buscar o louvor ideal para a ocasião.</p>
    </div>

    <div id="search-area" class="flex flex-col items-center w-fit mt-5 sm:mt-[3.75rem] py-7 sm:py-10 px-9 sm:px-10 md:px-20 rounded-2xl sm:bg-white sm:shadow-2xl">
        <div class="border-y-[10px] sm:border-y-0 border-x-[15px] sm:border-x-0 rounded-2xl border-white shadow-lg sm:shadow-none">
            <div class="flex items-center border-[1px] border-[#5D00F5] bg-white rounded-xl p-1">
                <SearchTypeButton @selected="showOption" buttonText="por tema" optionId="by-theme" class="h-7 w-32 sm:w-40 rounded-lg" :class="[ byThemeOn ? 'bg-[#5D00F5] text-white' : 'bg-white text-[#5D00F5]' ]"/>
                <SearchTypeButton @selected="showOption" buttonText="por título" optionId="by-title" class="h-7 w-32 sm:w-40 rounded-lg" :class="[ byThemeOn ? 'bg-white text-[#5D00F5]' : 'bg-[#5D00F5] text-white' ]"/>
            </div>
        </div>

        <div class="flex flex-col items-center mt-3 sm:mt-10">
            <div class="border-t-[20px] border-b-[10px] sm:border-y-0 border-x-[25px] sm:border-x-0 rounded-2xl border-white bg-white shadow-lg sm:shadow-none">
                <div class="relative">
                    <input type="text" :placeholder="searchInputPlaceHolder" v-model="searchInput" class="border-2 border-[#5D00F5] rounded-lg p-2 w-[20rem] sm:w-96" @input="onInputChange($event, byThemeOn)" @focus="inputFocused = true" @blur="handleInputBlur">

                    <div v-if="showThemeSuggestions" class="absolute top-full left-0 w-fit max-h-44 overflow-y-auto mt-0.5 rounded-lg bg-[#5D00F5] bg-opacity-80 text-white z-10">
                        <ul class="mt-1">
                            <li v-for="ts in filteredThemeSuggestions" :key="ts" :id="ts" class="hover:bg-white px-2 pr-5">
                                <button type="button" @click="searchInput = ts" class="w-full hover:text-[#5D00F5] text-left">{{ ts }}</button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div v-if="byThemeOn" class=" w-[20rem] sm:w-96">
                    <button class="flex items-center space-x-2 mb-0 sm:mb-1 text-lg" @click="dynamicTrackOn = !dynamicTrackOn">
                        <img :src="arrowicon" alt="glass" class="w-5 h-7 my-1 ml-2" :class="[ dynamicTrackOn ? 'rotate-180' : '' ]"/>
                        <div class="text-[#5D00F5]" v-if="!dynamicTrackOn">definir dinâmica</div>
                    </button>

                    <div id="track" class="relative w-[20rem] sm:w-96 h-4 rounded-2xl top-1/2 -translate-y-1/2 bg-cover bg-center" style="background: linear-gradient(90deg,rgba(0, 188, 250, 1) 0%, rgba(93, 0, 245, 1) 50%, rgba(245, 1, 6, 1) 100%);" v-if="dynamicTrackOn" @mousedown="startDragging">
                        <div class="absolute h-5 border-4 border-gray-700 rounded-2xl top-1/2 -translate-y-1/2 pointer-events-none" :class="[isSearchInputFull ? 'w-10 sm:w-12' : 'w-[10px] sm:w-3' ]" :style="{left: knobX + '%'}"></div>
                    </div>
                </div>
            </div>

            <div :class="[ dynamicTrackOn || !byThemeOn ? 'h-8': 'h-4']"></div>
            <div class="bg-white p-2 rounded-xl shadow-xl sm:shadow-none">
                <button type="button" :disabled="isRequestButtonDisabled" @click="newSearch(0, false)" class="flex items-center border-[1px] border-[#5D00F5] rounded-lg py-1 px-2 space-x-2" :class="{ 'opacity-60': isRequestButtonDisabled }">
                    <img :src="mglassicon" alt="glass" class="size-5" draggable="false">
                    <div class="text-lg text-[#5D00F5]">Buscar</div>
                </button>
            </div>
        </div>
    </div>

    <div v-if="zeroResultsFound" class="flex flex-col items-center py-3 px-5 my-5 rounded-2xl bg-white shadow-xl text-xl text-[#5D00F5]">
        <span>0 resultados encontrados</span>
    </div>

    <div id="loading" v-if="isLoading" class="mt-5 size-[3.75rem] border-8 border-t-white border-b-[#5D00F5] border-r-[#5D00F5] border-l-[#5D00F5] rounded-full animate-spin"></div>

    <div v-if="isVersionsListVisible" class="flex flex-col items-center w-fit mt-5 mb-10 rounded-2xl" :class="{ 'opacity-50 pointer-events-none': isLoading }">
        <ul class="flex flex-col max-w-[100vw] px-2">
            <li v-for="versionId in Array.from({ length: versions.values.length }, (_, index) => index)" class="bg-white max-w-full rounded-xl p-1 m-1 shadow-xl">
                <div class="max-w-full rounded-lg p-[1px] m-2 bg-gradient-to-r from-[#5D00F5]" :class="`to-[${dynamicsColors[versions.values[versionId].songDynamics]}]`">
                    <div class="max-w-full flex flex-col w-[26rem] sm:w-[28rem] md:w-[33rem] bg-white rounded-[7px] p-2">
                        <div class="flex">
                            <div class="flex flex-col w-full text-[#5D00F5]">
                                <div class="flex w-full justify-between">
                                    <span class="text-xl font-bold">{{ versions.values[versionId].title }}</span>
                                    <button v-if="isAuthenticated" @click="versionToEdit=versionId; showUpdateVersionModal=true" class="flex justify-center h-6 w-16 mr-1 rounded-lg border border-[#5D00F5]">
                                        <span>editar</span>
                                    </button>
                                </div>
                                <span>{{ versions.values[versionId].owner }}</span>
                            </div>
                            <div class="flex flex-col items-center" >
                                <div class="flex w-12 h-6 rounded-md items-center justify-center" :class="`bg-[${dynamicsColors[versions.values[versionId].songDynamics]}]`">
                                    <span class="text-white">{{ versions.values[versionId].tone }}</span>
                                </div>
                                <a :href="versions.values[versionId].links[0]" target="_blank" rel="noopener noreferrer" class="flex w-full items-center">
                                    <svg fill="#5D00F5" class="size-6 ml-[1px]" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 310 310" xml:space="preserve" preserveAspectRatio="none">
                                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                        <g id="SVGRepo_iconCarrier">
                                            <g id="XMLID_822_">
                                                <path id="XMLID_823_" d="M297.917,64.645c-11.19-13.302-31.85-18.728-71.306-18.728H83.386c-40.359,0-61.369,5.776-72.517,19.938 C0,79.663,0,100.008,0,128.166v53.669c0,54.551,12.896,82.248,83.386,82.248h143.226c34.216,0,53.176-4.788,65.442-16.527 C304.633,235.518,310,215.863,310,181.835v-53.669C310,98.471,309.159,78.006,297.917,64.645z M199.021,162.41l-65.038,33.991 c-1.454,0.76-3.044,1.137-4.632,1.137c-1.798,0-3.592-0.484-5.181-1.446c-2.992-1.813-4.819-5.056-4.819-8.554v-67.764 c0-3.492,1.822-6.732,4.808-8.546c2.987-1.814,6.702-1.938,9.801-0.328l65.038,33.772c3.309,1.718,5.387,5.134,5.392,8.861 C204.394,157.263,202.325,160.684,199.021,162.41z"></path>
                                            </g>
                                        </g>
                                    </svg>
                                    <div class="flex flex-col h-full">
                                        <span class="text-[#5D00F5] text-[9px] h-2 mt-[1px] font-bold">You</span>
                                        <span class="text-[#5D00F5] text-[9px] h-2 font-bold">Tube</span>
                                    </div>
                                    <div class="absolute w-12 h-5 border-[1px] rounded border-[#5D00F5]"></div>
                                </a>
                            </div>
                        </div>
                        <div class="flex flex-wrap w-full mt-2">
                            <span v-for="theme in versions.values[versionId].themes" class="mr-2 mt-1 px-2 rounded-lg text-white bg-[#5D00F5]">{{ theme }}</span>
                        </div>
                    </div>
                </div>
            </li>
        </ul>

        <div class="flex bg-white shadow-xl rounded-xl items-center justify-center mt-5 py-2 px-5 space-x-2">
            <button type="button" :disabled="currentPage === 0" @click="newSearch(currentPage - 1, true)" class="flex items-center justify-center h-8 w-12 bg-white rounded-lg border-[1px] border-[#5D00F5]" :class="[ currentPage === 0 ? 'opacity-60' : '' ]">
                <img :src="arrowicon" alt="lest arrow" class="w-5 h-7 -rotate-90"/>
            </button>
            <div class="text-[#5D00F5] text-xl">
                <span>{{ currentPage + 1 }}</span>
                de
                <span>{{ totalPages }}</span>
            </div>
            <button type="button" :disabled="currentPage === totalPages - 1" @click="newSearch(currentPage + 1, true)" class="flex items-center justify-center h-8 w-12 bg-white rounded-lg border-[1px] border-[#5D00F5]" :class="[ currentPage === totalPages - 1 ? 'opacity-60' : '' ]">
                <img :src="arrowicon" alt="right arrow" class="w-5 h-7 rotate-90"/>
            </button>
        </div>
    </div>

    <div :class="[ isVersionsListVisible ? '': 'mb-10' ]"></div>

    <LazyUpdateVersionModal v-if="showUpdateVersionModal" :version="versions.values[versionToEdit]" @closeModal="closeUpdateVersionModal"/>
</template>