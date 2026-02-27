import axios from 'axios';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const { setIsAuthenticated } = useAuth();

    const api = axios.create({
        baseURL: import.meta.server ? config.public.backendInternalUrl : config.public.backendPublicUrl,
        withCredentials: true
    })

    const event = useRequestEvent();

    api.interceptors.response.use(
        res => res,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status !== 401) {
                return Promise.reject(error);
            }

            if (originalRequest.url?.includes('/api/authentication/refresh')) {
                setIsAuthenticated(false);
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (import.meta.client) {
                try {
                    await api.post('/api/authentication/refresh', null, {
                        headers: {
                            'X-API-Version': '0.2'
                        }
                    })
                    return api(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            } else {
                const incomingRefreshCookie = originalRequest.headers['cookie'].split(';').find(h => h.trim().startsWith('refreshToken='));

                try {
                    const response = await api.post(
                        '/api/authentication/refresh', null,
                        {
                            headers: {
                                'X-API-Version': '0.2',
                                'Cookie': `${incomingRefreshCookie}`
                            }
                        })

                    const setCookie = response.headers['set-cookie'];
                    if (setCookie) {
                        event.node.res.setHeader('set-cookie', setCookie);
                    }

                    const setCookieHeader = response.headers['set-cookie'];
                    const cookie = setCookieHeader[0];
                    const newAccessCookie = cookie.startsWith('accessToken=') ? cookie.split(';')[0] : null;
                    
                    let updatedOriginalRequest = error.config;
                    updatedOriginalRequest.headers['Cookie'] = newAccessCookie;
                    return api(updatedOriginalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }
        }
    )

    return {
        provide: { api }
    }
})
