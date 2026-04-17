<script setup>
defineProps({
    statusCode: {
        type: [Number, String],
        default: 404
    },
    eyebrow: {
        type: String,
        default: 'página não encontrada'
    },
    heading: {
        type: String,
        default: 'Página não encontrada'
    },
    message: {
        type: String,
        default: 'O endereço que você abriu não existe ou não está mais disponível.'
    },
    homeLabel: {
        type: String,
        default: 'voltar para o início'
    },
    homeAsButton: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['home']);
</script>

<template>
    <section class="w-full max-w-xl bg-white p-6 text-center shadow-xl sm:p-8">
        <p class="text-7xl font-bold leading-none text-[#a40084] sm:text-8xl">
            {{ statusCode }}
        </p>

        <p class="mt-2 text-sm font-bold uppercase tracking-normal text-gray-600">
            {{ eyebrow }}
        </p>

        <h1 class="mt-4 text-3xl font-bold text-[#5D00F5] sm:text-4xl">
            {{ heading }}
        </h1>

        <p class="mx-auto mt-4 max-w-md text-base leading-6 text-gray-700 sm:text-lg">
            {{ message }}
        </p>

        <button
            v-if="homeAsButton"
            type="button"
            class="mt-6 h-9 rounded-lg bg-[#5D00F5] px-5 font-bold text-white"
            @click="emit('home')"
        >
            {{ homeLabel }}
        </button>

        <NuxtLink
            v-else
            to="/"
            class="mt-6 inline-flex h-9 items-center rounded-lg bg-[#5D00F5] px-5 font-bold text-white"
        >
            {{ homeLabel }}
        </NuxtLink>
    </section>
</template>
