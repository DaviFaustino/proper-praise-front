<template>
    <div class="flex flex-col">
        <label class="font-bold text-sm sm:text-[1rem] mb-1">{{ label }}</label>
        <textarea type="text" class="border border-gray-300 rounded-md p-1 w-full h-24 text-sm sm:text-md resize-none focus:outline-none" :class="[ !isValueValid && validationFailed ? 'border-red-500 text-red-500 placeholder-red-500': 'border-gray-300' ]" :placeholder="placeholder" v-model="fieldValue"/>
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
