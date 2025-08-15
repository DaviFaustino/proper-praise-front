<template>
    <main class="flex flex-col items-center flex-grow">
        <RouterView />
    </main>

    <footer class="flex flex-col h-20 bg-[#5D00F5] justify-center items-center">
        <span class="text-white font-bold text-xl mb-2">KDLouvor</span>
        <span class="text-white text-sm">
            <RouterLink class="font-bold hover:underline" to="/terms-of-use">Termos de Uso</RouterLink> |
            <RouterLink class="font-bold hover:underline" to="/privacy-policy">Política de Privacidade</RouterLink>
        </span>
    </footer>
</template>
