<template>
    <div class="flex flex-col items-center justify-center h-[18rem] w-[32rem] mt-24 bg-white rounded-2xl shadow-2xl">
        <span class="mb-10 text-3xl text-[#5D00F5] font-bold">LOGIN</span>

        <form class="flex flex-col">
            <div class="flex items-center space-x-2">
                <label for="" class="text-xl text-[#5D00F5] w-14">Nome</label>
                <input type="text" class="h-8 w-72 border-2 border-[#5D00F5] rounded">
            </div>
            <div class="flex mt-2 items-center space-x-2">
                <label for="" class="text-xl text-[#5D00F5] w-14">Senha</label>
                <input type="text" class="h-8 w-72 border-2 border-[#5D00F5] rounded">
            </div>

            <button type="submit" class="h-10 w-32 mt-8 bg-[#5D00F5] text-white rounded self-center">Entrar</button>
        </form>
    </div>
</template>
