<template>
  <!-- Puedes envolverlo en <q-page> o dejarlo directo, según necesites -->
  <q-page class="q-pa-md">
    <MESSystem />
  </q-page>
</template>

<script setup>
/* 1) Importa el componente: la alias "components/" ya apunta a src/components */
import MESSystem from "components/MESSystem.vue";

/* 2) Conserva el nombre del componente de página (opcional) */
defineOptions({
  name: "IndexPage",
});
</script>
