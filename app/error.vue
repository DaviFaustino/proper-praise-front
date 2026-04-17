<script setup>
import { computed } from 'vue';

const props = defineProps({
    error: {
        type: Object,
        required: true
    }
});

const isNotFound = computed(() => props.error?.statusCode === 404);
const pageTitle = computed(() => isNotFound.value ? 'Página não encontrada | KDLouvor' : 'Erro | KDLouvor');
const heading = computed(() => isNotFound.value ? 'Página não encontrada' : 'Algo saiu do tom');
const message = computed(() => {
    if (isNotFound.value) {
        return 'O endereço que você abriu não existe ou não está mais disponível.';
    }

    return 'Não foi possível carregar esta página agora. Tente novamente em instantes.';
});
const statusCode = computed(() => props.error?.statusCode || 500);

useHead(() => ({
    title: pageTitle.value,
    meta: [
        { name: 'robots', content: 'noindex' }
    ]
}));

function returnHome() {
    clearError({ redirect: '/' });
}
</script>

<template>
    <NuxtLayout>
        <div class="flex w-full flex-grow items-center justify-center px-4 py-16 sm:px-8">
            <ErrorState
                :status-code="statusCode"
                :eyebrow="isNotFound ? 'página não encontrada' : 'erro'"
                :heading="heading"
                :message="message"
                home-as-button
                @home="returnHome"
            />
        </div>
    </NuxtLayout>
</template>
