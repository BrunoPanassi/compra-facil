<template>
    <v-card>
        <v-card-title>Orçamento</v-card-title>
        <v-card-subtitle>
            {{ `${budgetStore.getStore().name}, ${budgetStore.getStore().description}` }}
        </v-card-subtitle>
        <v-card-text id="budget-result">
            <div>
                <b>Cidade</b>
                <p>{{ `${budgetStore.getStore().city}, Bairro ${budgetStore.getStore().neighbr}` }}</p>
                <b>Logradouro</b>
                <p>{{ `${budgetStore.getStore().street} nº ${budgetStore.getStore().nr}, ${budgetStore.getStore().zip}` }}</p>
            </div>
            <hr>
            <div class="mt-6">
                <b>Produtos</b>
                <div v-for="prod in budgetStore.getProdStore()">
                    <p>{{ prod.name }}</p>
                    <p>{{ prod.price }}</p>
                </div>
            </div>
        </v-card-text>
        <v-btn
            append-icon="mdi-printer"
            class="ml-4 mb-2"
            color="#40916c"
            @click="downloadBudgetPDF"
            :loading="generatePdfLoading"
        >
            Imprimir
        </v-btn>
    </v-card>
</template>

<script setup lang="ts">
import { useBudgetStore } from '~/stores/budget';
import html2pdf from "html2pdf.js";
import { useRouter } from "vue-router";

const budgetStore = useBudgetStore()

const router = useRouter();

const generatePdfLoading = ref(false);
async function downloadBudgetPDF() {
  const el = document.getElementById("budget-result");
  if (!el) return;

  const opt = {
    margin:       0.5,
    filename:     `orçamento-${Date.now()}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  try {
    generatePdfLoading.value = true
    await html2pdf().from(el).set(opt).save();
  } catch (error) {
    console.error("Erro ao gerar o PDF: ", error)
  } finally {
    generatePdfLoading.value = false
  }
}

function continueOrder() {
  router.push({ name: "order" }); // Ajuste conforme sua rota desejada
}


</script>

<style scoped>

</style>