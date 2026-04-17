<script setup>
definePageMeta({
    middleware: 'auth'
});

setResponseStatus(404);

useHead({
    title: 'Página não encontrada | KDLouvor',
    meta: [
        { name: 'robots', content: 'noindex' }
    ]
});
</script>

<template>
    <div class="flex w-full flex-grow items-center justify-center px-4 py-16 sm:px-8">
        <ErrorState />
    </div>
</template>
