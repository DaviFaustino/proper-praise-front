import { computed, ref } from 'vue';

const ADVERTISEMENT_CACHE_TTL_MS = 5 * 60 * 1000;
const ADVERTISEMENT_CACHE_STORAGE_PREFIX = 'kdlouvor:advertisements';
const advertisementCacheByKey = new Map();

function normalizeAdvertisement(advertisement = {}) {
    return {
        id: advertisement.id,
        affiliateLink: advertisement.affiliateLink ?? '',
        metadataSourceUrl: advertisement.metadataSourceUrl ?? '',
        title: normalizeAdvertisementText(advertisement.title),
        imageUrl: normalizeAdvertisementText(advertisement.imageUrl)
    };
}

function normalizeAdvertisementText(value) {
    return value == null ? '' : String(value).trim();
}

function isCompleteAdvertisement(advertisement) {
    return advertisement?.id != null && advertisement.title !== '' && advertisement.imageUrl !== '';
}

function normalizeAdvertisementsResponse(data) {
    const advertisements = Array.isArray(data)
        ? data
        : data?.advertisements ?? data?.ads ?? data?.items ?? [];

    return advertisements
        .map(normalizeAdvertisement)
        .filter(isCompleteAdvertisement);
}

function fillAdvertisementsWithFallback(advertisements, fallbackAdvertisements, targetCount) {
    const completeAdvertisements = [
        ...advertisements,
        ...fallbackAdvertisements
    ].filter(isCompleteAdvertisement);
    const filledAdvertisements = [];
    const usedAdvertisementIds = new Set();

    for (const advertisement of completeAdvertisements) {
        const advertisementId = String(advertisement.id);

        if (usedAdvertisementIds.has(advertisementId)) {
            continue;
        }

        filledAdvertisements.push(advertisement);
        usedAdvertisementIds.add(advertisementId);

        if (filledAdvertisements.length === targetCount) {
            return filledAdvertisements;
        }
    }

    for (let index = 0; filledAdvertisements.length < targetCount && filledAdvertisements.length > 0; index++) {
        filledAdvertisements.push(filledAdvertisements[index % filledAdvertisements.length]);
    }

    return filledAdvertisements;
}

function getAdvertisementCacheKey(regularCount, baitCount) {
    return `${regularCount}:${baitCount}`;
}

function getAdvertisementStorageKey(cacheKey) {
    return `${ADVERTISEMENT_CACHE_STORAGE_PREFIX}:${cacheKey}`;
}

function readStoredAdvertisementCache(cacheKey) {
    if (!import.meta.client) {
        return null;
    }

    try {
        const storedValue = window.localStorage.getItem(getAdvertisementStorageKey(cacheKey));

        if (!storedValue) {
            return null;
        }

        const parsedValue = JSON.parse(storedValue);

        if (!Array.isArray(parsedValue?.advertisements) || !Number.isFinite(parsedValue?.fetchedAt)) {
            return null;
        }

        return {
            advertisements: parsedValue.advertisements.map(normalizeAdvertisement).filter(isCompleteAdvertisement),
            fetchedAt: parsedValue.fetchedAt,
            impressedAt: Number.isFinite(parsedValue?.impressedAt) ? parsedValue.impressedAt : null,
            pendingRequest: null
        };
    } catch {
        return null;
    }
}

function writeStoredAdvertisementCache(cacheKey, cache) {
    if (!import.meta.client) {
        return;
    }

    try {
        window.localStorage.setItem(getAdvertisementStorageKey(cacheKey), JSON.stringify({
            advertisements: cache.advertisements,
            fetchedAt: cache.fetchedAt,
            impressedAt: cache.impressedAt ?? null
        }));
    } catch {
        // Ignore storage failures; the in-memory cache still works for this session.
    }
}

function getAdvertisementCache(cacheKey) {
    const memoryCache = advertisementCacheByKey.get(cacheKey);

    if (memoryCache) {
        return memoryCache;
    }

    const storedCache = readStoredAdvertisementCache(cacheKey);

    if (storedCache) {
        advertisementCacheByKey.set(cacheKey, storedCache);
    }

    return storedCache;
}

function setAdvertisementCache(cacheKey, cache) {
    advertisementCacheByKey.set(cacheKey, cache);
    writeStoredAdvertisementCache(cacheKey, cache);
}

function isAdvertisementCacheFresh(cache) {
    if (!cache?.advertisements?.length) {
        return false;
    }

    if (!cache.impressedAt) {
        return true;
    }

    return Date.now() - cache.impressedAt < ADVERTISEMENT_CACHE_TTL_MS;
}

export function useAdvertisements({
    regularCount = 3,
    baitCount = 1,
    placement = 'default'
} = {}) {
    const { $api } = useNuxtApp();
    const config = useRuntimeConfig();
    const cacheKey = getAdvertisementCacheKey(regularCount, baitCount);
    const advertisementCount = regularCount + baitCount;
    const advertisements = ref([]);
    const isLoadingAdvertisements = ref(false);
    const advertisementsError = ref(null);

    const clickBaseUrl = computed(() => {
        const baseUrl = config.public.backendPublicUrl || '';
        return baseUrl.replace(/\/$/, '');
    });

    async function fetchAdvertisements({ force = false } = {}) {
        const cachedAdvertisements = getAdvertisementCache(cacheKey);

        if (cachedAdvertisements?.advertisements?.length) {
            advertisements.value = cachedAdvertisements.advertisements;
        }

        if (!force && isAdvertisementCacheFresh(cachedAdvertisements)) {
            return;
        }

        if (cachedAdvertisements?.pendingRequest) {
            advertisements.value = await cachedAdvertisements.pendingRequest;
            return;
        }

        isLoadingAdvertisements.value = !cachedAdvertisements?.advertisements?.length;
        advertisementsError.value = null;

        const pendingRequest = $api.get('/api/advertisements', {
            params: {
                regularCount,
                baitCount
            }
        }).then(response => {
            const nextAdvertisements = fillAdvertisementsWithFallback(
                normalizeAdvertisementsResponse(response.data),
                cachedAdvertisements?.advertisements ?? [],
                advertisementCount
            );

            if (nextAdvertisements.length < advertisementCount) {
                const fallbackAdvertisements = cachedAdvertisements?.advertisements ?? [];

                advertisementCacheByKey.set(cacheKey, {
                    advertisements: fallbackAdvertisements,
                    fetchedAt: cachedAdvertisements?.fetchedAt ?? 0,
                    impressedAt: cachedAdvertisements?.impressedAt ?? null,
                    pendingRequest: null
                });

                return fallbackAdvertisements;
            }

            const nextCache = {
                advertisements: nextAdvertisements,
                fetchedAt: Date.now(),
                impressedAt: null,
                pendingRequest: null
            };

            setAdvertisementCache(cacheKey, nextCache);

            return nextAdvertisements;
        });

        advertisementCacheByKey.set(cacheKey, {
            advertisements: cachedAdvertisements?.advertisements ?? [],
            fetchedAt: cachedAdvertisements?.fetchedAt ?? 0,
            impressedAt: cachedAdvertisements?.impressedAt ?? null,
            pendingRequest
        });

        try {
            advertisements.value = await pendingRequest;
        } catch (error) {
            advertisementsError.value = error;
            advertisements.value = cachedAdvertisements?.advertisements ?? [];
            advertisementCacheByKey.set(cacheKey, {
                advertisements: cachedAdvertisements?.advertisements ?? [],
                fetchedAt: cachedAdvertisements?.fetchedAt ?? 0,
                impressedAt: cachedAdvertisements?.impressedAt ?? null,
                pendingRequest: null
            });
            console.error(`Error fetching advertisements for ${placement}.`, error);
        } finally {
            isLoadingAdvertisements.value = false;
        }
    }

    function getMillisecondsUntilAdvertisementsRefresh() {
        const cachedAdvertisements = getAdvertisementCache(cacheKey);

        if (!cachedAdvertisements?.impressedAt) {
            return null;
        }

        return Math.max(ADVERTISEMENT_CACHE_TTL_MS - (Date.now() - cachedAdvertisements.impressedAt), 0);
    }

    function markAdvertisementsImpressed() {
        const cachedAdvertisements = getAdvertisementCache(cacheKey);

        if (!cachedAdvertisements?.advertisements?.length) {
            return;
        }

        setAdvertisementCache(cacheKey, {
            advertisements: cachedAdvertisements.advertisements,
            fetchedAt: cachedAdvertisements.fetchedAt,
            impressedAt: Date.now(),
            pendingRequest: cachedAdvertisements.pendingRequest ?? null
        });
    }

    async function trackImpressions(ids = advertisements.value.map(advertisement => advertisement.id)) {
        const advertisementIds = ids
            .filter(id => id != null)
            .map(id => String(id))
            .filter((id, index, allIds) => allIds.indexOf(id) === index);
        const cachedAdvertisements = getAdvertisementCache(cacheKey);

        if (advertisementIds.length === 0) {
            return false;
        }

        if (cachedAdvertisements?.impressedAt) {
            return true;
        }

        try {
            await $api.post('/api/advertisements/impressions', {
                advertisementIds
            });
            markAdvertisementsImpressed();
            return true;
        } catch (error) {
            console.error(`Error tracking advertisement impressions for ${placement}.`, error);
            return false;
        }
    }

    function getAdvertisementClickUrl(advertisementId) {
        return `${clickBaseUrl.value}/api/advertisements/${encodeURIComponent(advertisementId)}/click`;
    }

    return {
        advertisements,
        isLoadingAdvertisements,
        advertisementsError,
        fetchAdvertisements,
        getMillisecondsUntilAdvertisementsRefresh,
        trackImpressions,
        getAdvertisementClickUrl
    };
}
