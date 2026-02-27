import { ref, computed } from 'vue';

export function useThemesSearch() {
    const { $api } = useNuxtApp();

    const searchInput = ref("");
    const lastThemesNamesSearch = ref('');
    const themesNames = ref([]);

    function onInputChange(event, byThemeOn) {
        if (event.target.value[0] === " ") {
            searchInput.value = "";
        } else {
            searchInput.value = event.target.value;
        }

        if (byThemeOn && searchInput.value.length > 2) {
            let firstThreeLetters = searchInput.value.substring(0, 3);

            if (firstThreeLetters.toLowerCase() !== lastThemesNamesSearch.value.toLowerCase()) {
                requestThemesNames(firstThreeLetters);
            }
        }
    }

    function requestThemesNames(firstThreeLetters) {
        const fullURL = `/api/song/themes?searchTerm=${firstThreeLetters}`;

        return $api.get(fullURL)
            .then(response => {
                lastThemesNamesSearch.value = firstThreeLetters;
                themesNames.value = response.data;
                sortThemesNames(firstThreeLetters);
            })
            .catch(error => {
                console.error('Error fetching themes names.');
            });
    }

    function sortThemesNames(firstThreeLetters) {
        themesNames.value.sort();
        let totalThemesWithFirstThreeLetters = 0;

        for (let i = themesNames.value.length - 1; i >= 0; i--) {
            if (themesNames.value[i + totalThemesWithFirstThreeLetters].substring(0, 3).toLowerCase() === firstThreeLetters.toLowerCase()) {
                let theme = themesNames.value.splice(i + totalThemesWithFirstThreeLetters, 1);
                themesNames.value = theme.concat(themesNames.value);

                totalThemesWithFirstThreeLetters++;
            }
        }
    }

    const filteredThemeSuggestions = computed(() => {
        let filtered = [];

        for (let i = 0; i < themesNames.value.length; i++) {
            if (themesNames.value.at(i).toLowerCase().includes(searchInput.value.toLowerCase())) {
                filtered.push(themesNames.value.at(i));
            }
        }
        return filtered;
    });

    return {
        searchInput,
        themesNames,
        filteredThemeSuggestions,
        onInputChange,
        requestThemesNames
    };
}
