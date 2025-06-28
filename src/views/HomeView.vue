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
}

const dynamicTrackOn = ref(false);
const knobPosition = ref(15);
const knobX = computed(() => { return (knobPosition.value) / 32 * 100 });

const searchInputPlaceHolder = computed(() => {
    return byThemeOn.value ? "Insira um tema" : "Insira um título";
});
const searchInput = ref("");
const isSearchInputFull = computed(() => {
    knobPosition.value = 15
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

const backendURL = import.meta.env.VITE_BACKEND_URL;
const versions = reactive({ values:[] })
const totalPages = ref(0);
const isVersionsListVisible = computed(() => {
    return versions.values.length > 0;
});

function requestVersions(pageNumber) {
    let fullURL;

    if (searchInput.value !== "") {
        if (dynamicTrackOn.value) {
            fullURL = `${backendURL}/api/song?theme=${searchInput.value}&songDynamics=${knobPosition.value}&pageNumber=${pageNumber}`;
        } else {
            fullURL = `${backendURL}/api/song?theme=${searchInput.value}&pageNumber=${pageNumber}`;
        }
    } else {
        if (dynamicTrackOn.value) {
            fullURL = `${backendURL}/api/song?songDynamics=${knobPosition.value}&pageNumber=${pageNumber}`;
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
}
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
            <button type="button" :disabled="isRequestButtonDisabled" @click="requestVersions(0)" class="flex items-center border-1 border-[#5D00F5] rounded-lg py-1 px-2 space-x-2" :class="[ isRequestButtonDisabled ? 'opacity-60' : '' ]">
                <img :src="mglassicon" alt="glass" class="size-5" draggable="false">
                <div class="text-lg text-[#5D00F5]">Buscar</div>
            </button>
        </div>
    </div>
</template>
