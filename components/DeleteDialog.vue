<template>
  <v-dialog :max-width="width" v-model="dialog" persistent>
    <v-card>
      <v-card-title class="text-overline">Deletar</v-card-title>
      <v-card-text class="text-body-2">
        <p>Deseja deletar o item <strong>{{ itemName }}</strong>?</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="$emit('cancel')">Não</v-btn>
        <v-btn color="primary" @click="$emit('confirm')">Sim</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: Boolean,
  itemName: String,
  width: {
    type: [Number, String],
    default: 500,
  },
});


const emit = defineEmits(['cancel', 'confirm', 'update:modelValue'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})
</script>
