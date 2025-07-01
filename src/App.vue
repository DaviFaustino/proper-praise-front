<script setup>
import logo from '/src/assets/logo.svg'
import HomeView from './views/HomeView.vue';
</script>

<template>
    <header class="flex justify-center">
        <img :src="logo" alt="Logo" class="w-72 sm:w-96 h-auto mt-15"/>
    </header>
    
    <main class="flex flex-col items-center justify-center">
        <HomeView />
    </main>
</template>
