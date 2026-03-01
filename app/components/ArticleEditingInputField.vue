<template>
    <div class="flex flex-col">
        <label class="font-bold text-sm sm:text-[1rem] mb-1">{{ label }}</label>
        <input type="text" class="border rounded-md p-1 w-full text-sm sm:text-md focus:outline-none " :class="[ !isValueValid && validationFailed ? 'border-red-500 text-red-500 placeholder-red-500': 'border-gray-300' ]" :placeholder="placeholder" v-model="fieldValue"/>
    </div>
</template>

<script setup>
const props = defineProps({
    label: String,
    placeholder: String,
    validationFailed: Boolean,
    isValueValid: Boolean
});
const fieldValue = defineModel();
</script>
