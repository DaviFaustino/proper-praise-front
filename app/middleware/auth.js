export default defineNuxtRouteMiddleware(async (to) => {
    const { $api } = useNuxtApp();
    const { setIsAuthenticated } = useAuth();

    try {
        if (import.meta.client) {
            await $api.get('/api/authentication');
        } else {
            const incomingHeaders = useRequestHeaders(['cookie']);
            await $api.get('/api/authentication', {
                headers: incomingHeaders
            });
        }
        setIsAuthenticated(true);
    } catch (error) {
        setIsAuthenticated(false);
        if (to.path === '/article-editor') {
            return navigateTo('/login');
        }
    }
})
