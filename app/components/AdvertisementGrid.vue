<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
    regularCount: {
        type: Number,
        default: 3
    },
    baitCount: {
        type: Number,
        default: 1
    },
    placement: {
        type: String,
        default: 'default'
    }
});

const gridElement = ref(null);
let observer = null;

const {
    advertisements,
    fetchAdvertisements,
    getMillisecondsUntilAdvertisementsRefresh,
    trackImpressions,
    getAdvertisementClickUrl
} = useAdvertisements({
    regularCount: props.regularCount,
    baitCount: props.baitCount,
    placement: props.placement
});

const visibleAdvertisements = computed(() => advertisements.value.slice(0, 4));
const hasAdvertisements = computed(() => visibleAdvertisements.value.length === 4);
const isGridVisible = ref(false);
let refreshTimer = null;

function getAdvertisementSourceLabel(metadataSourceUrl) {
    if (!metadataSourceUrl) {
        return '';
    }

    try {
        return new URL(metadataSourceUrl).hostname.replace(/^www\./, '');
    } catch {
        return metadataSourceUrl;
    }
}

function startImpressionObserver() {
    if (!import.meta.client || !gridElement.value || !hasAdvertisements.value) {
        return;
    }

    observer?.disconnect();

    observer = new IntersectionObserver((entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
            isGridVisible.value = false;
            return;
        }

        isGridVisible.value = true;
        trackVisibleAdvertisementsImpressions();
    }, {
        threshold: 0.5
    });

    observer.observe(gridElement.value);
}

async function trackVisibleAdvertisementsImpressions() {
    if (!hasAdvertisements.value) {
        return false;
    }

    const impressionsTracked = await trackImpressions(visibleAdvertisements.value.map(advertisement => advertisement.id));

    if (impressionsTracked) {
        scheduleAdvertisementsRefresh();
    }

    return impressionsTracked;
}

function scheduleAdvertisementsRefresh() {
    if (!import.meta.client) {
        return;
    }

    window.clearTimeout(refreshTimer);

    const millisecondsUntilRefresh = getMillisecondsUntilAdvertisementsRefresh();

    if (millisecondsUntilRefresh == null) {
        return;
    }

    refreshTimer = window.setTimeout(async () => {
        await fetchAdvertisements({ force: true });
        await nextTick();

        if (isGridVisible.value) {
            await trackVisibleAdvertisementsImpressions();
        } else {
            startImpressionObserver();
        }
    }, millisecondsUntilRefresh);
}

onMounted(async () => {
    await fetchAdvertisements();
    startImpressionObserver();
    scheduleAdvertisementsRefresh();
});

onBeforeUnmount(() => {
    observer?.disconnect();
    window.clearTimeout(refreshTimer);
});
</script>

<template>
    <aside v-if="hasAdvertisements" ref="gridElement"
        class="grid max-w-full w-[27rem] sm:w-[30rem] md:w-[35rem] grid-cols-2 gap-2 rounded-xl bg-white p-2 shadow-xl" aria-label="Anuncios">
        <a v-for="(advertisement, index) in visibleAdvertisements" :key="`${advertisement.id}:${index}`"
            :href="getAdvertisementClickUrl(advertisement.id)" target="_blank" rel="noopener sponsored"
            class="group flex aspect-square min-w-0 flex-col overflow-hidden rounded-lg border border-[#5D00F5]/20 bg-[#F8F5FF] transition hover:border-[#5D00F5] hover:shadow-md">
            <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-white p-1">
                <img v-if="advertisement.imageUrl" :src="advertisement.imageUrl" :alt="advertisement.title"
                    class="h-full w-full object-contain transition group-hover:scale-[1.02]" loading="lazy">
                <div v-else class="flex h-full w-full items-center justify-center p-3 text-center text-sm font-bold">
                    {{ advertisement.title }}
                </div>
            </div>

            <div class="min-h-[3.25rem] px-2 py-1">
                <div class="truncate text-sm font-bold">{{ advertisement.title }}</div>
                <div v-if="advertisement.metadataSourceUrl" class="truncate text-[11px] text-gray-600">
                    {{ getAdvertisementSourceLabel(advertisement.metadataSourceUrl) }}
                </div>
            </div>
        </a>
    </aside>
</template>
