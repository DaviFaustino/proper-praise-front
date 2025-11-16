<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const username = ref('');
const password = ref('');

const config = useRuntimeConfig();
const backendURL = config.public.backendUrl;
const { setAccessToken } = useAuth();
const router = useRouter();

function requestLogin() {
    axios.post(backendURL + "/api/authentication/login", {}, {
        headers: {
            'Authorization': 'Basic ' + btoa(`${username.value}:${password.value}`)
        }}).then(response => {
            setAccessToken(response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            router.push('/');
        }).catch(error => {
            console.error("There was an error!");
        });
}
</script>

<template>
    <div class="flex flex-col items-center justify-center h-[18rem] w-[32rem] mt-24 bg-white rounded-2xl shadow-2xl">
        <span class="mb-10 text-3xl text-[#5D00F5] font-bold">LOGIN</span>

        <form @submit.prevent="requestLogin" class="flex flex-col">
            <div class="flex items-center space-x-2">
                <label class="text-xl text-[#5D00F5] w-14">Nome</label>
                <input type="text" v-model="username" class="h-8 w-72 p-2 border-2 border-[#5D00F5] rounded">
            </div>
            <div class="flex mt-2 items-center space-x-2">
                <label class="text-xl text-[#5D00F5] w-14">Senha</label>
                <input type="password" v-model="password" class="h-8 w-72 p-2 border-2 border-[#5D00F5] rounded">
            </div>

            <button type="submit" class="h-10 w-32 mt-8 bg-[#5D00F5] text-white rounded self-center">Entrar</button>
        </form>
    </div>
</template>
