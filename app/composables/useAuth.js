export const useAuth = () => {
    const isAuthenticated = useState('auth_status', () => false);

    const setIsAuthenticated = async (value) => {
        const { $api } = useNuxtApp();

        if (isAuthenticated.value && !value) {
            try {
                await $api.post('/api/authentication/logout');
                isAuthenticated.value = false;
                window.location.reload();
            } catch (err) {
                console.error('There was an error!');
            }
        } else {
            isAuthenticated.value = value;
        }
    }

    return { isAuthenticated, setIsAuthenticated }
}
