<template>
  <q-layout view="lHh LpR lFf">
    <q-drawer
      side="left"
      show-if-above
      v-model="drawer"
      bordered
      :width="300"
      class="bg-blue-grey-1 column"
    >
      <q-list class="q-pt-xl">
        <!-- Título -->

        <div
          class="text-subtitle1 text-weight-bold text-grey-9 flex items-center justify-center q-mt-md"
        >
          <q-icon
            name="extension"
            color="primary"
            size="30px"
            class="q-mr-xs"
          />
          {{ $t("hrxhr.function1") }}
        </div>

        <!-- Botones principales -->
        <q-item clickable>
          <q-btn
            color="primary"
            :label="$t('hrxhr.label1')"
            icon="timer_off"
            class="rounded-btn full-width"
            @click="showModal = true"
            dense
          />
        </q-item>

        <q-item clickable>
          <q-btn
            color="green"
            :label="$t('hrxhr.label2')"
            icon="table_view"
            class="rounded-btn full-width"
            @click="exportarExcelConEstilo"
            dense
          />
        </q-item>

        <q-item clickable>
          <q-btn
            color="red-8"
            :label="$t('hrxhr.label3')"
            icon="picture_as_pdf"
            class="rounded-btn full-width"
            @click="exportToPdf"
            dense
          />
        </q-item>

        <q-item clickable>
          <q-btn
            color="orange-8"
            :label="$t('hrxhr.label4')"
            icon="show_chart"
            class="rounded-btn full-width"
            @click="mostrarGrafica = true"
            dense
          />
        </q-item>

        <q-separator spaced />
        <!-- Filtro por fecha -->
        <div
          class="text-subtitle1 text-weight-bold text-grey-9 flex items-center justify-center"
        >
          <q-icon
            name="calendar_month"
            color="primary"
            size="20px"
            class="q-mr-xs"
          />
          {{ $t("hrxhr.function2") }}
        </div>

        <div class="q-pt-none q-ml-xs">
          <q-date
            v-model="selectedDate"
            :navigation-min-year-month="'2024/10'"
            :navigation-max-year-month="todayYearMonth"
            :options="disableFutureDates"
            today-btn
            mask="YYYY-MM-DD"
            color="primary"
            class="full-width q-date-compact-final"
            @update:model-value="onDateSelected"
            minimal
          >
          </q-date>
        </div>

        <q-separator spaced />
        <div
          class="text-subtitle1 text-weight-bold text-grey-9 flex items-center justify-center"
        >
          <q-icon
            name="calculate"
            color="primary"
            size="30px"
            class="q-mr-xs"
          />
          {{ $t("hrxhr.function3") }}
        </div>

        <!-- Tipo de Conteo -->
        <div class="row justify-center">
          <q-btn-toggle
            v-model="selectedTipo"
            push
            toggle-color="primary"
            no-caps
            :options="[
              {
                label: $t('hrxhr.label5'),
                value: 'Jobs',
                icon: 'work',
                iconProps: { size: '20px' },
                class: 'flex items-center',
              },
              {
                label: $t('hrxhr.label6'),
                value: 'Conectores',
                icon: 'settings_input_component',
                iconProps: { size: '20px' },
                class: 'flex items-center',
              },
            ]"
            @update:model-value="loadReport"
          />
        </div>
      </q-list>
      <q-separator spaced />
      <div>
        <div class="contenedor-reloj">
          <div class="tiempo">
            <div class="fecha-ajustada text-bold">{{ fechaFormateada }}</div>
            <div class="reloj">{{ horaFormateada }}</div>
          </div>
        </div>
      </div>

      <div>
        <LanguageToggle />
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row items-center q-mb-lg justify-between">
          <div>
            <div class="row items-center text-h5 text-primary q-gutter-sm">
              <img
                src="/img/AFL.png"
                alt="Logo"
                style="height: 35px; border-radius: 4px"
              />
              <span
                >{{ $t("hrxhr.title") }} - {{ fechaDisplay }} - (
                {{
                  selectedTipo === "Conectores"
                    ? $t("hrxhr.label6")
                    : $t("hrxhr.label5")
                }}
                )
                <q-badge color="primary" outline class="text-h5"
                  >{{ $t("hrxhr.shift") }} {{ turno }}</q-badge
                >
              </span>
            </div>

            <div class="text-subtitle2 text-secondary">
              {{ $t("hrxhr.update") }} {{ lastUpdateDisplay }}
            </div>
          </div>
        </div>

        <!-- Modal Tabla Inactividad -->
        <q-dialog v-model="showModal">
          <q-card style="min-width: 800px">
            <div
              class="row items-center q-pa-sm text-white"
              style="background-color: #005670 !important"
            >
              <img
                src="/img/AFL_Logo.svg"
                style="width: 2.5em; height: 2.5em; margin-right: 2em"
                class="q-mr-sm"
              />
              <div class="text-h5">
                {{ $t("hrxhr.activity") }} {{ stationData.length }}
              </div>
            </div>

            <q-card-section>
              <!-- Encabezado fijo -->
              <div
                class="custom-downtime-table custom-trackingrow custom-header fixed-header"
              >
                <div class="trackinghead-cell stationtype-cell">
                  <q-icon name="category" /> {{ $t("hrxhr.type") }}
                </div>
                <div class="trackinghead-cell stationid-cell">
                  <q-icon name="memory" /> {{ $t("hrxhr.station") }}
                </div>
                <div class="trackinghead-cell stationid-cell">
                  <q-icon name="timeline" />{{ $t("hrxhr.line") }}
                </div>
                <div class="trackinghead-cell inactividad-cell">
                  <q-icon name="timer_off" /> {{ $t("hrxhr.inactive") }}
                </div>
              </div>

              <!-- Contenedor scrollable solo para los registros -->
              <div class="scrollable-table-container">
                <!-- Si no hay registros -->
                <div
                  v-if="stationData.length === 0"
                  class="custom-trackingrow text-center"
                >
                  <q-icon name="warning" size="lg" color="orange" />
                  <div
                    class="text-caption text-bold"
                    style="color: orange; font-size: 16px"
                  >
                    {{ $t("hrxhr.nodata") }}
                  </div>
                </div>

                <!-- Lista de registros -->
                <div v-else>
                  <div
                    v-for="(item, index) in stationDataSorted"
                    :key="index"
                    class="custom-trackingrow"
                  >
                    <div class="tracking-cell stationtype-cell">
                      <q-chip
                        square
                        color="primary"
                        text-color="white"
                        icon="category"
                      >
                        {{ item.stationtype }}
                      </q-chip>
                    </div>
                    <div class="tracking-cell turno-cell">
                      <q-badge
                        dense
                        color="primary"
                        outline
                        class="text-subtitle2"
                      >
                        {{ item.value }}
                      </q-badge>
                    </div>
                    <div class="tracking-cell turno-cell">
                      <q-badge
                        dense
                        color="primary"
                        outline
                        class="text-subtitle2"
                      >
                        {{ item.Linea }}
                      </q-badge>
                    </div>
                    <div class="tracking-cell inactividad-cell">
                      <q-chip
                        dense
                        :color="getColorByInactividad(item.InactivityTime)"
                        text-color="white"
                        icon="timer_off"
                      >
                        {{ item.InactivityTime }}
                      </q-chip>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="q-pa-sm items-center justify-between">
              <!-- Fecha a la izquierda -->

              <div
                class="fade-in"
                style="
                  color: darkslategray;
                  font-weight: bold;
                  font-size: 20px;
                  background-color: #f9f9f9;
                  padding: 10px 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                  text-align: center;
                "
              >
                📅 {{ fechaHora }}
              </div>

              <!-- Botón a la derecha -->
              <q-btn
                flat
                label="Cerrar"
                color="white"
                style="background-color: red"
                class="rounded-btn"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <div
          v-for="(tabla, linea) in tablasPorLinea"
          :key="linea"
          class="q-mb-xl"
        >
          <div class="row custom-header">
            <img
              src="/img/AFL_Logo.svg"
              style="
                width: 2.5em;
                height: 2.5em;
                margin-right: 0.5em;
                border-radius: 8px;
              "
              class="q-mr-sm"
              alt="Logo de AFL"
            />
            <div class="text-h5 q-mb-sm">
              {{ linea }} - {{ fechaDisplay }} (
              {{
                selectedTipo === "Conectores"
                  ? $t("hrxhr.label6")
                  : $t("hrxhr.label5")
              }}
              )
            </div>
          </div>

          <div class="table-responsive-wrapper">
            <q-table
              :rows="tabla"
              :columns="columnas"
              row-key="Station"
              dense
              bordered
              flat
              :pagination="{ rowsPerPage: 0 }"
              class="modern-table"
              :rows-per-page-options="[]"
              hide-bottom
            >
              <template v-slot:no-data="{ icon, message, filter }">
                <div
                  class="full-width row flex-center text-red-8 q-gutter-sm q-pa-md"
                >
                  <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                  <span class="text-h6 text-bold">{{ message }}</span>
                  <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
                </div>
              </template>
              <template v-slot:bottom-row>
                <q-tr class="text-bold total-row-separator">
                  <q-td
                    key="Station"
                    style="font-size: 14px !important; font-weight: bold"
                  >
                    {{ $t("hrxhr.total") }}
                  </q-td>

                  <q-td
                    v-for="col in columnas.slice(1)"
                    :key="col.name"
                    class="text-center"
                    :style="[col.style, { 'font-size': '14px !important' }]"
                  >
                    {{ getTotalesPorHora(tabla)[col.name] || 0 }}
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
        <!-- Modal -->

        <div
          v-if="mostrarGrafica"
          class="modal-overlay"
          @click.self="mostrarGrafica = false"
        >
          <div
            class="modal-content"
            style="
              max-width: 1000px;
              width: 90%;
              max-height: 90vh;
              overflow: hidden;
              position: relative;
            "
          >
            <!-- Contenedor del encabezado -->
            <div
              class="modal-header"
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1em;
              "
            >
              <!-- Imagen izquierda -->
              <img
                src="/img/AFL.png"
                style="width: 3em; height: 4em; margin-right: 0.5em"
              />

              <!-- Título centrado -->
              <h2
                style="
                  flex-grow: 1;
                  text-align: center;
                  font-size: 2.5em;
                  font-weight: bold;
                  margin: 0;
                "
              >
                {{ $t("hrxhr.capture") }}
              </h2>

              <!-- Botón cerrar derecha -->
              <button
                class="cerrar-btn"
                @click="mostrarGrafica = false"
                style="background: none; border: none; cursor: pointer"
              >
                <i class="material-icons" style="font-size: 36px; color: red">
                  {{ $t("hrxhr.cancel") }}
                </i>
              </button>
            </div>

            <!-- Botones para moverse entre gráficas -->
            <button class="scroll-btn left" @click="scrollLeft">
              <i class="material-icons" style="font-size: 36px"
                >keyboard_double_arrow_left</i
              >
            </button>
            <button class="scroll-btn right" @click="scrollRight">
              <i class="material-icons" style="font-size: 36px"
                >keyboard_double_arrow_right</i
              >
            </button>

            <div ref="scrollContainer" class="grafica-scroll-container">
              <div class="grafica-slide">
                <div id="grafica-capturas-linea1" class="grafica-box"></div>
              </div>
              <!--  <div class="grafica-slide">
            <div id="grafica-capturas-linea2" class="grafica-box"></div>
          </div>
          <div class="grafica-slide">
            <div id="grafica-capturas-retrabajo" class="grafica-box"></div>
          </div> -->
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  computed,
  watch,
  defineComponent,
} from "vue"; // Asegúrate de importar 'watch'
import { useQuasar, date } from "quasar";
import axios from "axios";

// Aquí agregas la importación del Storage
import { useReportStore } from "src/stores/ReportStore";

//Traducciones
import LanguageToggle from "src/components/LanguageToggle.vue";
import { useI18n } from "vue-i18n";

import qEn from "quasar/lang/en-US";
import qEs from "quasar/lang/es";
import qPl from "quasar/lang/pl";

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

//Graficador
import Highcharts from "highcharts";
import HighchartsVue from "highcharts-vue";

// Importaciones para exportación
import * as XLSX from "xlsx";
window.XLSX = XLSX; // necesario para alasql
import XlsxPopulate from "xlsx-populate/browser/xlsx-populate";

import { saveAs } from "file-saver";

import alasql from "alasql";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/es"; // Cargar español
import "dayjs/locale/en"; // Cargar inglés
import "dayjs/locale/pl"; // Cargar polaco
import localeData from "dayjs/plugin/localeData"; // Permite usar .locale()
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
// Establecer idioma globalmente
dayjs.locale("es");

const fechaFormateada = ref("");
const horaFormateada = ref("");

const $q = useQuasar();
const reportStore = useReportStore(); // Agrega esta línea

const drawer = ref(true); // <<-- ¡Agrega esta línea!

//Variables para filtros

const selectedTipo = ref("Jobs"); // Agrega esta línea para el tipo de conteo

const mostrarGrafica = ref(false);
const scrollContainer = ref(null);

const tablasPorLinea = ref({});
const columnas = ref([]);

const lastUpdate = ref(null);

const qDateProxy = ref(null);
const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
const selectedDate = ref(today); // Si es null, se entiende como 'hoy' para el display

const showModal = ref(false);
const fechaHora = ref("");
const stationData = ref([]);
const loading = ref(false);

const columns = [
  {
    name: "stationtype",
    label: "Tipo de Estación",
    field: "stationtype",
    align: "left",
  },
  { name: "value", label: "ID", field: "value", align: "left" },
  {
    name: "TiempoInactividad",
    label: "Tiempo de Inactividad",
    field: "TiempoInactividad",
    align: "left",
  },
];

// ✅ función que deshabilita días mayores a hoy
const disableFutureDates = (date) => {
  // QDate pasa 'YYYY/MM/DD', así que normalizamos
  const formatted = date.replace(/\//g, "-");
  return formatted <= today;
};

const stationDataSorted = computed(() => {
  return [...stationData.value].sort((a, b) => {
    if (a.Linea < b.Linea) return -1;
    if (a.Linea > b.Linea) return 1;
    return 0;
  });
});

function actualizarFechaHora() {
  const ahora = new Date();

  const fechaRaw = ahora.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fecha = fechaRaw.charAt(0).toUpperCase() + fechaRaw.slice(1);

  const hora = ahora.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  fechaHora.value = `${fecha} — ${hora}`;
}

const mostrarHora = () => {
  // 1. Obtener el idioma de localStorage o usar 'es' como predeterminado
  const currentLang = localStorage.getItem("lang") || "es";

  // 2. Configurar el idioma (locale) para la instancia actual de Day.js
  const ahora = dayjs().locale(currentLang);

  if (currentLang === "es") {
    fechaFormateada.value = ahora.format("dddd D [de] MMMM [del] YYYY");
  } else {
    fechaFormateada.value = ahora.format("dddd D MMMM YYYY"); // Ej: Monday 4 December 2025
  }

  horaFormateada.value = ahora.format("hh:mm:ss A");

  // Si quieres 12h:
  // horaFormateada.value = ahora.format("hh:mm:ss A");
  // horaFormateada.value = ahora.format("HH:mm:ss"); // Forzamos 24h para consistencia global
};
let intervaloId = null;

// --- Helper para obtener la fecha de hoy en formato YYYY-MM-DD ---
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- Propiedad computada para determinar si se debe refrescar automáticamente ---
const shouldAutoRefresh = computed(() => {
  // Si selectedDate.value es null, significa que el usuario no ha seleccionado una fecha específica,
  // por lo tanto, se está viendo el reporte de hoy.
  if (selectedDate.value === null) {
    return true;
  }
  // Si selectedDate.value no es null, comparamos con la fecha de hoy.
  return selectedDate.value === getTodayDateString();
});

// Limitante fecha para Qdate
const todayYearMonth = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}/${month}`;
});

// Display de fecha en texto largo
const fechaDisplay = computed(() => {
  // Definimos los códigos de región para que el formato sea exacto
  const localesMap = {
    es: "es-MX",
    en: "en-US",
    pl: "pl-PL",
  };

  // Obtenemos el código correspondiente o usamos el valor de locale directamente
  const currentLocale = localesMap[locale.value] || locale.value;

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (!selectedDate.value) {
    return new Date().toLocaleDateString(currentLocale, options);
  }

  const [y, m, d] = selectedDate.value.split("-");
  // Nota: m - 1 porque los meses en JS van de 0 a 11
  return new Date(y, m - 1, d).toLocaleDateString(currentLocale, options);
});

const lastUpdateDisplay = computed(() => {
  return lastUpdate.value
    ? new Date(lastUpdate.value).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";
});

const clearDate = () => {
  selectedDate.value = "";
  loadReport();
};

const turno = ref("");
let refreshInterval = null; // Cambiado a 'let' ya que su valor cambiará (ID del intervalo)

// --- Funcion Exporta a PDF ---
async function exportToPdf() {
  try {
    const fecha = selectedDate.value;
    const tipo = selectedTipo.value || "Jobs";

    // Obtener los datos directamente del store
    const data = await reportStore.ReporteTurnos(fecha, tipo);

    if (!data || data.length === 0) {
      $q.notify({
        type: "warning",
        message: "No hay datos para exportar a PDF.",
      });
      return;
    }

    // Mostrar loading
    if ($q.loading) {
      $q.loading.show({ message: "Generando PDF..." });
    }

    // Agrupar datos por línea
    const tablasPorLineaLocal = {};
    data.forEach((row) => {
      const linea = row.Linea || "Desconocido";
      if (!tablasPorLineaLocal[linea]) {
        tablasPorLineaLocal[linea] = [];
      }
      tablasPorLineaLocal[linea].push(row);
    });

    // Preparar el canvas
    const pdfElement = document.querySelector(".q-page");
    const tableWrappers = document.querySelectorAll(
      ".table-responsive-wrapper"
    );
    tableWrappers.forEach((el) => (el.style.overflow = "visible"));

    const canvas = await html2canvas(pdfElement, {
      scale: 1, // 🔹 menor resolución
      useCORS: true,
      logging: false,
    });

    // Convertir a JPEG con compresión
    const imgData = canvas.toDataURL("image/jpeg", 0.6); // 🔹 calidad 60%

    const pdf = new jsPDF("l", "mm", "letter");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

    const nombreArchivo = `Reporte_${tipo}_${fechaDisplay.value}.pdf`;
    pdf.save(nombreArchivo);

    tableWrappers.forEach((el) => (el.style.overflowX = "auto"));

    $q.notify({
      type: "positive",
      message: "Reporte PDF exportado correctamente.",
    });
  } catch (error) {
    console.error("Error al exportar a PDF:", error);
    $q.notify({
      type: "negative",
      message: "Error al exportar a PDF.",
    });
  } finally {
    if ($q.loading) {
      $q.loading.hide();
    }
  }
}

//funcion importar a excel
async function exportarExcelConEstilo() {
  try {
    const fecha = selectedDate.value;
    const tipo = selectedTipo.value || "Jobs";

    // 1. Obtener los datos directamente del store.
    const data = await reportStore.ReporteTurnos(fecha, tipo);

    // 2. Procesar los datos para la exportación.
    if (!data || data.length === 0) {
      $q.notify({
        type: "warning",
        message:
          "No hay datos para exportar. Por favor, genere un reporte primero.",
      });
      return;
    }

    if ($q.loading) {
      $q.loading.show({ message: "Generando Excel..." });
    }

    // Procesar los datos para agrupar por línea, como lo hace loadReport()
    const tablasPorLineaLocal = {};
    data.forEach((row) => {
      const linea = row.Linea || "Desconocido";
      if (!tablasPorLineaLocal[linea]) {
        tablasPorLineaLocal[linea] = [];
      }
      tablasPorLineaLocal[linea].push(row);
    });

    // Tu código para XlsxPopulate seguirá funcionando con esta nueva variable
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0).name("Reporte Consolidado");
    const columnasOrdenadas = columnas.value.map((col) => col.name);
    const encabezados = columnas.value.map((col) => col.label);
    let currentRow = 1;

    const aplicarEstiloCelda = (cell, estilo) => {
      cell.style({ fontSize: 10, ...estilo });
    };

    // Título general al inicio de la hoja
    const titulo = `AFL | MES Monterrey | Reporte de ${tipo} por Turno - ${fechaDisplay.value}`;
    const tituloRange = sheet.range(
      currentRow,
      1,
      currentRow,
      columnasOrdenadas.length
    );
    tituloRange.merged(true);
    const tituloCell = sheet.cell(currentRow, 1);
    tituloCell.value(titulo);
    aplicarEstiloCelda(tituloCell, {
      bold: true,
      fontSize: 20,
      horizontalAlignment: "center",
      fontColor: "0000FF",
    });

    //Fecha de creacion del archivo
    const fechaGeneracion = new Date().toLocaleString();
    const celdaFecha = sheet.cell(2, 1);
    celdaFecha.value(`Generado: ${fechaGeneracion}`);
    celdaFecha.style({
      bold: true,
      horizontalAlignment: "left",
      fontSize: 10,
    });

    currentRow += 2;

    for (const [nombreHoja, filas] of Object.entries(tablasPorLineaLocal)) {
      const subtituloCell = sheet.cell(currentRow, 1);
      subtituloCell.value(`${nombreHoja}`);
      aplicarEstiloCelda(subtituloCell, {
        bold: true,
        fontSize: 14,
        fontColor: "0000FF",
        horizontalAlignment: "left",
      });
      currentRow += 1;

      // ... el resto de tu código de la función sigue igual,
      // solo asegúrate de usar 'filas' y 'tablasPorLineaLocal'
      // en lugar de las variables de Vue.

      // Encabezados
      encabezados.forEach((label, i) => {
        const cell = sheet.cell(currentRow, i + 1);
        cell.value(label);
        aplicarEstiloCelda(cell, {
          bold: true,
          fill: "0000FF",
          fontColor: "FFFFFF",
          horizontalAlignment: "center",
          border: true,
        });
      });

      // Datos
      filas.forEach((fila, rowIndex) => {
        columnasOrdenadas.forEach((col, colIndex) => {
          const cell = sheet.cell(currentRow + rowIndex + 1, colIndex + 1);
          let valor = fila[col] ?? "";

          if (!isNaN(valor) && valor !== "") {
            valor = Number(valor);
          }

          cell.value(valor);
          aplicarEstiloCelda(cell, {
            border: true,
            horizontalAlignment: "center",
          });
        });
      });

      // Totales
      const totalRowIndex = currentRow + filas.length + 1;
      const totalLabelCell = sheet.cell(totalRowIndex, 1);
      totalLabelCell.value("TOTAL");
      aplicarEstiloCelda(totalLabelCell, {
        bold: true,
        horizontalAlignment: "center",
        border: {
          top: { style: "double", color: "000000" },
          bottom: { style: "double", color: "000000" },
        },
        fill: "0000FF",
        fontColor: "FFFFFF",
      });

      const totales = getTotalesPorHora(filas);
      columnasOrdenadas.slice(1).forEach((col, colIndex) => {
        const cell = sheet.cell(totalRowIndex, colIndex + 2);
        cell.value(totales[col] ?? 0);
        aplicarEstiloCelda(cell, {
          bold: true,
          border: {
            top: { style: "double", color: "000000" },
            bottom: { style: "double", color: "000000" },
          },
          horizontalAlignment: "center",
          fill: "0000FF",
          fontColor: "FFFFFF",
        });
      });

      const allRows = [
        encabezados,
        ...filas.map((fila) =>
          columnasOrdenadas.map((col) => String(fila[col] ?? ""))
        ),
        columnasOrdenadas.map((col) => String(totales[col] ?? "")),
      ];

      columnasOrdenadas.forEach((col, colIndex) => {
        const maxLength = allRows.reduce((max, row) => {
          const len = row[colIndex]?.length || 0;
          return Math.max(max, len);
        }, 0);
        sheet.column(colIndex + 1).width(maxLength + 2);
      });

      currentRow = totalRowIndex + 3; // Separación de 3 filas
    }

    const fechaArchivo =
      fechaDisplay.value || new Date().toISOString().slice(0, 10);
    const blob = await workbook.outputAsync();
    saveAs(new Blob([blob]), `Reporte_Turnos_${tipo}_${fechaArchivo}.xlsx`);

    $q.notify({
      type: "positive",
      message: "Excel exportado correctamente.",
    });
  } catch (error) {
    console.error("Error al exportar Excel:", error);
    $q.notify({
      type: "negative",
      message: "Error al exportar Excel.",
    });
  } finally {
    if ($q.loading) {
      // Validación de que el objeto existe antes de llamar a hide()
      $q.loading.hide();
    }
  }
}

//funcion de prueba de graficos
async function renderGraficaCapturasPorLinea(
  nombreLinea,
  contenedorID,
  fecha = selectedDate.value,
  tipo = selectedTipo.value
) {
  try {
    // Normaliza valores antes de mandar al store
    const fechaFinal = fecha || null;
    const tipoFinal = tipo || "Jobs";

    console.log(
      "📌 renderGraficaCapturasPorLinea -> fecha:",
      fechaFinal,
      "tipo:",
      tipoFinal
    );

    // Llamada al store con los valores normalizados
    const data = await reportStore.ReporteCapturas(fechaFinal, tipoFinal);

    console.log("📥 Data recibida en gráfica:", data);

    const contenedor = document.getElementById(contenedorID);
    if (!contenedor) {
      console.warn(`Contenedor no encontrado: ${contenedorID}`);
      return;
    }

    // Filtra los datos por la línea específica
    const dataFiltrada = data.filter((d) => d.Linea === nombreLinea);

    // Muestra un mensaje si no hay datos para la línea
    if (dataFiltrada.length === 0) {
      contenedor.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #666; text-align: center;">
          <img src="/img/warning-icon.png" alt="Sin datos" style="width: 48px; height: 48px; opacity: 0.7; margin-bottom: 10px;" />
          <p style="font-size: 1rem;">
            No hay datos para mostrar en <strong>${nombreLinea} </strong>.
          </p>
        </div>
      `;
      return;
    }

    // Extrae estaciones únicas y turnos únicos
    const estaciones = [...new Set(dataFiltrada.map((d) => d.station))];
    const turnos = [...new Set(dataFiltrada.map((d) => d.Turno))];

    // Calcula los totales de capturas por estación para ordenar
    const capturasPorEstacion = estaciones.map((estacion) => {
      const totalCapturas = dataFiltrada
        .filter((d) => d.station === estacion)
        .reduce((acc, cur) => acc + (cur.Capturas || 0), 0);
      return { estacion, totalCapturas };
    });

    capturasPorEstacion.sort((a, b) => b.totalCapturas - a.totalCapturas);
    const estacionesOrdenadas = capturasPorEstacion.map((e) => e.estacion);

    // Calcula los totales por turno para el subtítulo
    const totalesPorTurno = turnos.map((turno) => {
      return {
        turno,
        total: dataFiltrada
          .filter((d) => d.Turno === turno)
          .reduce((acc, cur) => acc + (cur.Capturas || 0), 0),
      };
    });

    const subtitleText = totalesPorTurno
      .map((t) => `${t.turno}: ${t.total}`)
      .join(" | ");

    // Prepara las series de datos para Highcharts
    const series = turnos.map((turno) => ({
      name: turno,
      data: estacionesOrdenadas.map((estacion) => {
        const fila = dataFiltrada.find(
          (d) => d.station === estacion && d.Turno === turno
        );
        return fila ? fila.Capturas : 0;
      }),
      dataLabels: {
        enabled: true,
        inside: false,
        formatter: function () {
          return this.y > 0 ? this.y : "";
        },
        style: {
          fontWeight: "bold",
          color: "#000",
          textOutline: "none",
        },
      },
    }));

    // Renderiza la gráfica de Highcharts
    Highcharts.chart(contenedorID, {
      chart: { type: "column", zoomType: "x" },
      title: {
        useHTML: true,
        text: `
    <div style="display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 1.2rem; color: #333;">
      <img src="/img/AFL.png" alt="Logo" style="height: 28px; border-radius: 4px;" />
      <span>${nombreLinea} - ${fechaDisplay.value} (${
          selectedTipo.value === "Conectores"
            ? "Puntas"
            : selectedTipo.value || "Jobs"
        })</span>
    </div>
  `,
      },

      subtitle: { text: `Totales por turno: ${subtitleText}` },
      accessibility: {
        enabled: false,
      },
      xAxis: {
        categories: estacionesOrdenadas,
        title: { text: "Estaciones" },
        labels: { rotation: -45 },
      },
      yAxis: {
        min: 0,
        title: { text: "Número de Capturas" },
      },
      tooltip: {
        shared: true,
        valueSuffix: " capturas",
      },
      plotOptions: {
        column: {
          grouping: true,
          shadow: false,
          dataLabels: {
            enabled: true,
            style: {
              fontWeight: "bold",
              color: "#000",
              textOutline: "none",
            },
          },
        },
      },
      series,
      credits: {
        enabled: false,
      },
    });
  } catch (error) {
    console.error(`Error al graficar ${nombreLinea}:`, error);
    console.error("Error en renderGraficaCapturasPorLinea:", error);
  }
}

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: -scrollAmount(),
      behavior: "smooth",
    });
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: scrollAmount(),
      behavior: "smooth",
    });
  }
}

function scrollAmount() {
  // Puedes ajustar este valor según el ancho de tus gráficas
  return scrollContainer.value.offsetWidth * 0.95;
}

function getTotalesPorHora(tabla) {
  const totales = {};

  columnas.value.forEach((col) => {
    const isHora = /^\d{2}$/.test(col.name);
    const isTotalCol = [
      "Total Turno Dia",
      "Total Turno Noche",
      "Total",
    ].includes(col.name);

    if (isHora || isTotalCol) {
      totales[col.name] = tabla.reduce((sum, row) => {
        const val = parseInt(row[col.name]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    }
  });

  return totales;
}

/** Procesa los datos retornados para agrupar por línea y configurar columnas */
function processData(data) {
  // Determina turno según día
  // Usa selectedDate.value para la fecha base, o new Date() si es null (para el reporte de hoy)
  const baseDateForShift = selectedDate.value
    ? new Date(selectedDate.value + "T00:00:00")
    : new Date();
  const diaSemana = baseDateForShift.getDay(); // 0 = Domingo, ..., 6 = Sábado
  const esFinDeSemana = [0, 5, 6].includes(diaSemana); // Domingo, Viernes, Sábado
  turno.value = esFinDeSemana ? `N2/N4` : `N1/N3`;

  // Etiquetas de totales
  let labelTotalDia = esFinDeSemana ? "Total N2" : "Total N1";
  let labelTotalNoche = esFinDeSemana ? "Total N4" : "Total N3";

  // Agrupar por línea
  const agrupado = { "Project One": [] };
  data.forEach((row) => {
    const linea = row.Linea || "Desconocido";
    if (agrupado[linea]) agrupado[linea].push(row);
  });
  tablasPorLinea.value = agrupado;

  // Columnas dinámicas
  const ejemplo = data[0] || {};
  const horasDisponibles = Object.keys(ejemplo).filter((k) =>
    /^\d{2}$/.test(k)
  );

  const horasDiaArr = [
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
  ];
  const horasNocheArr = [
    "19",
    "20",
    "21",
    "22",
    "23",
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
  ];

  const columnasHorasDia = horasDiaArr
    .filter((h) => horasDisponibles.includes(h))
    .map((h) => ({
      name: h,
      label: `${h}:00`,
      field: h,
      align: "center",
      headerStyle:
        "font-weight:bold; border-bottom: 2px solid grey !important;",
      headerClasses: "custom-header ",
    }));
  const columnasHorasNoche = horasNocheArr
    .filter((h) => horasDisponibles.includes(h))
    .map((h) => ({
      name: h,
      label: `${h}:00`,
      field: h,
      align: "center",
      headerStyle:
        "font-weight:bold; border-bottom: 2px solid grey !important;",
      headerClasses: "custom-header",
    }));

  columnas.value = [
    {
      name: "Area",
      label: "Area",
      field: "Description",
      align: "center",
      headerStyle:
        "font-weight:bold; border-bottom: 2px solid grey !important;",
      headerClasses: "custom-header",
    },
    {
      name: "Station",
      label: "Estación",
      field: "Station",
      align: "center",
      headerStyle:
        "font-weight:bold; border-bottom: 2px solid grey !important;",
      headerClasses: "custom-header",
    },
    ...columnasHorasDia,
    {
      name: "Total Turno Dia",
      label: labelTotalDia,
      field: "Total Turno Dia",
      align: "center",
      style: "font-weight:bold;background-color:#e0e0e0;",
      headerStyle:
        "font-weight:bold;background-color:#e0e0e0;border-bottom: 2px solid grey !important;",
      headerClasses: "custom-header",
    },
    ...columnasHorasNoche,
    {
      name: "Total Turno Noche",
      label: labelTotalNoche,
      field: "Total Turno Noche",
      align: "center",
      style: "font-weight:bold;background-color:#e0e0e0;",
      headerStyle:
        "font-weight:bold;background-color:#e0e0e0;border-bottom: 2px solid grey !important;",
      headerClasses: "custom-header",
    },
    {
      name: "Total",
      label: "Total Diario",
      field: "Total",
      align: "center",
      style: "font-weight:bolder;background-color:#9e9e9e;color:white;",
      headerStyle:
        "font-weight:bolder;background-color:#9e9e9e;color:white;border-bottom: 2px solid grey !important;",
      headerClasses: "custom-header",
    },
  ];
}

function startAutoRefresh() {
  if (refreshInterval === null) {
    // Solo iniciar si no está ya corriendo
    refreshInterval = setInterval(loadReport, 300000); // 5 minutos
    console.log(
      `Refresco automático iniciado a las ${new Date().toLocaleTimeString()} (cada 5 minutos)`
    );
  }
}

function stopAutoRefresh() {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log("Refresco automático detenido");
  }
}

function onDateSelected(val) {
  // Llama a tu loadReport
  loadReport();

  // Cierra el popup solo al seleccionar fecha (no al navegar meses)
  qDateProxy.value?.hide();
}

/** Carga el reporte: fetch + process + update timestamp */
async function loadReport() {
  try {
    // Establece 'Jobs' como valor por defecto si selectedTipo es nulo o vacío
    const tipo = selectedTipo.value || "Jobs";

    // Si la fecha es null, se cargará el reporte de hoy, como lo hace tu SP
    const fecha = selectedDate.value;

    if ($q.loading) {
      $q.loading.show({ message: "Cargando reporte..." });
    }

    // Llama al store con la fecha y el tipo de conteo (con el valor por defecto)
    const data = await reportStore.ReporteTurnos(fecha, tipo);

    if (!data || data.length === 0) {
      $q.notify({
        type: "warning",
        message: "No se encontraron datos para la fecha y tipo seleccionados.",
      });
      tablasPorLinea.value = {};
    } else {
      processData(data);
    }
    lastUpdate.value = Date.now();
  } catch (error) {
    console.error("Error al cargar el reporte de turnos:", error);
    $q.notify({
      type: "negative",
      message: "Error al cargar el reporte. Inténtalo de nuevo.",
    });
    tablasPorLinea.value = {};
  } finally {
    if ($q.loading) {
      $q.loading.hide();
    }
  }
}

function getColorByInactividad(tiempoStr) {
  // 1. Validamos que exista el dato y que sea un texto
  if (!tiempoStr || typeof tiempoStr !== "string") {
    return "grey-4"; // Retorna un color neutro si no hay datos
  }

  let dias = 0,
    horas = 0,
    minutos = 0;

  // 2. Ahora sí podemos usar .match con seguridad
  const diaMatch = tiempoStr.match(/(\d+)\s*d[ií]a[s]?/i);
  const horaMatch = tiempoStr.match(/(\d+)\s*h[rs]+/i);
  const minutoMatch = tiempoStr.match(/(\d+)\s*min/i);

  if (diaMatch) dias = parseInt(diaMatch[1]);
  if (horaMatch) horas = parseInt(horaMatch[1]);
  if (minutoMatch) minutos = parseInt(minutoMatch[1]);

  const totalMinutos = dias * 24 * 60 + horas * 60 + minutos;

  if (totalMinutos > 1440) {
    return "red-5"; // más de 24 horas
  } else if (totalMinutos > 720) {
    return "amber-8"; // entre 12 y 24 horas
  } else {
    return "green-6"; // 12 horas o menos
  }
}

// --- Lifecycle Hooks ---
onMounted(() => {
  loadReport(); // Carga inicial de los datos
  mostrarHora();
  intervaloId = setInterval(mostrarHora, 1000);
  // Iniciar el refresco automático si la condición lo permite desde el inicio
  if (shouldAutoRefresh.value) {
    startAutoRefresh();
  }
});

onUnmounted(() => {
  clearInterval(intervaloId);
});

// --- Watcher para shouldAutoRefresh ---
// Este watcher reaccionará cada vez que shouldAutoRefresh cambie de true a false o viceversa
watch(shouldAutoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

watch(mostrarGrafica, (nuevoValor) => {
  if (nuevoValor) {
    renderGraficaCapturasPorLinea("Project One", "grafica-capturas-linea1");
  }
});

// Actualiza fecha y hora cada vez que se abre el modal
watch(showModal, (nuevoValor) => {
  if (nuevoValor) {
    actualizarFechaHora();
    getStationOptions();
  }
});

onBeforeUnmount(() => {
  stopAutoRefresh(); // Asegurarse de limpiar el intervalo al desmontar el componente
});

const getStationOptions = async () => {
  console.log("🔁 [Componente] Ejecutando getStationOptions()");
  loading.value = true;
  try {
    const data = await reportStore.StationOptions();
    stationData.value = data;
    console.log("✅ [Componente] Datos cargados:", stationData.value);
  } catch (err) {
    console.error("❌ [Componente] Error:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.text-h5 {
  font-weight: bold;
}
.text-subtitle2 {
  font-size: 1rem;
  color: #666;
}
.q-table thead th {
  background-color: #1565c0;
  color: white;
  font-weight: 600;
}
.q-table tbody td {
  text-align: center;
  font-size: 20px !important;
}
.custom-header {
  background-color: #005670 !important;
  color: white !important;
  font-weight: bold !important;
  text-align: center !important;
  font-size: 16px !important;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.modern-table {
  font-weight: bold !important;
  text-align: center !important;
  font-size: 18px !important;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #ccc !important;
  min-width: 100%;
}
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
}
.total-row-no-border td {
  border: none !important; /* Elimina todos los bordes de las celdas en esta fila */
  border-top: 2px solid grey !important;
}

/* Opcional: Si ves un pequeño espacio o un borde residual arriba o abajo,
   puedes intentar añadir esto para asegurarte de que no haya ningún espaciado de celda */
.total-row-no-border {
  outline: none !important;
  box-shadow: none !important;
}

.total-row-separator td {
  border: none !important; /* Aseguramos que las celdas no tengan otros bordes */
  border-top: 2px solid grey !important; /* Mantenemos el borde superior en la fila */
}
.rounded-btn {
  border-radius: 10px;
  font-weight: bold;
  font-size: 12px;
  width: auto; /* Se adapta al contenido */
  min-width: unset; /* Elimina el tamaño mínimo forzado */
  border: 2px solid white;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: #f9f9f9; /* antes: white */
  padding: 1rem;
  padding-top: 0.1rem;
  border-radius: 8px;
  width: 100vw; /* ✅ Usa el 90% del viewport */
  max-width: 1600px; /* Opcional: límite máximo si usas pantallas muy grandes */
  max-height: 90vh; /* Para scroll si se pasa del alto */
  overflow-y: auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
  position: relative;
}

.grafica-row {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto; /* Scroll horizontal si se desborda */
  padding-bottom: 0.5rem; /* Espacio para la barra de scroll */
  -webkit-overflow-scrolling: touch; /* Suaviza scroll en dispositivos táctiles */
  /* Opcional: puedes añadir un borde inferior sutil para delimitar */
  border-bottom: 1px solid #ddd;
}
.grafica-col-3 {
  flex: 0 0 auto; /* No se encoge ni crece, tamaño fijo según contenido */
  width: 900px; /* Ancho fijo grande para que se vea bien la gráfica */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.grafica-col-3:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}
.grafica-box {
  width: 100%;
  height: 450px;
  border: 1px solid #e0e0e0; /* Elimina borde duro para diseño más limpio */
  /* Si quieres bordes suaves, puedes usar: */
  /* border: 1px solid #e0e0e0; */
}
.grafica-scroll-container {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 1rem;
  padding: 1rem 2.5rem; /* espacio para botones */
}

.grafica-slide {
  min-width: 900px;
  flex-shrink: 0;
}

/* Responsive: para pantallas pequeñas apilar una columna */
@media (max-width: 900px) {
  .grafica-col-3 {
    flex: 1 1 45%;
  }
}

@media (max-width: 600px) {
  .grafica-col-3 {
    flex: 1 1 100%;
  }
}

.cerrar-btn {
  position: absolute;
  top: 0.1rem;
  right: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: red;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #1976d2;
  color: white;
  border: none;
  font-size: 2rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}

.scroll-btn.left {
  left: -0.5rem; /* mueve ligeramente hacia afuera del contenedor */
}

.scroll-btn.right {
  right: -0.5rem;
}

.scrollable-table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
}
.fixed-header {
  display: flex;
  background-color: #f0f0f0;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
}
/* Base para las filas, tanto encabezado como datos */
.custom-trackingrow {
  display: flex;
  flex-wrap: nowrap; /* Asegura que las celdas no se rompan a otra línea */
  width: 100%;
  gap: 10px; /* Espacio entre las celdas */
  align-items: center;
  /* background-color: #f9f9f9;  Se moverá al custom-header para el encabezado y se aplicará directamente a las filas de datos */
  border: 1px solid #ccc;
  border-radius: 8px; /* Bordes redondeados para las filas */
  transition: all 0.3s ease;
  margin-top: 0;
  margin-bottom: 5px; /* Pequeño margen entre filas si lo deseas */
  padding: 3px 6px; /* Padding interno para las celdas */
}

/* Zebra striping con transición suave */
.custom-trackingrow:nth-child(even):not(.custom-header) {
  background-color: #e9eef5; /* tono más suave y moderno */
  transition: background-color 0.3s ease;
}

/* Hover con transición y efecto de elevación */
.custom-trackingrow:hover:not(.custom-header) {
  background-color: #d0e4ff; /* color claro al pasar el mouse */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px); /* efecto flotante */
  transition: background-color 0.3s ease, box-shadow 0.3s ease,
    transform 0.2s ease;
}

.custom-header {
  background: #f0f0f0;
  font-weight: bold;
}

.trackinghead-cell {
  flex: 1;
  font-size: 18px;
  padding: 5px;
  text-align: center;
}

.tracking-cell {
  flex: 1;

  padding: 5px;
  text-align: center;
}

.stationtype-cell {
  flex: 2;
  font-weight: bold;
}

.stationid-cell {
  flex: 1;
  font-weight: bold;
}

.inactividad-cell {
  flex: 2;
  font-weight: bold;
}

.fade-in {
  animation: fadeIn 1s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =======================
   Estilos para Reloj
   ======================= */
.contenedor-reloj {
  width: 100%;
  text-align: center;
}

.tiempo {
  width: 100%;
}

.fecha-ajustada {
  font-size: 1em; /* Reducido para que quepa */
  background: rgba(255, 255, 255, 0.5);

  width: 100%;
  margin-bottom: 10px;
}

.fecha-ajustada span {
  display: inline;
}

.reloj {
  width: 100%;
  padding: 10px;
  font-size: 1.5em; /* Tamaño ideal para un ancho de 240px */
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold; /* NEGRITAS */
}

.reloj p {
  line-height: 1;
  margin: 0;
  padding: 0 2px;
}

.reloj .dos-puntos {
  font-size: 0.8em; /* Hago los dos puntos un poco más pequeños */
}

.reloj .caja {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 0.5em; /* Reducido para la caja de AM/PM y segundos */
  margin-left: 5px;
}

.reloj .ampm {
  margin-bottom: 2px; /* Espaciado entre AM/PM y Segundos */
}

.fecha-ajustada .diaSemana {
  margin-right: 5px; /* Agrega 5px de espacio a la derecha */
}

/* Clase maestra para el calendario extra compacto, ajusta a 260px del drawer */
/* Puedes usar SCSS para anidamiento si estás en un archivo .vue */
.q-date-compact-final {
  /* Reduce el tamaño de la fuente general del calendario */
  font-size: 12px; /* O el tamaño que prefieras */
}

/* Reducir el padding de los encabezados (mes/año) */
.q-date-compact-final .q-date__header,
.q-date-compact-final .q-date__navigation {
  padding: 4px 8px; /* Ajusta el padding vertical y horizontal */
}

/* Reducir el tamaño de los días de la semana y los días del mes */
.q-date-compact-final .q-date__weekdays,
.q-date-compact-final .q-date__calendar-item {
  font-size: 11px; /* Letras más pequeñas */
}

/* Reducir el tamaño de las celdas de los días del mes */
.q-date-compact-final .q-date__calendar-item {
  width: 28px; /* Ancho de la celda */
  height: 28px; /* Alto de la celda (para hacerla cuadrada) */
  line-height: 28px; /* Centrar el número */
  padding: 0;
  margin: 1px; /* Espaciado entre celdas */
}

/* Ajustar el padding de los botones de Hoy, etc. */
.q-date-compact-final .q-btn {
  padding: 2px 6px;
  min-height: 28px;
  font-size: 12px;
}
</style>
