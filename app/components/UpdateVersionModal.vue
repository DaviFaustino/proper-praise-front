<script setup>
import { ref } from 'vue';

const { $api } = useNuxtApp();

const props = defineProps({
    version: Object
});

const { knobPosition, knobX, isKnobBig, startDragging } = useDynamics();
const { searchInput, themesNames, filteredThemeSuggestions, onInputChange, requestThemesNames } = useThemesSearch();

const originalTitle = ref(Object.prototype.hasOwnProperty.call(props.version, 'title') ? props.version.title : '');
const editedTitle = ref(originalTitle.value);
const originalAuthor = ref(Object.prototype.hasOwnProperty.call(props.version, 'owner') ? props.version.owner : '');
const editedAuthor = ref(originalAuthor.value);
const originalLink = ref(Object.prototype.hasOwnProperty.call(props.version, 'links') ? props.version.links[0] : '');
const editedLink = ref(originalLink.value);
const originalKey = ref(Object.prototype.hasOwnProperty.call(props.version, 'tone') ? props.version.tone : '');
const editedKey = ref(originalKey.value);
const originalSongDynamics = ref(Object.prototype.hasOwnProperty.call(props.version, 'songDynamics') ? props.version.songDynamics : 15);
knobPosition.value = originalSongDynamics.value;
const originalThemes = ref(Object.prototype.hasOwnProperty.call(props.version, 'themes') ? props.version.themes : '');
const editedThemes = ref([...originalThemes.value]);

const themeInputFocused = ref(false);
const showThemeSuggestions = computed(() => {
    return (searchInput.value.length > 2 && themeInputFocused.value)
});

function handleInputBlur() {
    setTimeout(() => {themeInputFocused.value = false}, 250);
}

function removeTheme(themeToRemove) {
    editedThemes.value = editedThemes.value.filter(theme => theme !== themeToRemove);
}

const themeExists = ref(true);

async function addTheme() {
    if (!checkIfSearchedThemeExistsIn(editedThemes.value)) {
        if (searchInput.value.length > 1) {
            themeExists.value = checkIfSearchedThemeExistsIn(themesNames.value);

            if (!themesNames.value.includes(searchInput.value)) {
                await requestThemesNames(searchInput.value);
                themeExists.value = checkIfSearchedThemeExistsIn(themesNames.value);
            }
        } else {
            themeExists.value = false;
        }
        if (themeExists.value) {
            editedThemes.value.push(searchInput.value);
        } else {
            return;
        }
    }
    searchInput.value = '';
}

function checkIfSearchedThemeExistsIn(themesList) {
    for (let i = 0; i < themesList.length; i++) {
        if (themesList.at(i).toLowerCase() === searchInput.value.toLowerCase()) {
            searchInput.value = themesList.at(i);
            return true;
        }
    }
    return false;
}

function undoChanges(field) {
    if (field === 1) {
        editedTitle.value = originalTitle.value;
    } else if (field === 2) {
        editedAuthor.value = originalAuthor.value;
    } else if (field === 3) {
        editedLink.value = originalLink.value;
    } else if (field === 4) {
        editedKey.value = originalKey.value;
    } else if (field === 5) {
        knobPosition.value = originalSongDynamics.value;
    } else if (field === 6) {
        editedThemes.value = [...originalThemes.value];
    }
}

const emit = defineEmits(['closeModal']);

function closeModal(version) {
    emit('closeModal', version);
}

const canThemeBeAdded = computed(() => {
    return (editedThemes.value.length < 5 && searchInput.value.length > 0);
});

const canUpdateBeMade = computed(() => {
    return (
        (editedTitle.value !== originalTitle.value ||
        editedAuthor.value !== originalAuthor.value ||
        editedLink.value !== originalLink.value ||
        editedKey.value !== originalKey.value ||
        knobPosition.value !== originalSongDynamics.value ||
        editedThemes.value.some(theme => !originalThemes.value.includes(theme))) &&
        editedThemes.value.length === 5
    );
});

const { accessToken } = useAuth();

function saveChanges() {
    $api.put(`/api/song/${props.version.id}`, {
        title: editedTitle.value,
        owner: editedAuthor.value,
        links: [editedLink.value],
        tone: editedKey.value,
        songDynamics: knobPosition.value,
        translationId: props.version.translationId,
        themes: editedThemes.value
    }, {
        headers: {
            'Application-Type': 'application/json',
            'Authorization': `Bearer ${accessToken.value}`
        }
    }).then(response => {
        closeModal(response.data);
    }).catch(error => {
        console.error('Erro ao atualizar a versão');
    });
}
</script>

<template>
    <div class="fixed inset-0 flex bg-black bg-opacity-50 justify-center items-center">
        <div class="flex flex-col w-96 h-fit bg-white rounded-xl px-5 py-5">
            <span class="text-xl text-[#5D00F5] font-bold mb-4 self-center">Atualizar versão</span>

            <div class="flex flex-col w-full h-10 mt-3 border-2 border-[#5D00F5] justify-center rounded-lg pl-2 pr-1">
                <label class="text-[#5D00F5] text-sm w-11 h-4 mb-[0.20rem] text-center bg-white">título</label>
                <div class="flex w-full h-9 mb-4">
                    <input type="text" v-model="editedTitle" class="w-full h-full mr-1">
                    <button @click="undoChanges(1)" class="flex items-center">
                        <svg class="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path d="M11 2L13 3.99545L12.9408 4.05474M13 18.0001L11 19.9108L11.0297 19.9417M12.9408 4.05474L11 6M12.9408 4.05474C12.6323 4.01859 12.3183 4 12 4C7.58172 4 4 7.58172 4 12C4 14.5264 5.17107 16.7793 7 18.2454M17 5.75463C18.8289 7.22075 20 9.47362 20 12C20 16.4183 16.4183 20 12 20C11.6716 20 11.3477 19.9802 11.0297 19.9417M13 22.0001L11.0297 19.9417" stroke="#5D00F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="flex flex-col w-full h-10 mt-3 border-2 border-[#5D00F5] justify-center rounded-lg pl-2 pr-1">
                <label class="text-[#5D00F5] text-sm w-10 h-4 mb-[0.20rem] text-center bg-white">autor</label>
                <div class="flex w-full h-9 mb-4">
                    <input type="text" v-model="editedAuthor" class="w-full h-full mr-1">
                    <button @click="undoChanges(2)" class="flex items-center">
                        <svg class="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path d="M11 2L13 3.99545L12.9408 4.05474M13 18.0001L11 19.9108L11.0297 19.9417M12.9408 4.05474L11 6M12.9408 4.05474C12.6323 4.01859 12.3183 4 12 4C7.58172 4 4 7.58172 4 12C4 14.5264 5.17107 16.7793 7 18.2454M17 5.75463C18.8289 7.22075 20 9.47362 20 12C20 16.4183 16.4183 20 12 20C11.6716 20 11.3477 19.9802 11.0297 19.9417M13 22.0001L11.0297 19.9417" stroke="#5D00F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="flex space-x-1 mt-3">
                <div class="flex flex-col w-full h-10 border-2 border-[#5D00F5] justify-center rounded-lg pl-2 pr-1">
                    <label class="text-[#5D00F5] text-sm w-8 h-4 mb-[0.20rem] text-center bg-white">link</label>
                    <div class="flex w-full h-9 mb-4">
                        <input type="text" v-model="editedLink" class="w-full h-full mr-1">
                        <button @click="undoChanges(3)" class="flex items-center">
                            <svg class="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path d="M11 2L13 3.99545L12.9408 4.05474M13 18.0001L11 19.9108L11.0297 19.9417M12.9408 4.05474L11 6M12.9408 4.05474C12.6323 4.01859 12.3183 4 12 4C7.58172 4 4 7.58172 4 12C4 14.5264 5.17107 16.7793 7 18.2454M17 5.75463C18.8289 7.22075 20 9.47362 20 12C20 16.4183 16.4183 20 12 20C11.6716 20 11.3477 19.9802 11.0297 19.9417M13 22.0001L11.0297 19.9417" stroke="#5D00F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="flex flex-col w-fit h-10 border-2 border-[#5D00F5] justify-center rounded-lg pl-2 pr-1">
                    <label class="text-[#5D00F5] text-sm w-8 h-4 mb-[0.20rem] text-center bg-white">tom</label>
                    <div class="flex w-full h-9 mb-4">
                        <div class="w-full h-full rounded-lg">
                            <select v-model="editedKey" class="bg-white font-bold">
                                <option value="C">C</option>
                                <option value="Db">Db</option>
                                <option value="D">D</option>
                                <option value="Eb">Eb</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                                <option value="Gb">Gb</option>
                                <option value="G">G</option>
                                <option value="Ab">Ab</option>
                                <option value="A">A</option>
                                <option value="Bb">Bb</option>
                                <option value="B">B</option>
                            </select>
                        </div>
                        <button @click="undoChanges(4)" class="flex items-center ml-1">
                            <svg class="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path d="M11 2L13 3.99545L12.9408 4.05474M13 18.0001L11 19.9108L11.0297 19.9417M12.9408 4.05474L11 6M12.9408 4.05474C12.6323 4.01859 12.3183 4 12 4C7.58172 4 4 7.58172 4 12C4 14.5264 5.17107 16.7793 7 18.2454M17 5.75463C18.8289 7.22075 20 9.47362 20 12C20 16.4183 16.4183 20 12 20C11.6716 20 11.3477 19.9802 11.0297 19.9417M13 22.0001L11.0297 19.9417" stroke="#5D00F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex flex-col w-full h-10 mt-3 justify-center rounded-lg">
                <label class="text-[#5D00F5] text-sm w-10 h-4 mb-2 mt-1 text-center bg-white">dinâmica</label>
                <div class="flex w-full h-9 mb-4">
                    <div id="track" class="relative w-full sm:w-96 h-4 mr-1 rounded-2xl top-1/2 -translate-y-1/2 bg-cover bg-center" style="background: linear-gradient(90deg,rgba(0, 188, 250, 1) 0%, rgba(93, 0, 245, 1) 50%, rgba(245, 1, 6, 1) 100%);" @mousedown="startDragging">
                        <div class="absolute h-5 border-4 border-gray-700 rounded-2xl top-1/2 -translate-y-1/2 pointer-events-none" :class="[isKnobBig ? 'w-10 sm:w-12' : 'w-[10px] sm:w-3' ]" :style="{left: knobX + '%'}"></div>
                    </div>
                    <button @click="undoChanges(5)" class="flex items-center mr-1">
                        <svg class="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path d="M11 2L13 3.99545L12.9408 4.05474M13 18.0001L11 19.9108L11.0297 19.9417M12.9408 4.05474L11 6M12.9408 4.05474C12.6323 4.01859 12.3183 4 12 4C7.58172 4 4 7.58172 4 12C4 14.5264 5.17107 16.7793 7 18.2454M17 5.75463C18.8289 7.22075 20 9.47362 20 12C20 16.4183 16.4183 20 12 20C11.6716 20 11.3477 19.9802 11.0297 19.9417M13 22.0001L11.0297 19.9417" stroke="#5D00F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="">
                <label class="text-sm w-[6.5rem] h-4 text-center bg-white" :class="[ themeExists ? 'text-[#5D00F5]' : 'text-red-500' ]">adicionar tema</label>
                <div class="flex">
                    <div class="relative flex flex-col w-full h-8 border-2 justify-center rounded-l-lg px-2" :class="[ themeExists ? 'border-[#5D00F5]' : 'border-red-500' ]">
                        <input type="text" v-model="searchInput" class="w-full h-6" :class="[ themeExists ? 'text-black' : 'text-red-500' ]" @input="themeExists=true; onInputChange($event, true)" @focus="themeInputFocused = true" @blur="handleInputBlur">

                        <div v-if="showThemeSuggestions" class="absolute top-full left-0 w-fit max-h-44 overflow-y-auto mt-0.5 rounded-lg bg-[#5D00F5] text-white z-10">
                            <ul class="mt-1">
                                <li v-for="ts in filteredThemeSuggestions" :key="ts" :id="ts" class="hover:bg-white px-2 pr-5">
                                    <button type="button" @click="searchInput = ts" class="w-full hover:text-[#5D00F5] text-left">{{ ts }}</button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <button @click="addTheme" class="flex w-10 h-8 border-2 rounded-r-lg" :class="[ ( themeExists ? 'border-[#5D00F5]' : 'border-red-500' ) ]" :disabled="!canThemeBeAdded">
                        <div class="flex flex-col size-full justify-center rounded-r text-3xl text-white text-center" :class="[ ( themeExists ? 'border-[#5D00F5] bg-[#5D00F5]' : 'border-red-500 bg-red-500' ) + ( !canThemeBeAdded ? ' opacity-50' : '' ) ]">
                            <span class="text-center text-3xl text-white">+</span>
                        </div>
                    </button>
                </div>

                <div class="flex flex-wrap w-full mt-2">
                    <div v-for="theme in editedThemes" class="flex mr-2 mb-1 px-2 rounded-lg text-[#5D00F5] border-2 border-[#5D00F5]">
                        <span class="">{{ theme }}</span>
                        <button @click="removeTheme(theme)" class="font-bold ml-2">x</button>
                    </div>
                    <button @click="undoChanges(6)" class="flex items-center">
                        <svg class="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path d="M11 2L13 3.99545L12.9408 4.05474M13 18.0001L11 19.9108L11.0297 19.9417M12.9408 4.05474L11 6M12.9408 4.05474C12.6323 4.01859 12.3183 4 12 4C7.58172 4 4 7.58172 4 12C4 14.5264 5.17107 16.7793 7 18.2454M17 5.75463C18.8289 7.22075 20 9.47362 20 12C20 16.4183 16.4183 20 12 20C11.6716 20 11.3477 19.9802 11.0297 19.9417M13 22.0001L11.0297 19.9417" stroke="#5D00F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="flex mt-10 space-x-4">
                <button @click="closeModal" class="w-full h-10 bg-gray-300 text-black rounded-lg font-bold">Cancelar</button>
                <button @click="saveChanges" class="w-full h-10 bg-[#5D00F5] text-white rounded-lg font-bold" :class="{ 'opacity-50': !canUpdateBeMade }" :disabled="!canUpdateBeMade">Salvar</button>
            </div>
        </div>
    </div>
</template>
