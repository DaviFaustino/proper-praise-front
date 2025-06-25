<script setup>
import { computed, ref } from 'vue';
import SearchTypeButton from '../components/SearchTypeButton.vue';
import mglassicon from '/src/assets/ma-glass-icon.svg';

const byThemeOn = ref(true);

function showOption(optionId) {
    if ((optionId === 'by-theme' & byThemeOn.value === true) || (optionId === 'by-title' & byThemeOn.value === false)) {
        return;
    }
    byThemeOn.value = !byThemeOn.value;
}

const searchInputPlaceHolder = computed(() => {
    return byThemeOn.value ? "Insira um tema" : "Insira um título";
});
const searchInput = ref("");

function onInputChange(event) {
    if (event.target.value[0] === " ") {
        searchInput.value = "";
    };
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

            <button class="flex items-center border-1 border-[#5D00F5] rounded-lg py-1 px-2 space-x-2" :class="[ dynamicBarOn || !byThemeOn ? 'mt-8': 'mt-4']">
                <img :src="mglassicon" alt="glass" class="size-5" draggable="false">
                <div class="text-lg text-[#5D00F5]">Buscar</div>
            </button>
        </div>
    </div>
</template>
