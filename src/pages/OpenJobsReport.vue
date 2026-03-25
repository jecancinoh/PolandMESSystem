<template>
  <q-layout view="lHh LpR lFf">
    <q-drawer
      side="left"
      show-if-above
      v-model="drawer"
      bordered
      :width="240"
      class="bg-blue-grey-1 column"
      behavior="desktop"
    >
      <q-list class="q-pt-xl">
        <div
          class="text-subtitle1 text-weight-bold text-primary flex items-center justify-center q-mb-md q-mt-lg"
        >
          <q-icon
            name="filter_alt"
            color="primary"
            size="28px"
            class="q-mr-sm"
          />
          <span class="text-h6 text-primary q-mt-xs">{{
            $t("configuration.drawerTitle")
          }}</span>
        </div>
      </q-list>

      <q-separator spaced />

      <q-item clickable>
        <q-btn
          :label="$t('Reporte.update')"
          color="primary"
          icon="refresh"
          class="rounded-btn full-width"
          @click="loadData"
          :loading="isLoading"
          :disable="isLoading"
        />
      </q-item>

      <q-separator spaced />

      <div class="q-pa-sm q-gutter-y-sm">
        <div
          class="text-caption text-weight-bold text-secondary text-center q-mb-sm"
        >
          {{ $t("openjobs.fill") }}
        </div>

        <q-card
          flat
          bordered
          v-ripple
          @click="activeFilter = 'TODOS'"
          :class="[
            activeFilter === 'TODOS'
              ? 'bg-primary text-white shadow-4'
              : 'bg-white text-primary',
            'cursor-pointer clickable-card',
          ]"
        >
          <q-card-section class="q-pa-sm flex items-center justify-between">
            <div class="text-subtitle2 text-bold">
              <q-icon name="list" size="20px" class="q-mr-xs" />
              {{ $t("openjobs.all") }}
            </div>
            <div class="text-h6 text-bold">{{ countTotal }}</div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          v-ripple
          @click="countEnProceso > 0 ? (activeFilter = 'EN PROCESO') : null"
          :class="[
            activeFilter === 'EN PROCESO'
              ? 'bg-positive text-white shadow-4'
              : 'bg-white text-positive',
            countEnProceso > 0
              ? 'cursor-pointer clickable-card'
              : 'opacity-50 cursor-not-allowed',
          ]"
        >
          <q-card-section class="q-pa-sm flex items-center justify-between">
            <div class="text-subtitle2 text-bold">
              <q-icon name="play_circle" size="20px" class="q-mr-xs" />
              {{ $t("openjobs.inprog") }}
            </div>
            <div class="text-h6 text-bold">{{ countEnProceso }}</div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          v-ripple
          @click="
            countProcesoLargo > 0 ? (activeFilter = 'PROCESO LARGO') : null
          "
          :class="[
            activeFilter === 'PROCESO LARGO'
              ? 'bg-negative text-white shadow-4'
              : 'bg-white text-negative',
            countProcesoLargo > 0
              ? 'cursor-pointer clickable-card'
              : 'opacity-50 cursor-not-allowed',
          ]"
        >
          <q-card-section class="q-pa-sm flex items-center justify-between">
            <div class="text-subtitle2 text-bold">
              <q-icon name="timer" size="20px" class="q-mr-xs" />
              {{ $t("openjobs.longpro") }}
            </div>
            <div class="text-h6 text-bold">{{ countProcesoLargo }}</div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          v-ripple
          @click="countPausado > 0 ? (activeFilter = 'PAUSADO') : null"
          :class="[
            activeFilter === 'PAUSADO'
              ? 'bg-amber-8 text-white shadow-4'
              : 'bg-white text-amber-8',
            countPausado > 0
              ? 'cursor-pointer clickable-card'
              : 'opacity-50 cursor-not-allowed',
          ]"
        >
          <q-card-section class="q-pa-sm flex items-center justify-between">
            <div class="text-subtitle2 text-bold">
              <q-icon name="pause_circle" size="20px" class="q-mr-xs" />
              {{ $t("openjobs.pause") }}
            </div>
            <div class="text-h6 text-bold">{{ countPausado }}</div>
          </q-card-section>
        </q-card>
      </div>

      <q-space />
      <q-separator spaced />

      <div class="q-pa-sm flex justify-center">
        <div
          class="text-center q-pa-sm bg-grey-2 rounded-borders border-primary shadow-up-1"
        >
          <div class="text-h5 text-bold text-primary">
            {{ horaFormateada }}
          </div>
          <div class="text-caption text-grey-8">
            {{ fechaFormateada }}
          </div>
        </div>
      </div>

      <q-separator spaced />

      <q-card-actions align="left">
        <div
          class="row justify-center items-center q-mt-xs full-width"
          style="min-height: 50px"
        >
          <LanguageToggle />
        </div>
      </q-card-actions>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <transition name="fade-overlay">
          <div v-if="isLoading" class="loading-overlay-relative">
            <div class="dual-ring-large"></div>
            <div class="loading-text">{{ $t("Downtimes.upload") }}</div>
          </div>
        </transition>
        <div class="row items-center q-mb-md">
          <q-avatar square size="70px">
            <img
              src="/img/AFL.png"
              style="width: 2em; height: 2em; margin-right: 0.5em"
            />
          </q-avatar>
          <div class="text-h5 text-primary text-bold">
            {{ $t("openjobs.title") }}

            <div class="text-subtitle2 text-secondary">
              {{ $t("hrxhr.update") }} {{ lastUpdateDisplay }}
            </div>
            <q-badge
              color="primary"
              class="q-ml-sm"
              v-if="activeFilter !== 'TODOS'"
            >
              {{ $t("openjobs.fill2") }} {{ activeFilterLabel }}
            </q-badge>
          </div>
        </div>

        <q-table
          class="downtime-qtable"
          table-header-class="custom-header"
          flat
          bordered
          wrap-cells
          :rows="filteredEvents"
          :columns="columns"
          row-key="Id"
          :loading="loading"
          :pagination="pagination"
          @update:pagination="pagination = $event"
          :rows-per-page-options="[10, 20, 50, 0]"
          :no-data-label="$t('openjobs.nodata')"
        >
          <template v-slot:body="props">
            <q-tr :props="props" class="custom-trackingrow">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'AlertType'">
                  <q-badge
                    :color="getAlertColor(col.value)"
                    class="text-bold q-pa-xs"
                  >
                    {{ getAlertTranslation(col.value) }}
                  </q-badge>
                </template>

                <template v-else-if="col.name === 'StatusDescription'">
                  <q-btn
                    v-if="props.row.Status === 1"
                    outline
                    dense
                    size="md"
                    no-caps
                    no-wrap
                    color="primary"
                    icon="stop"
                    :label="$t('openjobs.endjob1')"
                    class="rounded-btn"
                    @click="showendjobDialogFn(props.row)"
                  />

                  <q-btn
                    v-else
                    outline
                    dense
                    size="md"
                    no-caps
                    no-wrap
                    :color="props.row.Status === 4 ? 'amber-8' : 'primary'"
                    :icon="props.row.Status === 4 ? 'play_arrow' : 'stop'"
                    :label="
                      props.row.Status === 4 ? $t('openjobs.rewj') : col.value
                    "
                    class="rounded-btn"
                    @click="showpauseDialogFn(props.row)"
                  />
                </template>

                <template v-else-if="col.name === 'StartTime'">
                  <span
                    :class="{
                      'text-negative text-bold': !dayjs
                        .utc(props.row.StartTime)
                        .local()
                        .isSame(dayjs(), 'day'),
                    }"
                  >
                    {{
                      formatSmartDate(
                        props.row.StartTime,
                        props.row.EndTime,
                        true
                      )
                    }}
                  </span>
                </template>

                <template v-else>
                  {{ col.value }}
                </template>
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <q-dialog v-model="showpauseDialog" persistent>
          <q-card style="min-width: 400px; border-radius: 12px">
            <q-card-section
              class="row items-center bg-primary text-white q-py-xs"
            >
              <img
                src="/img/AFL_Logo.svg"
                style="width: 1.8em; height: 1.8em; margin-right: 0.5em"
                class="q-mr-sm"
              />
              <q-icon
                :name="
                  selectedRow?.Status === 4 ? 'play_circle_outline' : 'pause'
                "
                size="2em"
                class="q-mr-xs"
              />
              <div class="text-h6 text-weight-medium">
                {{
                  selectedRow?.Status === 4
                    ? $t("openjobs.reproc")
                    : $t("openjobs.pausep")
                }}
              </div>
            </q-card-section>

            <q-card-section class="q-pt-md q-pb-md">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-icon
                  :name="selectedRow?.Status === 4 ? 'info' : 'warning'"
                  :color="selectedRow?.Status === 4 ? 'positive' : 'amber-8'"
                  size="2.5em"
                />
                <div class="col">
                  <span class="text-body1 text-blue-grey-8">
                    {{
                      selectedRow?.Status === 4
                        ? $t("openjobs.restartj")
                        : $t("openjobs.pausej")
                    }}
                    <span class="text-weight-bold text-blue-grey-10">
                      "{{ selectedRow?.JobNumber }}"
                    </span>
                    ?
                  </span>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md bg-grey-1">
              <q-btn
                flat
                :label="$t('openjobs.cancel')"
                class="rounded-btn q-px-md"
                color="blue-grey-6"
                v-close-popup
              />
              <q-btn
                unelevated
                :icon="selectedRow?.Status === 4 ? 'play_arrow' : 'pause'"
                :label="
                  selectedRow?.Status === 4
                    ? $t('openjobs.rew')
                    : $t('openjobs.pause3')
                "
                :color="selectedRow?.Status === 4 ? 'positive' : 'amber-8'"
                text-color="white"
                class="rounded-btn q-px-md"
                @click="confirmpause"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- 🧩 MODAL -->
        <q-dialog v-model="showEndJobDialog" persistent>
          <q-card style="min-width: 450px; border-radius: 12px">
            <q-card-section
              class="row items-center bg-primary text-white q-py-xs"
            >
              <img
                src="/img/AFL_Logo.svg"
                style="width: 2.5em; height: 2.5em; margin-right: 0.5em"
                class="q-mr-sm"
              />
              <q-icon
                :name="selectedRow?.Status === 1 ? 'stop_circle' : 'pause'"
                size="2em"
                class="q-mr-xs"
              />
              <div class="text-h6 text-weight-medium">
                {{ $t("openjobs.endjob") }}
                <span class="text-weight-bold"
                  >"{{ selectedRow?.JobNumber }}"</span
                >
              </div>
            </q-card-section>

            <q-card-section class="q-pt-md q-pb-none">
              <p class="text-body2 text-blue-grey-8 q-mb-md">
                {{ $t("openjobs.alert1") }}
              </p>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model.number="connectorsA"
                    type="number"
                    :label="$t('openjobs.cxa')"
                    outlined
                    dense
                    color="primary"
                    :disable="connectorsAFromDB !== null"
                    :rules="[
                      (val) =>
                        connectorsAFromDB !== null ||
                        val > 0 ||
                        'Cx A es obligatorio',
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="settings_input_component"
                        color="blue-grey-4"
                      />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <q-input
                    v-model.number="connectorsB"
                    type="number"
                    :label="$t('openjobs.cxb')"
                    outlined
                    dense
                    color="primary"
                    :disable="connectorsBFromDB !== null"
                    :rules="[
                      (val) =>
                        connectorsBFromDB !== null ||
                        val > 0 ||
                        'Cx B es obligatorio',
                    ]"
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="settings_input_component"
                        color="blue-grey-4"
                      />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="row q-mt-sm">
                <div class="col-12">
                  <q-input
                    v-model.number="cycleMinutes"
                    type="number"
                    :label="$t('openjobs.min')"
                    :hint="$t('openjobs.hint')"
                    outlined
                    dense
                    color="primary"
                    :rules="[(val) => val > 0 || $t('openjobs.minalert')]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="timer" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md bg-grey-1">
              <q-btn
                flat
                :label="$t('openjobs.cancel')"
                color="blue-grey-6"
                class="rounded-btn q-px-md"
                v-close-popup
              />
              <q-btn
                unelevated
                icon="check_circle"
                color="primary"
                :label="$t('openjobs.endjob')"
                class="rounded-btn q-px-md"
                :disable="
                  (connectorsAFromDB === null &&
                    (!connectorsA || connectorsA <= 0)) ||
                  (connectorsBFromDB === null &&
                    (!connectorsB || connectorsB <= 0)) ||
                  !cycleMinutes ||
                  cycleMinutes <= 0
                "
                @click="validateAndCompleteJob"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { Notify } from "quasar";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useReportStore } from "src/stores/ReportStore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import LanguageToggle from "src/components/LanguageToggle.vue";
import { useI18n } from "vue-i18n";

dayjs.extend(utc);

const { t, locale } = useI18n();

const reportStore = useReportStore();
const drawer = ref(true);
const loading = ref(false);
const isLoading = ref(false);

// Variable que guarda el filtro actual
const activeFilter = ref("TODOS");

const lastUpdate = ref(null);

// 🧠 estado del dialog
const showpauseDialog = ref(false);
const showEndJobDialog = ref(false);
const selectedRow = ref(null);

// Valores del form
const connectorsA = ref(0);
const connectorsB = ref(0);
const cycleMinutes = ref(null);

// 🔥 Valores originales de DB
const connectorsAFromDB = ref(null);
const connectorsBFromDB = ref(null);

// 🚀 abrir modal
const showpauseDialogFn = (row) => {
  selectedRow.value = row;
  showpauseDialog.value = true;
};

// Abrir modal
const showendjobDialogFn = (row) => {
  console.log("🛑 End job clicked:", row);

  selectedRow.value = row;
  showEndJobDialog.value = true;

  // Guardar valores originales
  connectorsAFromDB.value = row.ConnectorsA;
  connectorsBFromDB.value = row.ConnectorsB;

  // Si vienen de DB, usarlos; si no, dejar en 0 para captura
  connectorsA.value = row.ConnectorsA ?? 0;
  connectorsB.value = row.ConnectorsB ?? 0;

  // Siempre manual
  cycleMinutes.value = null;
};

// ✅ confirmar acción
const confirmpause = async () => {
  if (!selectedRow.value) return;

  const success = await reportStore.pauseProduction(selectedRow.value.Id);

  if (success) {
    showpauseDialog.value = false;

    // 🔄 refrescar datos
    await reportStore.fetchOpenJobs();
  }
};

// Acción final
const validateAndCompleteJob = async () => {
  if (!selectedRow.value) return;

  // Validar ConnectorsA si venía null
  if (
    connectorsAFromDB.value === null &&
    (!connectorsA.value || connectorsA.value <= 0)
  ) {
    Notify.create({
      type: "warning",
      message: "Ingresa Connectors A válido",
    });
    return;
  }

  // Validar ConnectorsB si venía null
  if (
    connectorsBFromDB.value === null &&
    (!connectorsB.value || connectorsB.value <= 0)
  ) {
    Notify.create({
      type: "warning",
      message: "Ingresa Connectors B válido",
    });
    return;
  }

  // Validar ciclo siempre
  if (!cycleMinutes.value || cycleMinutes.value <= 0) {
    Notify.create({
      type: "warning",
      message: "Ingresa un tiempo de ciclo válido",
    });
    return;
  }

  // Todos los datos correctos → llamar al store
  const success = await reportStore.completeProduction(
    selectedRow.value.Id,
    connectorsA.value,
    connectorsB.value,
    cycleMinutes.value
  );

  if (success) {
    showEndJobDialog.value = false;

    // limpiar valores
    connectorsA.value = 0;
    connectorsB.value = 0;
    cycleMinutes.value = null;
    connectorsAFromDB.value = null;
    connectorsBFromDB.value = null;

    // 🔄 refrescar datos
    await reportStore.fetchOpenJobs();
  }
};

// Paginación
const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

const columns = computed(() => [
  {
    name: "JobNumber",
    label: t("openjobs.label1"),
    field: "JobNumber",
    align: "center",
    sortable: true,
  },
  {
    name: "ConnectorsA",
    label: t("openjobs.label2"),
    field: "ConnectorsA",
    align: "center",
    sortable: true,
  },
  {
    name: "ConnectorsB",
    label: t("openjobs.label3"),
    field: "ConnectorsB",
    align: "center",
    sortable: true,
  },
  {
    name: "StationName",
    label: t("openjobs.label4"),
    field: "StationName",
    align: "center",
    sortable: true,
  },
  {
    name: "Shift",
    label: t("openjobs.label5"),
    field: "Shift",
    align: "center",
    sortable: true,
  },
  {
    name: "OperatorId1",
    label: t("openjobs.label6"),
    field: "OperatorId1",
    align: "center",
    sortable: true,
  },
  {
    name: "FULL_NAME",
    label: t("openjobs.label7"),
    field: "FULL_NAME",
    align: "center",
    sortable: true,
  },
  {
    name: "StartTime",
    label: t("openjobs.label8"),
    field: "StartTime",
    align: "center",
    sortable: true,
  },
  {
    name: "TimeOpenFormatted",
    label: t("openjobs.label9"),
    field: "TimeOpenFormatted",
    align: "center",
    sortable: true,
  },
  {
    name: "AlertType",
    label: t("openjobs.label10"),
    field: "AlertType",
    align: "center",
    sortable: true,
  },
  {
    name: "StatusDescription",
    label: t("openjobs.label11"),
    field: "StatusDescription",
    align: "center",
    sortable: true,
  },
]);

const lastUpdateDisplay = computed(() => {
  return lastUpdate.value
    ? new Date(lastUpdate.value).toLocaleString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--/--/---- --:--:--";
});

const loadData = async () => {
  isLoading.value = true;
  await reportStore.fetchOpenJobs();
  lastUpdate.value = Date.now();
  isLoading.value = false; // <-- indicar fin de carga
};

// --- CONTADORES PARA LOS BOTONES ---
const countTotal = computed(() => reportStore.openJobsList.length);
const countEnProceso = computed(
  () =>
    reportStore.openJobsList.filter((job) => job.AlertType === "EN PROCESO")
      .length
);
const countProcesoLargo = computed(
  () =>
    reportStore.openJobsList.filter((job) => job.AlertType === "PROCESO LARGO")
      .length
);
const countPausado = computed(
  () =>
    reportStore.openJobsList.filter((job) => job.AlertType === "PAUSADO").length
);

// --- FILTRADO DE LA TABLA ---
const filteredEvents = computed(() => {
  if (activeFilter.value === "TODOS") return reportStore.openJobsList;
  return reportStore.openJobsList.filter(
    (job) => job.AlertType === activeFilter.value
  );
});

// Propiedad computada que observa activeFilter e i18n
const activeFilterLabel = computed(() => {
  switch (activeFilter.value) {
    case "PROCESO LARGO":
      return t("openjobs.longpro");
    case "RETRABAJO ABIERTO":
      return t("openjobs.rework"); // Asegúrate de tener esta llave
    case "PAUSADO":
      return t("openjobs.pause");
    case "EN PROCESO":
      return t("openjobs.inprog");
    case "TODOS":
      return t("openjobs.all");
    default:
      return activeFilter.value;
  }
});

const getAlertColor = (alertType) => {
  switch (alertType) {
    case "PROCESO LARGO":
      return "negative";
    case "RETRABAJO ABIERTO":
      return "warning";
    case "PAUSADO":
      return "amber-8";
    case "EN PROCESO":
      return "positive";
    default:
      return "info";
  }
};

// Esta computed devuelve una función que acepta el tipo de alerta
const getAlertTranslation = computed(() => {
  return (alertType) => {
    switch (alertType) {
      case "PROCESO LARGO":
        return t("openjobs.longpro");
      case "RETRABAJO ABIERTO":
        return t("openjobs.rework");
      case "PAUSADO":
        return t("openjobs.pause");
      case "EN PROCESO":
        return t("openjobs.inprog");
      default:
        return alertType;
    }
  };
});

// --- RELOJ Y FECHAS ---
const fechaFormateada = ref("");
const horaFormateada = ref("");
let intervaloId = null;

const mostrarHora = () => {
  const currentLang = localStorage.getItem("lang") || "es";
  const ahora = dayjs().locale(currentLang);
  if (currentLang === "es") {
    fechaFormateada.value = ahora.format("dddd D [de] MMMM [del] YYYY");
  } else {
    fechaFormateada.value = ahora.format("dddd D MMMM YYYY");
  }
  horaFormateada.value = ahora.format("hh:mm:ss A");
};

const formatSmartDate = (start, end = null, isStartTime = false) => {
  if (!start) return "-";

  const startDate = dayjs.utc(start).local();
  const endDate = end ? dayjs.utc(end).local() : null;
  const now = dayjs();

  if (isStartTime) {
    return startDate.isSame(now, "day")
      ? startDate.format("hh:mm A")
      : startDate.format("DD/MM/YYYY hh:mm A");
  }

  if (!endDate) return "-";

  return endDate.isSame(now, "day")
    ? endDate.format("hh:mm A")
    : endDate.format("DD/MM/YYYY hh:mm A");
};

onMounted(() => {
  mostrarHora();
  intervaloId = setInterval(mostrarHora, 1000);
  loadData();
});

onUnmounted(() => {
  if (intervaloId) clearInterval(intervaloId);
});
</script>

<style scoped>
.rounded-btn {
  border-radius: 10px;
  font-weight: bold;
  font-size: 12px;
  width: auto; /* Se adapta al contenido */
  min-width: unset; /* Elimina el tamaño mínimo forzado */
  border: 2px solid white;
}

:deep(.downtime-qtable .q-table__th) {
  font-weight: 900 !important;
}
:deep(.downtime-qtable .q-table__sort-icon) {
  color: white !important;
  opacity: 1 !important;
}
:deep(.custom-header th) {
  background-color: #003153 !important;
  color: white !important;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}
.custom-trackingrow:nth-child(even):not(.custom-header) {
  background-color: #e9eef5;
}
.custom-trackingrow:hover:not(.custom-header) {
  background-color: #d0e4ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.clickable-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Overlay centrado y grande */
.relative-container {
  position: relative;
}

.loading-overlay-relative {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dual-ring-large {
  display: inline-block;
  width: 100px;
  height: 100px;
}
.dual-ring-large:after {
  content: " ";
  display: block;
  width: 92px;
  height: 92px;
  margin: 4px;
  border-radius: 50%;
  border: 6px solid #1976d2;
  border-color: #1976d2 transparent #1976d2 transparent;
  animation: dual-ring 1.2s linear infinite;
}

@keyframes dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.3rem;
  color: #1976d2;
  font-weight: bold;
}
</style>
