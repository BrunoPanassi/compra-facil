<template>
  <v-dialog :max-width="width" v-model="dialog" persistent>
    <v-card>
      <v-card-title class="text-subtitle-1">
        <v-btn variant="text" icon="mdi-close" @click="closeDialog">
        </v-btn>
        <div class="ml-4">{{ title }}</div>
      </v-card-title>
      <v-card-text>
        <slot />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  title: String,
  width: {
    type: [Number, String],
    default: 500,
  },
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue']);
const closeDialog = () => emit('update:modelValue', false);
const dialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})
</script>
