<script setup>
import { ref } from "vue";
const { $api } = useNuxtApp();

const username = ref('');
const password = ref('');

const { setIsAuthenticated } = useAuth();

function requestLogin() {
    $api.post("/api/authentication/login", {}, {
        headers: {
            'Authorization': 'Basic ' + btoa(`${username.value}:${password.value}`),
            'X-API-Version': '0.2'
        }}).then(() => {
            setIsAuthenticated(true);
            navigateTo('/');
        }).catch(() => {
            console.error("There was an error!");
        });
}
</script>

<template>
    <div class="flex flex-col justify-center flex-grow">
        <div class="flex flex-col items-center justify-center h-60 md:h-[18rem] w-96 mb-36 mt-20 md:w-[32rem] bg-white rounded-2xl shadow-2xl">
            <span class="mb-8 md:mb-10 text-2lx md:text-3xl text-[#5D00F5] font-bold">LOGIN</span>
    
            <form @submit.prevent="requestLogin" class="flex flex-col text-[#5D00F5]">
                <div class="flex items-center space-x-2">
                    <label class="text-lg md:text-xl w-11 md:w-12">Nome</label>
                    <input type="text" v-model="username" class="h-7 w-64 p-2 border-2 border-[#5D00F5] rounded">
                </div>
                <div class="flex mt-2 items-center space-x-2">
                    <label class="text-lg md:text-xl w-11 md:w-12">Senha</label>
                    <input type="password" v-model="password" class="h-7 w-64 p-2 border-2 border-[#5D00F5] rounded">
                </div>
    
                <button type="submit" class="h-8 md:h-10 w-28 md:w-32 mt-6 md:mt-8 bg-[#5D00F5] text-white md:text-lg rounded self-center">Entrar</button>
            </form>
        </div>
    </div>
</template>
