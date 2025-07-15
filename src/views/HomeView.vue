<script setup>
import axios from 'axios';
import { computed, reactive, ref } from 'vue';
import SearchTypeButton from '../components/SearchTypeButton.vue';
import arrowicon from '/src/assets/arrow.svg';
import mglassicon from '/src/assets/ma-glass-icon.svg';

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
const knobPosition = ref(15);
const knobX = computed(() => { return (knobPosition.value) / 32 * 100 });

const searchInputPlaceHolder = computed(() => {
    return byThemeOn.value ? "Insira um tema" : "Insira um título";
});
const searchInput = ref("");
const isSearchInputFull = computed(() => {
    knobPosition.value = lastKnobPosition.value
    return searchInput.value != "";
});

function onInputChange(event) {
    if (event.target.value[0] === " ") {
        searchInput.value = "";
    };
}

function positionKnob(event) {
    const trackRect = document.querySelector('#track').getBoundingClientRect();
    const trackMouseX = event.clientX - trackRect.left;
    let knobWidth;

    if (isSearchInputFull.value) {
        knobWidth = trackRect.width == 320 ? 40: 48
    } else {
        knobWidth = trackRect.width == 320 ? 10: 12
    }

    if (trackMouseX < (knobWidth / 2)) {
        knobPosition.value = 0;
    } else {
        let dynamicRange = isSearchInputFull.value ? 28 : 31;
        if (trackMouseX > trackRect.width - (knobWidth / 2)) {
            knobPosition.value = dynamicRange;
        } else {
            knobPosition.value = Math.round(((trackMouseX - (knobWidth / 2)) / (trackRect.width - knobWidth)) * dynamicRange);
        }
    }
}

function stopDragging() {
    window.removeEventListener('mousemove', positionKnob);
    window.removeEventListener('mouseup', stopDragging);
}

function startDragging(event) {
    positionKnob(event);
    window.addEventListener('mousemove', positionKnob);
    window.addEventListener('mouseup', stopDragging);
}

const isRequestButtonDisabled = computed(() => {
    return searchInput.value === "" && !dynamicTrackOn.value;
});

const lastSearchByThemeAndDynamics = ref("");
const lastSearchByTitle = ref("");
const lastKnobPosition = ref(15);

function newSearch(pageNumber, isPageNavigation) {
    if (byThemeOn.value) {
        if (!isPageNavigation) {
            lastSearchByThemeAndDynamics.value = searchInput.value;
            lastKnobPosition.value = knobPosition.value;
        }
        requestVersionsByThemeAndDynamics(pageNumber);
    } else {
        if (!isPageNavigation) {
            lastSearchByTitle.value = searchInput.value
        }
        requestVersionsByTitle(pageNumber);
    }
}

const backendURL = import.meta.env.VITE_BACKEND_URL;
const versions = reactive({ values:[] })
const totalPages = ref(0);
const currentPage = ref(1);
const isVersionsListVisible = computed(() => {
    return versions.values.length > 0;
});

function requestVersionsByThemeAndDynamics(pageNumber) {
    let fullURL;
    currentPage.value = pageNumber;

    if (lastSearchByThemeAndDynamics.value !== "") {
        if (dynamicTrackOn.value) {
            fullURL = `${backendURL}/api/song?theme=${lastSearchByThemeAndDynamics.value}&songDynamics=${lastKnobPosition.value}&pageNumber=${pageNumber}`;
        } else {
            fullURL = `${backendURL}/api/song?theme=${lastSearchByThemeAndDynamics.value}&pageNumber=${pageNumber}`;
        }
    } else {
        if (dynamicTrackOn.value) {
            fullURL = `${backendURL}/api/song?songDynamics=${lastKnobPosition.value}&pageNumber=${pageNumber}`;
        } else {
            alert('Informe ao menos um parâmetro de busca.');
        }
    }

    axios.get(fullURL)
        .then(response => {
            versions.values = response.data.versions;
            totalPages.value = response.data.totalPages;
        })
        .catch(error => {
            console.log(error);
        });

    if (byThemeOn.value) {
        searchInput.value = lastSearchByThemeAndDynamics.value;
    }
    knobPosition.value = lastKnobPosition.value;

    setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }, 100);
}

function requestVersionsByTitle(pageNumber) {
    let fullURL = `${backendURL}/api/song/t?searchTerm=${lastSearchByTitle.value}&pageNumber=${pageNumber}`;
    currentPage.value = pageNumber;

    axios.get(fullURL)
        .then(response => {
            versions.values = response.data.versions;
            totalPages.value = response.data.totalPages;
        })
        .catch(error => {
            console.log(error);
        });

    if (!byThemeOn.value) {
        searchInput.value = lastSearchByTitle.value;
    }

    setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }, 100);
}

const dynamicsColors = ['#03b6fa','#09aafa','#0f9ef9','#1493f9','#1a87f9','#207bf8','#266ff8','#2c63f8','#3158f7','#374cf7',
'#3d40f7','#4334f6','#4929f6','#4f1df6','#5411f5','#5a06f5','#6200ed','#6b00de','#7500cf','#7e00c0','#8800b1','#9100a2',
'#9b0093','#a40084','#ae0176','#b70167','#c10158','#ca0149','#d4013a','#dd012b','#e7011c','#f0010d']
</script>

<template>
    <div class="flex flex-col items-center w-fit mt-20 py-10 px-5 sm:px-10 md:px-20 rounded-2xl bg-white shadow-2xl">
        <div class="flex items-center border-1 border-[#5D00F5] bg-white rounded-xl p-1">
            <SearchTypeButton @selected="showOption" buttonText="por tema" optionId="by-theme" class="h-7 w-32 sm:w-40 rounded-lg" :class="[ byThemeOn ? 'bg-[#5D00F5] text-white' : 'bg-white text-[#5D00F5]' ]"/>
            <SearchTypeButton @selected="showOption" buttonText="por título" optionId="by-title" class="h-7 w-32 sm:w-40 rounded-lg" :class="[ byThemeOn ? 'bg-white text-[#5D00F5]' : 'bg-[#5D00F5] text-white' ]"/>
        </div>

        <div class="flex flex-col items-center mt-10">
            <input type="text" :placeholder="searchInputPlaceHolder" v-model="searchInput" class="border-2 border-[#5D00F5] rounded-lg p-2 w-[20rem] sm:w-96" @input="onInputChange">

            <div v-if="byThemeOn" class=" w-[20rem] sm:w-96">
                <button class="flex items-center space-x-2 mb-1 text-lg" @click="dynamicTrackOn = !dynamicTrackOn">
                    <img :src="arrowicon" alt="glass" class="w-5 h-7 my-1 ml-2" :class="[ dynamicTrackOn ? 'rotate-180' : '' ]"/>
                    <div class="text-[#5D00F5]" v-if="!dynamicTrackOn">definir dinâmica</div>
                </button>

                <div id="track" class="relative w-[20rem] sm:w-96 h-4 rounded-2xl top-1/2 -translate-y-1/2 bg-cover bg-center" style="background: linear-gradient(90deg,rgba(0, 188, 250, 1) 0%, rgba(93, 0, 245, 1) 50%, rgba(245, 1, 6, 1) 100%);" v-if="dynamicTrackOn" @mousedown="startDragging">
                    <div class="absolute h-5 border-4 border-gray-700 rounded-2xl top-1/2 -translate-y-1/2 pointer-events-none" :class="[isSearchInputFull ? 'w-10 sm:w-12' : 'w-[10px] sm:w-3' ]" :style="{left: knobX + '%'}"></div>
                </div>
            </div>

            <div :class="[ dynamicTrackOn || !byThemeOn ? 'h-8': 'h-4']"></div>
            <button type="button" :disabled="isRequestButtonDisabled" @click="newSearch(0, false)" class="flex items-center border-1 border-[#5D00F5] rounded-lg py-1 px-2 space-x-2" :class="[ isRequestButtonDisabled ? 'opacity-60' : '' ]">
                <img :src="mglassicon" alt="glass" class="size-5" draggable="false">
                <div class="text-lg text-[#5D00F5]">Buscar</div>
            </button>
        </div>
    </div>

    <div v-if="isVersionsListVisible" class="flex flex-col items-center w-fit mt-5 mb-10 rounded-2xl">
        <ul class="flex flex-col">
            <li v-for="version in versions.values" class="bg-white rounded-xl p-1 m-1 shadow-xl">
                <div class="rounded-lg p-[1px] m-2 bg-gradient-to-r from-[#5D00F5]" :class="`to-[${dynamicsColors[version.songDynamics]}]`">
                    <div class="flex flex-col w-full sm:w-[28rem] md:w-[33rem] bg-white rounded-[7px] p-2">
                        <div class="flex">
                            <div class="flex flex-col w-full">
                                <span class="text-xl text-[#5D00F5] font-bold">{{ version.title }}</span>
                                <span class="text-[#5D00F5]">{{ version.owner }}</span>
                            </div>
                            <div class="flex flex-col items-center" >
                                <div class="flex w-12 h-6 rounded-md items-center justify-center" :class="`bg-[${dynamicsColors[version.songDynamics]}]`">
                                    <span class="text-white">{{ version.tone }}</span>
                                </div>
                                <a :href="version.links[0]" target="_blank" rel="noopener noreferrer" class="flex w-full items-center">
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
                                    <div class="absolute w-12 h-5  border-1 rounded border-[#5D00F5]"></div>
                                </a>
                            </div>
                        </div>
                        <div class="flex flex-wrap w-full mt-2">
                            <span v-for="theme in version.themes" class="mr-2 mt-1 px-2 rounded-lg text-white bg-[#5D00F5]">{{ theme }}</span>
                        </div>
                    </div>
                </div>
            </li>
        </ul>

        <div class="flex bg-white shadow-xl rounded-xl items-center justify-center mt-5 py-2 px-5 space-x-2">
            <button type="button" :disabled="currentPage === 0" @click="newSearch(currentPage - 1, true)" class="flex items-center justify-center h-8 w-12 bg-white rounded-lg border-1 border-[#5D00F5]" :class="[ currentPage === 0 ? 'opacity-60' : '' ]">
                <img :src="arrowicon" alt="lest arrow" class="w-5 h-7 rotate-270"/>
            </button>
            <div class="text-[#5D00F5] text-xl">
                <span>{{ currentPage + 1 }}</span>
                de
                <span>{{ totalPages }}</span>
            </div>
            <button type="button" :disabled="currentPage === totalPages - 1" @click="newSearch(currentPage + 1, true)" class="flex items-center justify-center h-8 w-12 bg-white rounded-lg border-1 border-[#5D00F5]" :class="[ currentPage === totalPages - 1 ? 'opacity-60' : '' ]">
                <img :src="arrowicon" alt="right arrow" class="w-5 h-7 rotate-90"/>
            </button>
        </div>
    </div>
</template>
