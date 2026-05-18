<template>
  <div class="fullscreen flex flex-center bg-gradient">
    <!-- Botón flotante para el Modo Oscuro -->
    <q-btn
      flat
      round
      :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
      class="absolute-top-right q-ma-md text-white"
      @click="toggleDarkMode"
    />

    <q-card class="text-center q-pa-xl error-card glass-effect animated">
      <q-icon name="report_problem" size="100px" color="primary" />

      <div class="text-h1 text-weight-bolder q-mt-md text-primary">404</div>

      <div
        class="text-h5 q-mt-sm text-weight-medium"
        :class="$q.dark.isActive ? 'text-white' : 'text-black'"
      >
        Página no encontrada
      </div>

      <div
        class="text-body1 q-mt-md"
        :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'"
      >
        Parece que te has desviado del camino.<br />
        Verifica la URL o regresa al inicio para continuar.
      </div>

      <div class="q-mt-xl row justify-center q-gutter-sm">
        <q-btn
          color="primary"
          unelevated
          rounded
          label="Ir al inicio"
          to="/"
          no-caps
          class="q-px-lg"
        />

        <q-btn
          flat
          rounded
          color="primary"
          label="Regresar"
          no-caps
          @click="goBack"
          class="q-px-lg"
        />
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useQuasar, LocalStorage } from "quasar";

defineOptions({
  name: "ErrorNotFound",
});

const router = useRouter();
const $q = useQuasar();

const darkMode = LocalStorage.getItem("darkMode");
if (darkMode !== null) {
  $q.dark.set(darkMode);
}

// Función para alternar el modo
const toggleDarkMode = () => {
  $q.dark.toggle();
  // Guardamos la preferencia del usuario
  LocalStorage.set("darkMode", $q.dark.isActive);
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.error-card {
  width: 90%;
  max-width: 450px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.error-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
}

/* Glassmorphism mejorado */
.glass-effect {
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

/* Dark mode support (Quasar) */
.body--dark .glass-effect {
  background: rgba(30, 30, 30, 0.75) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animación */
.animated {
  animation-name: fadeIn;
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
