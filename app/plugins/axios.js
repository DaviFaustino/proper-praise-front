import axios from 'axios';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    const api = axios.create({
        baseURL: import.meta.server ? config.public.backendInternalUrl : config.public.backendPublicUrl,
        withCredentials: true
    })

    return {
        provide: { api }
    }
})
