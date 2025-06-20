<script setup>
import SearchTypeButton from '../components/SearchTypeButton.vue';
import { ref } from 'vue';

const byThemeOn = ref(true);

function showOption(optionId) {
    if ((optionId === 'by-theme' & byThemeOn.value === true) || (optionId === 'by-title' & byThemeOn.value === false)) {
        return;
    }
    byThemeOn.value = !byThemeOn.value;
}
</script>

<template>
    <div class="flex flex-col items-center w-fit mt-20 py-10 px-5 sm:px-10 md:px-20 rounded-2xl bg-white shadow-2xl">
        <div class="flex items-center border-1 border-[#5D00F5] bg-white rounded-xl p-1">
            <SearchTypeButton @selected="showOption" buttonText="por tema" optionId="by-theme" class="h-7 w-32 sm:w-40 rounded-lg" :class="[ byThemeOn ? 'bg-[#5D00F5] text-white' : 'bg-white text-[#5D00F5]' ]"/>
            <SearchTypeButton @selected="showOption" buttonText="por título" optionId="by-title" class="h-7 w-32 sm:w-40 rounded-lg" :class="[ byThemeOn ? 'bg-white text-[#5D00F5]' : 'bg-[#5D00F5] text-white' ]"/>
        </div>

        <div class="flex flex-col items-center mt-10">
            <div v-if="byThemeOn"></div>

            <div v-if="!byThemeOn"></div>
        </div>
    </div>
</template>
