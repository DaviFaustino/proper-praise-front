<template>
    <button @click="buttonClick">
        {{ buttonText }}
    </button>
</template>

<script setup>
const props = defineProps({
    buttonText: String,
    optionId: String
})

const emit = defineEmits(['selected'])

function buttonClick() {
    emit('selected', props.optionId)
}
</script>
