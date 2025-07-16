<template>
    <v-dialog
        max-width="500"
        v-model="dialog"
        persistent
      >
        <v-card>
          <v-card-title class="text-overline">
            {{ title }}
          </v-card-title>
          <v-card-text class="text-body-2">
            <p>{{ message }} <br>
                <div v-if="item">
                    "<strong>{{ item }}</strong>"?
                </div>
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="grey" @click="onConfirm(false)">Não</v-btn>
            <v-btn color="primary" @click="onConfirm(true)">Sim</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
    title: String,
    modelValue: Boolean,
    message: String,
    item: {
        type: String,
        default: ""
    }
})

const emit = defineEmits(['confirm', 'update:modelValue'])

const onConfirm = (confirm: boolean) => { emit('confirm', confirm)}

const dialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})
</script>