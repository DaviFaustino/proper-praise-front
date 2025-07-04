<script setup>
import logo from '/src/assets/logo.svg'
</script>

<template>
    <header class="flex justify-center">
        <img :src="logo" alt="Logo" class="w-72 sm:w-96 h-auto mt-15"/>
    </header>
    
    <main class="flex flex-col items-center flex-grow">
        <RouterView />
    </main>

    <footer class="flex flex-col h-20 bg-[#5D00F5] justify-center items-center">
        <span class="text-white font-bold text-xl mb-2">KDLouvor</span>
        <span class="text-white text-sm">
            <RouterLink class="font-bold hover:underline" to="/terms-of-use">Termos de Uso</RouterLink> |
            <RouterLink class="font-bold hover:underline" to="/terms-of-use">Política de Privacidade</RouterLink>
        </span>
    </footer>
</template>
