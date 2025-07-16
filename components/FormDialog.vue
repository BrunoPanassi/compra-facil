<template>
    <v-dialog 
        max-width="500"
        v-model="dialog"
        persistent
    >
        <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between">
            <div>{{ title }}</div>
            <p></p>
            <v-btn density="compact" class="mt-1" elevation="4" @click="toggleDialog"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
            <v-form @submit.prevent="handleSubmit">
                <slot name="card-text"></slot>
                <v-row>
                    <v-col cols="6" md="2" lg="2" xl="2">
                    <v-btn size="small" color="grey" class="mt-3" @click="resetForm">Fechar</v-btn>
                    </v-col>
                    <v-col cols="6" md="2" lg="2" xl="2">
                    <v-btn size="small" type="submit" color="primary" class="mt-3">Salvar</v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
    title: String,
    modelValue: Boolean
})
const emit = defineEmits(['resetForm', 'handleSubmit', 'update:modelValue'])

const handleSubmit = () => { emit('handleSubmit')}
const resetForm = () => { emit('resetForm')}
const toggleDialog = () => { emit('update:modelValue', false)}

const dialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})
        
</script>