<script setup>
import { ref } from 'vue';

const bgImageUrl = ref('/images/background.webp');

function setBackgroundImage(value) {
    if (value > 650) {
        bgImageUrl.value = '/images/background4.webp';
    } else if (value > 450) {
        bgImageUrl.value = '/images/background3.webp';
    } else if (value > 275) {
        bgImageUrl.value = '/images/background2.webp';
    } else {
        bgImageUrl.value = '/images/background1.webp';
    }
}
</script>

<template>
    <div class="relative min-h-screen flex flex-col overflow-hidden">
        <img :src="bgImageUrl" class="fixed z-0 pointer-events-none object-cover min-h-screen" alt="Background">

        <main class="relative flex flex-col items-center flex-grow">
            <RouterView @gotten-side-margin="setBackgroundImage" />
        </main>
    
        <footer class="relative flex flex-col h-20 mt-10 bg-[#5D00F5] justify-center items-center">
            <span class="text-white font-bold text-xl mb-2">KDLouvor</span>
            <span class="text-white text-sm">
                <RouterLink class="font-bold hover:underline" to="/terms-of-use">Termos de Uso</RouterLink> |
                <RouterLink class="font-bold hover:underline" to="/privacy-policy">Política de Privacidade</RouterLink>
            </span>
        </footer>
    </div>
</template>
