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
      <div class="column items-center q-pb-md" style="padding-top: 60px">
        <img
          src="/img/AFL.png"
          style="width: 45px; height: 45px"
          class="q-mb-sm shadow-1 rounded-borders"
        />
        <div
          class="text-h6 text-weight-bolder text-primary text-uppercase tracking-widest"
        >
          {{ $t("app.title") }}
        </div>
        <span class="text-subtitle1 text-primary text-bold">
          <q-icon
            name="filter_alt"
            color="primary"
            size="28px"
            class="q-mr-xs"
          />
          {{ $t("configuration.drawerTitle") }}
        </span>
      </div>

      <q-separator inset spaced />

      <div class="q-px-md q-py-sm">
        <q-btn
          unelevated
          :label="$t('Reporte.update')"
          color="primary"
          icon="refresh"
          class="rounded-btn full-width shadow-1"
          @click="confirmUpdate"
          :loading="isLoading"
          :disable="isLoading"
        />
      </div>

      <q-separator inset spaced />

      <div class="q-pa-md q-gutter-y-sm">
        <div
          class="text-caption text-weight-bold text-primary text-center text-uppercase q-ml-xs"
        >
          {{ $t("openjobs.fill") }}
        </div>

        <q-card
          flat
          bordered
          v-ripple
          @click="activeFilter = 'TODOS'"
          class="status-card cursor-pointer"
          :class="
            activeFilter === 'TODOS' ? 'bg-blue-grey-2 shadow-2' : 'bg-white'
          "
          :style="
            activeFilter === 'TODOS'
              ? 'border-left: 6px solid var(--q-primary) !important'
              : 'border-left: 6px solid #e0e0e0'
          "
        >
          <q-card-section class="q-pa-sm flex items-center justify-between">
            <div class="text-subtitle2 text-bold text-primary">
              <q-icon name="list" size="20px" class="q-mr-xs" />
              {{ $t("openjobs.all") }}
            </div>
            <div class="text-h6 text-bold text-primary">{{ countTotal }}</div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          v-ripple
          @click="countEnProceso > 0 ? (activeFilter = 'EN PROCESO') : null"
          class="status-card"
          :class="[
            activeFilter === 'EN PROCESO' ? 'bg-green-1 shadow-2' : 'bg-white',
            countEnProceso > 0
              ? 'cursor-pointer'
              : 'opacity-50 cursor-not-allowed',
          ]"
          :style="
            activeFilter === 'EN PROCESO'
              ? 'border-left: 6px solid var(--q-positive) !important'
              : 'border-left: 6px solid #e0e0e0'
          "
        >
          <q-card-section class="q-pa-sm flex items-center justify-between">
            <div class="text-subtitle2 text-bold text-positive">
              <q-icon name="play_circle" size="20px" class="q-mr-xs" />
              {{ $t("openjobs.inprog") }}
            </div>
            <div class="text-h6 text-bold text-positive">
              {{ countEnProceso }}
            </div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          v-ripple
          @click="
            countProcesoLargo > 0 ? (activeFilter = 'PROCESO LARGO') : null
          "
          class="status-card"
          :class="[
            activeFilter === 'PROCESO LARGO'
              ? 'bg-red-1 shadow-3 pulse-alert'
              : 'bg-white',
            countProcesoLargo > 0
              ? 'cursor-pointer'
              : 'opacity-50 cursor-not-allowed',
          ]"
          :style="
            activeFilter === 'PROCESO LARGO'
              ? 'border-left: 6px solid var(--q-negative) !important'
              : 'border-left: 6px solid #e0e0e0'
          "
        >
          <q-card-section class="q-pa-sm flex items-center justify-between">
            <div class="text-subtitle2 text-bold text-negative">
              <q-icon name="report_problem" size="20px" class="q-mr-xs" />
              {{ $t("openjobs.longpro") }}
            </div>
            <div class="text-h6 text-bold text-negative">
              {{ countProcesoLargo }}
            </div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          v-ripple
          @click="countPausado > 0 ? (activeFilter = 'PAUSADO') : null"
          class="status-card"
          :class="[
            activeFilter === 'PAUSADO' ? 'bg-orange-1 shadow-2' : 'bg-white',
            countPausado > 0
              ? 'cursor-pointer'
              : 'opacity-50 cursor-not-allowed',
          ]"
          :style="
            activeFilter === 'PAUSADO'
              ? 'border-left: 6px solid #e65100 !important' /* orange-10 */
              : 'border-left: 6px solid #e0e0e0'
          "
        >
          <q-card-section class="q-pa-sm flex items-center justify-between">
            <div class="text-subtitle2 text-bold text-amber-9">
              <q-icon name="pause_circle" size="20px" class="q-mr-xs" />
              {{ $t("openjobs.pause") }}
            </div>
            <div class="text-h6 text-bold text-amber-9">{{ countPausado }}</div>
          </q-card-section>
        </q-card>
      </div>

      <q-space />

      <div class="q-pa-md column items-center">
        <div class="text-h4 text-weight-light text-primary">
          {{ horaFormateada }}
        </div>
        <div class="text-caption text-grey-7 text-uppercase text-capitalize">
          <q-icon name="event" class="q-mr-xs" />
          {{ fechaFormateada }}
        </div>
        <q-badge outline color="primary" class="q-mt-sm">
          <q-icon name="schedule" size="xs" class="q-mr-xs" />
          {{ zonaHorariaLabel }}
        </q-badge>
      </div>

      <q-separator spaced />

      <div
        class="q-pa-sm row justify-center items-center"
        style="min-height: 60px"
      >
        <LanguageToggle />
      </div>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <transition name="fade-overlay">
          <div v-if="isLoading" class="loading-overlay-relative">
            <div class="dual-ring-large"></div>
            <div class="loading-text">{{ $t("Downtimes.upload") }}</div>
          </div>
        </transition>
        <div class="row items-center justify-between q-mb-md header-container">
          <!-- IZQUIERDA: Logo + título -->
          <div class="row items-center q-gutter-md">
            <q-avatar square size="50px">
              <img src="/img/AFL.png" />
            </q-avatar>

            <div>
              <!-- TÍTULO -->
              <div class="text-h5 text-weight-bold text-primary">
                {{ $t("openjobs.title") }}
              </div>

              <!-- SUBTÍTULO -->
              <div class="text-subtitle2 text-grey-7">
                {{ $t("openjobs.subtitle") }}
              </div>
            </div>
          </div>

          <!-- DERECHA: info dinámica -->
          <div class="column items-end">
            <!-- Última actualización -->
            <div
              class="text-caption text-bold"
              :class="`text-${updateColorName}`"
            >
              {{ $t("hrxhr.update") }} {{ lastUpdateDisplay }}
            </div>

            <!-- Filtro activo -->
            <q-badge
              :color="
                activeFilter !== 'TODOS'
                  ? getAlertColor(activeFilter)
                  : updateColorName
              "
              class="q-mt-xs text-white text-weight-bold"
            >
              <template v-if="activeFilter !== 'TODOS'">
                {{ $t("openjobs.fill2") }} {{ activeFilterLabel }}
              </template>

              <template v-else>
                {{ hoursSinceUpdate }}
              </template>
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
            <q-tr
              :props="props"
              class="custom-trackingrow"
              :class="{
                'is-closed text-grey-6': props.row.AlertType === 'CERRADO',
              }"
            >
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'AlertType'">
                  <q-chip
                    :color="getAlertColor(col.value)"
                    text-color="white"
                    dense
                    rounded
                    class="text-bold q-px-sm q-py-xs"
                  >
                    <q-icon
                      :name="
                        col.value === 'PAUSADO'
                          ? 'pause_circle'
                          : col.value === 'EN PROCESO'
                          ? 'play_circle'
                          : 'warning'
                      "
                      size="16px"
                      class="q-mr-xs"
                    />
                    {{ getAlertTranslation(col.value) }}
                  </q-chip>
                </template>

                <template v-else-if="col.name === 'StationName'">
                  <q-chip
                    :color="getStationConfig(col.value).color"
                    text-color="white"
                    dense
                    rounded
                    outline
                    class="text-bold q-px-sm q-py-xs"
                  >
                    <q-icon
                      :name="getStationConfig(col.value).icon"
                      size="14px"
                      class="q-mr-xs"
                    />
                    {{ col.value }}
                  </q-chip>
                </template>

                <template v-else-if="col.name === 'Shift'">
                  <q-chip
                    :color="getShiftConfig(col.value).color"
                    text-color="white"
                    dense
                    rounded
                    outline
                    class="text-bold q-px-sm q-py-xs shadow-1"
                  >
                    <q-icon
                      :name="getShiftConfig(col.value).icon"
                      size="14px"
                      class="q-mr-xs"
                    />
                    {{ col.value }}
                  </q-chip>
                </template>

                <template v-else-if="col.name === 'TimeOpenFormatted'">
                  <span
                    v-if="props.row.AlertType === 'CERRADO'"
                    class="text-bold text-negative"
                  >
                    <q-icon name="stop_circle" class="q-mr-xs" />
                    {{ getAlertTranslation("CERRADO") }}
                  </span>

                  <span
                    v-else-if="props.row.AlertType === 'PAUSADO'"
                    class="text-bold text-amber-10"
                  >
                    <q-icon name="timer" class="q-mr-xs" />
                    {{ getLiveTime(col.value) }}
                  </span>

                  <span
                    v-else-if="props.row.AlertType === 'EN PROCESO'"
                    class="text-bold text-green-7"
                  >
                    <q-icon name="timer" class="q-mr-xs" />
                    {{ getLiveTime(col.value) }}
                  </span>

                  <span v-else class="text-bold text-primary">
                    <q-icon name="timer" class="q-mr-xs" />
                    {{ getLiveTime(col.value) }}
                  </span>
                </template>

                <template v-else-if="col.name === 'StatusDescription'">
                  <!-- Status = 1 -->
                  <q-chip
                    v-if="props.row.Status === 1"
                    outline
                    dense
                    clickable
                    :color="'primary'"
                    text-color="primary"
                    icon="stop"
                    class="text-bold q-px-sm q-py-xs"
                    @click="showendjobDialogFn(props.row)"
                  >
                    {{ $t("openjobs.endjob1") }}
                  </q-chip>

                  <!-- Otros Status -->
                  <q-chip
                    v-else
                    outline
                    dense
                    clickable
                    :color="
                      props.row.Status === 2 || col.value === 'CERRADO'
                        ? 'negative'
                        : props.row.Status === 4
                        ? 'amber-8'
                        : 'primary'
                    "
                    :text-color="
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
                    class="text-bold q-px-sm q-py-xs"
                    :disable="props.row.Status === 2 || col.value === 'CERRADO'"
                    @click="showpauseDialogFn(props.row)"
                  >
                    {{
                      props.row.Status === 2 || col.value === "CERRADO"
                        ? $t("openjobs.close")
                        : props.row.Status === 4
                        ? $t("openjobs.rewj")
                        : col.value
                    }}
                  </q-chip>
                </template>

                <template v-else-if="col.name === 'StartTime'">
                  <span
                    :class="[
                      'text-bold',
                      {
                        'text-negative': !dayjs
                          .utc(props.row.StartTime)
                          .local()
                          .isSame(dayjs(), 'day'),
                      },
                    ]"
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

        <q-dialog v-model="showUpdateDialog" persistent>
          <q-card style="min-width: 400px; border-radius: 12px">
            <q-card-section
              class="row items-center bg-primary text-white q-py-xs"
            >
              <img
                src="/img/AFL_Logo.svg"
                style="width: 1.8em; height: 1.8em; margin-right: 0.5em"
                class="q-mr-sm"
              />
              <q-icon name="refresh" size="2em" class="q-mr-xs" />
              <div class="text-h6 text-weight-medium">
                {{ $t("openjobs.updatedata") }}
              </div>
            </q-card-section>

            <q-card-section class="q-pt-md q-pb-md">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-icon name="info" color="primary" size="2.5em" />
                <div class="col">
                  <span class="text-body1 text-blue-grey-8">
                    {{ $t("openjobs.alertdata") }}
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
                icon="update"
                :label="$t('configuration.update')"
                color="primary"
                text-color="white"
                class="rounded-btn q-px-md"
                @click="executeDataUpdate"
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
import { ref, computed, onMounted, onUnmounted, h } from "vue";
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

const now = ref(new Date());

// Variable que guarda el filtro actual
const activeFilter = ref("TODOS");

// 🔥 Variables de tiempo (Unificadas)
const lastUpdate = ref(null);
const currentTime = ref(Date.now()); // Para el tiempo en vivo de la tabla

// 🧠 estado del dialog
const showpauseDialog = ref(false);
const showEndJobDialog = ref(false);
const selectedRow = ref(null);

// Valores del form
const connectorsA = ref(0);
const connectorsB = ref(0);
const cycleMinutes = ref(null);

// Valores originales de DB
const connectorsAFromDB = ref(null);
const connectorsBFromDB = ref(null);

// 🚀 abrir modal
const showpauseDialogFn = (row) => {
  selectedRow.value = row;
  showpauseDialog.value = true;
};

const getShiftConfig = (shift) => {
  if (["N1", "N4"].includes(shift)) {
    return { color: "light-blue-7", icon: "light_mode" };
  }
  if (["N2", "N3"].includes(shift)) {
    return { color: "indigo-10", icon: "dark_mode" };
  }
  return { color: "blue-grey-5", icon: "schedule" };
};

const getStationConfig = (station) => {
  if (!station) {
    return { color: "grey-5", icon: "help" };
  }
  const prefix = station.replace(/[0-9]/g, ""); // elimina números
  const map = {
    CUT: { color: "teal-6", icon: "content_cut" },
    PRP: { color: "cyan-7", icon: "build" },
    RBM: { color: "indigo-6", icon: "view_stream" },
    FBR: { color: "blue-7", icon: "cable" },
    LAS: { color: "red-6", icon: "flash_on" },
    POS: { color: "pink-6", icon: "auto_fix_high" },
    VSI: { color: "purple-5", icon: "visibility" },
    HDW: { color: "deep-orange-6", icon: "precision_manufacturing" },
    POL: { color: "amber-7", icon: "swap_horiz" },
    CRI: { color: "brown-6", icon: "construction" },
    OPT: { color: "light-blue-7", icon: "biotech" },
    PAK: { color: "green-6", icon: "inventory_2" },
    AUD: { color: "lime-7", icon: "fact_check" },
    INS: { color: "deep-purple-6", icon: "search" },
    TRM: { color: "blue-grey-7", icon: "power" },
  };
  return map[prefix] || { color: "grey-6", icon: "settings" };
};

// Abrir modal
const showendjobDialogFn = (row) => {
  console.log("🛑 End job clicked:", row);
  selectedRow.value = row;
  showEndJobDialog.value = true;

  connectorsAFromDB.value = row.ConnectorsA;
  connectorsBFromDB.value = row.ConnectorsB;
  connectorsA.value = row.ConnectorsA ?? 0;
  connectorsB.value = row.ConnectorsB ?? 0;
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
        localJobsList.value[index].Status = 1;
        localJobsList.value[index].AlertType = "EN PROCESO";
        localJobsList.value[index].StatusDescription = "EN PROCESO";
        localJobsList.value[index]._chipColor = "positive";
      } else {
        localJobsList.value[index].Status = 4;
        localJobsList.value[index].AlertType = "PAUSADO";
        localJobsList.value[index].StatusDescription = "PAUSADO";
        localJobsList.value[index]._chipColor = "amber-8";
      }

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
    // 🔥 AGREGADO: Capturamos los valores ingresados antes de que tu código los limpie a 0
    const capturedConnA =
      connectorsAFromDB.value === null ? Number(connectorsA.value) : null;
    const capturedConnB =
      connectorsBFromDB.value === null ? Number(connectorsB.value) : null;

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
      localJobsList.value[index].Status = 2;
      localJobsList.value[index].AlertType = "CERRADO";
      localJobsList.value[index].StatusDescription = "CERRADO";
      localJobsList.value[index]._chipColor = "negative";
      localJobsList.value[index]._isModifiedLocally = true;

      // 🔥 AGREGADO: Actualizamos los conectores en la lista local con los valores capturados
      if (capturedConnA !== null)
        localJobsList.value[index].ConnectorsA = capturedConnA;
      if (capturedConnB !== null)
        localJobsList.value[index].ConnectorsB = capturedConnB;

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

// 🔥 FUNCIÓN PARA CALCULAR EL TIEMPO EN VIVO (CON SEGUNDOS)
const getLiveTime = (minutesOpen) => {
  if (minutesOpen == null) return "-"; // Por si viene nulo

  // Tomamos el último update o el tiempo actual si por algo no existe
  const fetchTime = lastUpdate.value || Date.now();

  // Diferencia entre AHORA y cuando se descargó la data en milisegundos
  const elapsedMs = currentTime.value - fetchTime;

  // 1. En lugar de sacar minutos, sacamos los SEGUNDOS extra que han pasado
  const extraSeconds = Math.floor(elapsedMs / 1000);

  // 2. Convertimos los minutos de la DB a segundos y sumamos los extra
  const totalSeconds = minutesOpen * 60 + extraSeconds;

  // 3. Calculamos horas, minutos y segundos a partir del gran total
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  // 4. Formateamos los segundos con un "0" inicial si son menores a 10 (ej. "05s")
  const formattedSeconds = s.toString().padStart(2, "0");

  return `${h}h ${m}m ${formattedSeconds}s`;
};

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
    field: "MinutesOpen",
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
  if (!lastUpdate.value) return "--/--/---- --:--:--";

  // Usamos dayjs para forzar la visualización en la zona de Polonia
  // .tz("Europe/Warsaw") asegura que la hora mostrada sea la de allá
  return dayjs(lastUpdate.value)
    .tz("Europe/Warsaw")
    .format("DD/MM/YYYY, hh:mm:ss A");
});

const showUpdateDialog = ref(false);

const confirmUpdate = () => {
  showUpdateDialog.value = true;
};

const executeDataUpdate = () => {
  showUpdateDialog.value = false;
  loadData();
};

const loadData = async () => {
  isLoading.value = true;
  await reportStore.fetchOpenJobs();

  localStorage.setItem(
    "openJobsData",
    JSON.stringify(reportStore.openJobsList)
  );
  localJobsList.value = [...reportStore.openJobsList];

  lastUpdate.value = Date.now();
  localStorage.setItem("openJobsLastUpdate", lastUpdate.value);

  isLoading.value = false;
  pagination.value.page = 1;
  activeFilter.value = "TODOS";
};

const initData = () => {
  const storedJobs = localStorage.getItem("openJobsData");
  const storedUpdate = localStorage.getItem("openJobsLastUpdate");

  if (storedJobs) {
    localJobsList.value = JSON.parse(storedJobs);
    if (storedUpdate) {
      lastUpdate.value = parseInt(storedUpdate, 10);
    }
  } else {
    loadData();
  }
};

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

const filteredEvents = computed(() => {
  if (activeFilter.value === "TODOS") return localJobsList.value;
  return localJobsList.value.filter(
    (job) => job.AlertType === activeFilter.value
  );
});

const activeFilterLabel = computed(() => {
  switch (activeFilter.value) {
    case "PROCESO LARGO":
      return t("openjobs.longpro");
    case "RETRABAJO ABIERTO":
      return t("openjobs.rework");
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

// ✅ CORRECCIÓN APLICADA AQUÍ:
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
      return "negative";

    case "TODOS":
      // En lugar de "primary" fijo, usamos nuestra lógica de tiempo
      return updateColorName.value;

    default:
      return "info";
  }
};

// 1. Determina el color basado en la antigüedad (usado en texto y badges)
const updateColorName = computed(() => {
  if (!lastUpdate.value || !now.value) return "positive";

  const updatedDate = dayjs(lastUpdate.value);
  const diffInHours = now.value.diff(updatedDate, "hour", true);

  if (diffInHours >= 24) return "negative";
  if (diffInHours >= 12) return "amber-8";
  return "positive";
});

// 2. Calcula el texto relativo de horas transcurridas
const hoursSinceUpdate = computed(() => {
  if (!lastUpdate.value || !now.value) return "";

  // Convertimos la última actualización a objeto dayjs
  const updatedDate = dayjs(lastUpdate.value);

  // Calculamos la diferencia en horas usando el 'now' de Polonia
  // .diff(fecha, unidad, float)
  const diffInHours = Math.floor(now.value.diff(updatedDate, "hour", true));

  if (diffInHours < 1) {
    return t("openjobs.label12");
  } else {
    return `${t("openjobs.label13")} ${diffInHours} ${
      diffInHours === 1 ? t("openjobs.label14") : t("openjobs.label15")
    }`;
  }
});

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
        return t("openjobs.close");
      default:
        return alertType;
    }
  };
});

// --- RELOJ Y FECHAS ---
const fechaFormateada = ref("");
const horaFormateada = ref("");
let intervaloId = null;
const zonaHorariaLabel = ref("");

const mostrarHora = () => {
  // 🔥 APROVECHAMOS EL RELOJ PARA ACTUALIZAR LA TABLA TAMBIÉN
  currentTime.value = Date.now();

  const currentLang = localStorage.getItem("lang") || "es";
  const ahora = dayjs().tz("Europe/Warsaw").locale(currentLang);

  if (currentLang === "es") {
    zonaHorariaLabel.value = "Hora Polonia";
  } else if (currentLang === "pl") {
    zonaHorariaLabel.value = "Czas w Polsce";
  } else {
    zonaHorariaLabel.value = "Poland Time";
  }

  if (currentLang === "es") {
    fechaFormateada.value = ahora.format("dddd D [de] MMMM [del] YYYY");
  } else if (currentLang === "pl") {
    fechaFormateada.value = ahora.format("dddd, D MMMM YYYY");
  } else {
    fechaFormateada.value = ahora.format("dddd D MMMM YYYY");
  }

  horaFormateada.value = ahora.format("hh:mm:ss A");

  now.value = ahora;
};

// 3. Formato de fecha inteligente (usando el 'now' reactivo)
const formatSmartDate = (start, end = null, isStartTime = false) => {
  if (!start) return "-";
  const startDate = dayjs.utc(start);
  const endDate = end ? dayjs.utc(end).local() : null;
  const currentNow = dayjs(now.value); // Usamos la referencia reactiva

  if (isStartTime) {
    return startDate.isSame(currentNow, "day")
      ? startDate.format("hh:mm A")
      : startDate.format("DD/MM/YYYY hh:mm A");
  }
  if (!endDate) return "-";
  return endDate.isSame(currentNow, "day")
    ? endDate.format("hh:mm A")
    : endDate.format("DD/MM/YYYY hh:mm A");
};

onMounted(() => {
  mostrarHora();
  intervaloId = setInterval(mostrarHora, 1000); // Esto hace el pulso de 1 segundo
  initData();
});

onUnmounted(() => {
  if (intervaloId) clearInterval(intervaloId);
});
</script>

<style scoped>
/* Estilo base del header */
/* ============================= */
/* 🎨 HEADER */
/* ============================= */

:deep(.custom-header) {
  background-color: #003153 !important;
  color: white !important;
}

:deep(.custom-header th) {
  font-weight: bold;
  font-size: 13px;
  white-space: nowrap !important;
  text-align: center;
}

/* FORZAR CONTENIDO DEL HEADER EN UNA LÍNEA */
:deep(.downtime-qtable .q-th__content) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-wrap: nowrap !important;
  width: 100%;
}

/* Mantener headers compactos */
:deep(.downtime-qtable th) {
  white-space: nowrap !important;
}

/* Texto dentro del header */
:deep(.downtime-qtable .q-th__content > span) {
  white-space: nowrap !important;
}

/* Ícono de ordenamiento */
:deep(.downtime-qtable .q-table__sort-icon) {
  display: inline-block !important;
  vertical-align: middle;
  margin-left: 4px !important;
  color: white !important;
  opacity: 0.8;
  font-size: 16px !important;
}

/* ============================= */
/* 📏 TABLA RESPONSIVE */
/* ============================= */

/* Compactación general */
:deep(.downtime-qtable th),
:deep(.downtime-qtable td) {
  padding: 7px 4px !important;
  font-size: 13px;
}

/* Permitir corte de texto en celdas */
:deep(.downtime-qtable td) {
  word-break: break-word;
}

/* ============================= */
/* 🎨 FILAS */
/* ============================= */

/* Zebra */
.downtime-qtable .custom-trackingrow:nth-child(even) {
  background-color: #e3f2fd !important;
}

/* Hover SOLO para filas activas */
:deep(.downtime-qtable .custom-trackingrow:not(.is-closed):hover) {
  background-color: #bbdefb !important;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

/* Filas cerradas */
:deep(.downtime-qtable .custom-trackingrow.is-closed) {
  background-color: #ffebee !important;
}

/* Texto apagado en cerradas */
:deep(.downtime-qtable .custom-trackingrow.is-closed td) {
  color: #9e9e9e !important;
}

/* Separación tipo tarjetas */
:deep(.downtime-qtable tbody tr) {
  border-bottom: 6px solid #f5f5f5;
}

/* ============================= */
/* 📊 ALINEACIÓN INTELIGENTE */
/* ============================= */

/* Ajusta columnas específicas (ejemplo operador) */
:deep(.downtime-qtable th:nth-child(7)),
:deep(.downtime-qtable td:nth-child(7)) {
  text-align: left !important;
  padding-left: 10px !important;
}

/* ============================= */
/* ⏱️ TIEMPO ABIERTO (SLA VISUAL) */
/* ============================= */

.time-normal {
  color: #1976d2;
  font-weight: 500;
}

.time-warning {
  color: #f57c00;
  font-weight: 600;
}

.time-critical {
  color: #d32f2f;
  font-weight: 700;
}

/* ============================= */
/* ✨ ANIMACIÓN DE ACTUALIZACIÓN */
/* ============================= */

@keyframes fadeUpdate {
  from {
    background-color: #fff9c4;
  }
  to {
    background-color: transparent;
  }
}

.updated-row {
  animation: fadeUpdate 1s ease;
}
.rounded-btn {
  border-radius: 10px;
  font-weight: bold;
  font-size: 12px;
  border: 2px solid white;
}

.header-container {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

/* Transición suave para las cards */
.status-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 8px;
}

.status-card:hover:not(.cursor-not-allowed) {
  transform: translateX(5px);
  filter: brightness(0.98);
}

/* Animación de Pulso para Alertas Críticas */
.pulse-alert {
  animation: pulse-red 2.5s infinite;
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 0 0 0 rgba(193, 0, 21, 0.4);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(193, 0, 21, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(193, 0, 21, 0);
  }
}

/* Fuente Mono para que el reloj no salte */
.font-mono {
  font-family: "Courier New", Courier, monospace;
}

.tracking-widest {
  letter-spacing: 0.1em;
}
</style>
