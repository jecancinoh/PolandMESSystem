<template>
  <div class="q-mt-md flex flex-col items-center full-width">
    <div class="font-medium q-mb-sm lang-title text-bold text-center">
      {{ title }}
    </div>

    <div>
      <q-btn-toggle
        v-model="langModel"
        :options="langOptions"
        round
        unelevated
        dense
        toggle-color="primary"
        color="grey-3"
        text-color="grey-9"
        size="md"
        class="lang-toggle"
      />
    </div>
  </div>
</template>

<script setup>
// ... (resto del script sin cambios)
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Quasar } from "quasar";

import qEn from "quasar/lang/en-US";
import qEs from "quasar/lang/es";
import qPl from "quasar/lang/pl";

import { useProductionStore } from "src/stores/productionStore";
const production = useProductionStore();

const packs = { en: qEn, es: qEs, pl: qPl };

const langOptions = [
  { label: "ES", value: "es" },
  { label: "EN", value: "en" },
  { label: "PL", value: "pl" },
];

const { locale } = useI18n();

const setLang = (lang) => {
  locale.value = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.setAttribute("lang", lang);
  Quasar.lang.set(packs[lang] || qEn);
};

const langModel = computed({
  get: () => locale.value,
  set: async (val) => {
    setLang(val); // cambia Quasar + i18n
    await production.setLangAction(val); // 🔥 vuelve a cargar downtimeReasons
  },
});

const title = computed(() => {
  switch (langModel.value) {
    case "en":
      return "Language Selection";
    case "pl":
      return "Wybór języka";
    default:
      return "Selección de Idioma";
  }
});

onMounted(() => {
  const savedLang = localStorage.getItem("lang") || "es";
  setLang(savedLang);
});
</script>

<style scoped>
/* Estilos cruciales: Aseguran que el título ocupe 100% y que su texto se alinee a la derecha. */
.lang-title {
  width: 100%;
  text-align: left;
}

/* Toggle alineado a la derecha y con margen superior opcional */
.lang-toggle {
  width: 100%; /* fuerza que el contenedor del toggle ocupe toda la fila */
  display: flex; /* convertimos el contenedor en flex */
  justify-content: left; /* empuja el toggle a la derecha */
}

.q-btn-toggle__btn {
  transition: all 0.25s ease;
}

.q-btn-toggle__btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.q-btn-toggle__btn--active {
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
