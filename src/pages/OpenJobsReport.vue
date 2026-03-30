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
          @click="confirmUpdate"
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
          style="min-width: 200px"
        >
          <div
            class="text-overline text-primary q-mb-xs"
            style="line-height: 1"
          >
            <q-icon name="schedule" size="xs" class="q-mr-xs" />
            {{ zonaHorariaLabel }}
          </div>

          <div class="text-h5 text-bold text-primary">
            {{ horaFormateada }}
          </div>

          <div class="text-caption text-grey-8 text-capitalize">
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

            <div class="text-subtitle2 text-negative">
              {{ $t("openjobs.subtitle") }}
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
          :rows="filteredEvents"
          :columns="columns"
          row-key="Id"
          v-model:pagination="pagination"
        >
          <template v-slot:header-cell="props">
            <q-th :props="props" class="custom-header text-center">
              <q-icon
                v-if="props.col.icon"
                :name="props.col.icon"
                size="1.2em"
                class="q-mr-xs"
              />
              {{ props.col.label }}
            </q-th>
          </template>

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
                    :color="
                      props.row.Status === 2 || col.value === 'CERRADO'
                        ? 'negative'
                        : props.row.Status === 4
                        ? 'amber-8'
                        : 'primary'
                    "
                    :icon="
                      props.row.Status === 2 || col.value === 'CERRADO'
                        ? 'done'
                        : props.row.Status === 4
                        ? 'play_arrow'
                        : 'stop'
                    "
                    :label="
                      props.row.Status === 2 || col.value === 'CERRADO'
                        ? $t('openjobs.close')
                        : props.row.Status === 4
                        ? $t('openjobs.rewj')
                        : col.value
                    "
                    class="rounded-btn"
                    :disable="props.row.Status === 2 || col.value === 'CERRADO'"
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

                <template v-else-if="col.name === 'JobNumber'">
                  <div class="row items-center no-wrap justify-center">
                    <q-chip
                      v-if="props.row._isModifiedLocally"
                      :color="props.row._chipColor || 'primary'"
                      text-color="white"
                      dense
                      icon="edit"
                      class="text-bold"
                      style="padding: 2px 8px; font-size: 13px"
                    >
                      {{ col.value }}
                    </q-chip>

                    <span v-else class="text-bold text-blue-grey-10">
                      {{ col.value }}
                    </span>
                  </div>
                </template>

                <template v-else>
                  <span class="text-bold">{{ col.value }}</span>
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
                        $t('openjobs.cxalert'),
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
                        $t('openjobs.cxbalert'),
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
import { Notify, useQuasar } from "quasar";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useReportStore } from "src/stores/ReportStore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import "dayjs/locale/en";
import LanguageToggle from "src/components/LanguageToggle.vue";
import { useI18n } from "vue-i18n";

dayjs.extend(utc);
dayjs.extend(timezone);

const { t, locale } = useI18n();

const $q = useQuasar();

const reportStore = useReportStore();
const drawer = ref(true);
const loading = ref(false);
const isLoading = ref(false);

const localJobsList = ref([]);

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

    const index = localJobsList.value.findIndex(
      (job) => job.Id === selectedRow.value.Id
    );

    if (index !== -1) {
      if (localJobsList.value[index].Status === 4) {
        // Estaba pausado, lo pasamos a proceso
        localJobsList.value[index].Status = 1;
        localJobsList.value[index].AlertType = "EN PROCESO";
        localJobsList.value[index].StatusDescription = "EN PROCESO";
        // 🟢 Verde al reanudar
        localJobsList.value[index]._chipColor = "positive";
      } else {
        // Estaba en proceso, lo pasamos a pausado
        localJobsList.value[index].Status = 4;
        localJobsList.value[index].AlertType = "PAUSADO";
        localJobsList.value[index].StatusDescription = "PAUSADO";
        // 🟠 Naranja al pausar
        localJobsList.value[index]._chipColor = "amber-8";
      }

      // 🔥 INDICADORES DE MODIFICACIÓN
      localJobsList.value[index]._isModifiedLocally = true;

      localStorage.setItem("openJobsData", JSON.stringify(localJobsList.value));
    }
  }
};

// Acción final
const validateAndCompleteJob = async () => {
  if (!selectedRow.value) return;

  if (
    connectorsAFromDB.value === null &&
    (!connectorsA.value || connectorsA.value <= 0)
  ) {
    Notify.create({ type: "warning", message: "Ingresa Connectors A válido" });
    return;
  }

  if (
    connectorsBFromDB.value === null &&
    (!connectorsB.value || connectorsB.value <= 0)
  ) {
    Notify.create({ type: "warning", message: "Ingresa Connectors B válido" });
    return;
  }

  if (!cycleMinutes.value || cycleMinutes.value <= 0) {
    Notify.create({
      type: "warning",
      message: "Ingresa un tiempo de ciclo válido",
    });
    return;
  }

  const success = await reportStore.completeProduction(
    selectedRow.value.Id,
    Number(connectorsA.value),
    Number(connectorsB.value),
    Number(cycleMinutes.value)
  );

  if (success) {
    showEndJobDialog.value = false;

    connectorsA.value = 0;
    connectorsB.value = 0;
    cycleMinutes.value = null;
    connectorsAFromDB.value = null;
    connectorsBFromDB.value = null;

    const index = localJobsList.value.findIndex(
      (job) => job.Id === selectedRow.value.Id
    );

    if (index !== -1) {
      // Cambiamos el estatus a Cerrado
      localJobsList.value[index].Status = 2;
      localJobsList.value[index].AlertType = "CERRADO";
      localJobsList.value[index].StatusDescription = "CERRADO";

      // 🔴 Rojo al terminar el trabajo
      localJobsList.value[index]._chipColor = "negative";

      // 🔥 INDICADORES DE MODIFICACIÓN
      localJobsList.value[index]._isModifiedLocally = true;

      localStorage.setItem("openJobsData", JSON.stringify(localJobsList.value));
    }
  }
};

const pagination = ref({
  sortBy: "StartTime",
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
    icon: "tag",
  },
  {
    name: "ConnectorsA",
    label: t("openjobs.label2"),
    field: "ConnectorsA",
    align: "center",
    sortable: true,
    icon: "settings_input_component",
  },
  {
    name: "ConnectorsB",
    label: t("openjobs.label3"),
    field: "ConnectorsB",
    align: "center",
    sortable: true,
    icon: "settings_input_component",
  },
  {
    name: "StationName",
    label: t("openjobs.label4"),
    field: "StationName",
    align: "center",
    sortable: true,
    icon: "precision_manufacturing",
  },
  {
    name: "Shift",
    label: t("openjobs.label5"),
    field: "Shift",
    align: "center",
    sortable: true,
    icon: "event_repeat",
  },
  {
    name: "OperatorId1",
    label: t("openjobs.label6"),
    field: "OperatorId1",
    align: "center",
    sortable: true,
    icon: "badge",
  },
  {
    name: "FULL_NAME",
    label: t("openjobs.label7"),
    field: "FULL_NAME",
    align: "center",
    sortable: true,
    icon: "person",
  },
  {
    name: "StartTime",
    label: t("openjobs.label8"),
    field: "StartTime",
    align: "center",
    sortable: true,
    icon: "today",
  },
  {
    name: "TimeOpenFormatted",
    label: t("openjobs.label9"),
    field: "TimeOpenFormatted",
    align: "center",
    sortable: true,
    icon: "timer",
  },
  {
    name: "AlertType",
    label: t("openjobs.label10"),
    field: "AlertType",
    align: "center",
    sortable: true,
    icon: "warning",
  },
  {
    name: "StatusDescription",
    label: t("openjobs.label11"),
    field: "StatusDescription",
    align: "center",
    sortable: true,
    icon: "info",
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

// ⚠️ Alerta de confirmación antes de actualizar
const confirmUpdate = () => {
  $q.dialog({
    title: t("openjobs.updatedata"),
    message: t("openjobs.alertdata"),
    cancel: {
      label: t("openjobs.cancel"),
      color: "blue-grey-6",
      flat: true,
    },
    ok: {
      label: t("configuration.update"),
      color: "primary",
      unelevated: true,
    },
    persistent: true,
  }).onOk(() => {
    // Si el usuario confirma, entonces disparamos la carga
    loadData();
  });
};

const loadData = async () => {
  isLoading.value = true;
  await reportStore.fetchOpenJobs();

  // Guardar en localStorage como un string JSON
  localStorage.setItem(
    "openJobsData",
    JSON.stringify(reportStore.openJobsList)
  );

  // Actualizar la variable local que alimenta la tabla
  localJobsList.value = [...reportStore.openJobsList];

  lastUpdate.value = Date.now();
  localStorage.setItem("openJobsLastUpdate", lastUpdate.value);

  isLoading.value = false; // <-- indicar fin de carga
};

const initData = () => {
  const storedJobs = localStorage.getItem("openJobsData");
  const storedUpdate = localStorage.getItem("openJobsLastUpdate");

  if (storedJobs) {
    // Si hay datos en localStorage, los usamos para que la tabla no dependa de la DB
    localJobsList.value = JSON.parse(storedJobs);
    if (storedUpdate) {
      lastUpdate.value = parseInt(storedUpdate, 10);
    }
  } else {
    // Si es la primera vez que entra y no hay datos locales, forzamos la carga
    loadData();
  }
};

// --- CONTADORES PARA LOS BOTONES ---
const countTotal = computed(() => localJobsList.value.length);
const countEnProceso = computed(
  () =>
    localJobsList.value.filter((job) => job.AlertType === "EN PROCESO").length
);
const countProcesoLargo = computed(
  () =>
    localJobsList.value.filter((job) => job.AlertType === "PROCESO LARGO")
      .length
);
const countPausado = computed(
  () => localJobsList.value.filter((job) => job.AlertType === "PAUSADO").length
);

// --- FILTRADO DE LA TABLA ---
const filteredEvents = computed(() => {
  if (activeFilter.value === "TODOS") return localJobsList.value;
  return localJobsList.value.filter(
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

// Asigna el color al q-badge
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
    case "CERRADO":
      return "negative"; // Puedes usar 'grey' o 'blue-grey' si prefieres que el badge cerrado no sea rojo
    default:
      return "info";
  }
};

// Asigna la traducción correcta
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
      case "CERRADO":
        return t("openjobs.close"); // 🔥 AQUÍ AGREGAMOS LA TRADUCCIÓN
      default:
        return alertType;
    }
  };
});

// --- RELOJ Y FECHAS ---
const fechaFormateada = ref("");
const horaFormateada = ref("");
let intervaloId = null;
const zonaHorariaLabel = ref(""); // Asegúrate de declarar este ref() arriba

const mostrarHora = () => {
  const currentLang = localStorage.getItem("lang") || "es";
  const ahora = dayjs().tz("Europe/Warsaw").locale(currentLang);

  // Traducción de la etiqueta según el selector
  if (currentLang === "es") {
    zonaHorariaLabel.value = "Hora Polonia";
  } else if (currentLang === "pl") {
    zonaHorariaLabel.value = "Czas w Polsce"; // "Hora en Polonia" en polaco
  } else {
    zonaHorariaLabel.value = "Poland Time";
  }

  // Formatos de fecha por idioma
  if (currentLang === "es") {
    fechaFormateada.value = ahora.format("dddd D [de] MMMM [del] YYYY");
  } else if (currentLang === "pl") {
    // En polaco suele usarse: dddd, D MMMM YYYY
    fechaFormateada.value = ahora.format("dddd, D MMMM YYYY");
  } else {
    fechaFormateada.value = ahora.format("dddd D MMMM YYYY");
  }

  horaFormateada.value = ahora.format("hh:mm:ss A");
};

const formatSmartDate = (start, end = null, isStartTime = false) => {
  if (!start) return "-";

  const startDate = dayjs.utc(start);
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
  initData();
});

onUnmounted(() => {
  if (intervaloId) clearInterval(intervaloId);
});
</script>

<style scoped>
/* Estilo base del header */
:deep(.custom-header) {
  background-color: #003153 !important; /* El azul oscuro de tu imagen */
  color: white !important;
}

:deep(.custom-header th) {
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap !important; /* Evita que el texto se rompa */
}

/* FORZAR LA FLECHA A LA MISMA LÍNEA */
:deep(.downtime-qtable .q-th__content) {
  display: inline-flex !important; /* 🔥 CAMBIO IMPORTANTE */
  align-items: center !important;
  justify-content: center !important;
  flex-wrap: nowrap !important;
  width: 100%;
}

:deep(.downtime-qtable th) {
  white-space: nowrap !important;
}

:deep(.downtime-qtable .q-th__content > span) {
  white-space: nowrap !important;
}

/* Ajuste de la flecha de ordenamiento */
:deep(.downtime-qtable .q-table__sort-icon) {
  display: inline-block !important;
  vertical-align: middle;
  margin-left: 4px !important;
  color: white !important;
  opacity: 0.8;
  font-size: 16px !important;
}

/* --- FILAS CEBRA (CAMBIO A CELESTE) --- */
.downtime-qtable .custom-trackingrow:nth-child(even) {
  /* Opción A: Celeste muy suave (recomendado) */
  background-color: #e3f2fd !important;

  /* Opción B: Azul un poco más intenso (si prefieres que se note más) */
  /* background-color: #e1f5fe !important; */
}
.rounded-btn {
  border-radius: 10px;
  font-weight: bold;
  font-size: 12px;
  border: 2px solid white;
}

/* --- OVERLAY DE CARGA --- */
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
