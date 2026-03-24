import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useStationStore } from "src/stores/Station";
import { Notify } from "quasar";
import { api } from "src/boot/axios";
import i18n from "src/i18n"; // Mantén la importación

dayjs.extend(duration);
dayjs.extend(customParseFormat);

const t = (...args) => i18n.global.t(...args);

export const useProductionStore = defineStore("production", () => {
  // 1. Declarar 'lang' como una ref, inicializada con localStorage
  const lang = ref(localStorage.getItem("lang") || "es");

  // 2. Acción para actualizar el idioma y localStorage
  const setLangAction = async (newLang) => {
    // ⭐️ HACER ASÍNCRONA
    lang.value = newLang; // Actualiza la ref (reactivo)
    localStorage.setItem("lang", newLang); // Actualiza localStorage

    // ⭐️ USAR AWAIT: Garantiza que el fetch espere a que lang.value se asiente
    await fetchDowntimeReasons();
  };
  // State
  const productionRows = ref([]);
  const downtimeReasons = ref([]);
  const downtimeEvents = ref([]);
  // Añadimos una variable para guardar la razón seleccionada desde el componente
  const selectedDowntimeReason = ref([]);
  const currentDowntimeId = ref(null);
  const isDowntimeActive = ref(false); // Aquí defines la variable reactiva

  // Función para actualizar isDowntimeActive según tus eventos
  const updateDowntimeActiveStatus = () => {
    // Por ejemplo, puedes verificar si hay downtimes activos en downtimeEvents
    isDowntimeActive.value = downtimeEvents.value.some((e) => !e.EndTime);
  };
  const averageCycleSeconds = ref(0);
  const sumConnectorsOk = ref(0);
  const sumConnectorsNg = ref(0);
  const currentShift = ref("--");
  const HelpRequestGet = ref([]);
  const isConfigured = computed(() => stationStore.isStationConfigured);
  const stationType = computed(() => stationStore.stationType);
  const helpRequestsStatus = ref([]);

  // Computed KPI display (optional, based on raw refs or rows)
  const averageCycleTime = computed(() => {
    const secs = averageCycleSeconds.value;
    if (!secs) return "0.0 s";
    if (secs >= 60) {
      const mins = Math.floor(secs / 60);
      const rem = Math.round(secs % 60);
      return `${mins}m ${rem}s`;
    }
    return `${secs.toFixed(1)} s`;
  });

  const totalDowntime = computed(() => "0m");
  const hasPendingScans = computed(() =>
    productionRows.value.some((r) => r.status === 1)
  );

  const stationStore = useStationStore();

  // Add a new production record
  const addProductionRecord = async (recordData, $q) => {
    try {
      const response = await api.post("/production/insert", recordData);
      const { NewId } = response.data || {};
      if (NewId) {
        await loadProductionData();
        return { success: true, newRecord: { id: NewId } };
      } else {
        $q.notify({
          // Uso de i18n
          message: t("storeNotify.prod_scan_no_id", {
            JobNumber: recordData.JobNumber,
          }),
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 3000,
        });
        return { success: false, error: "No NewId received" };
      }
    } catch (error) {
      console.error("Error al insertar en T_ProdPart:", error);
      $q.notify({
        // Uso de i18n
        message: t("storeNotify.prod_scan_error", {
          JobNumber: recordData.JobNumber,
          details: error.response?.data?.message || error.message,
        }),
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 5000,
      });
      return { success: false, error: error.message };
    }
  };

  //Terminar Downtime

  function toSqlDateString(date) {
    if (!date || isNaN(date.getTime())) return null;
    const pad = (num) => num.toString().padStart(2, "0");
    const padMs = (num) => num.toString().padStart(3, "0");

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds()) +
      "." +
      padMs(date.getMilliseconds())
    );
  }

  /** Obtener informacion para el manejo de Downtimes **/
  const fetchDowntimeReasons = async () => {
    try {
      const response = await api.get("/downtime-reasons");
      console.log("Respuesta de downtime-reasons:", response.data);

      // 👇 Log del valor actual de lang
      console.log("Idioma actual (lang):", lang.value);

      downtimeReasons.value = response.data
        .filter((item) => item.autonum !== 0)
        .map((item) => ({
          label:
            lang.value === "en"
              ? item.DownTimeReasonEN
              : lang.value === "es"
              ? item.DownTimeReasonES
              : item.DownTimeReason,
          value: item.autonum,
        }));
    } catch (error) {
      console.error("Error al obtener razones de downtime:", error);
      downtimeReasons.value = [];
      Notify.create({
        // Uso de i18n
        message: t("storeNotify.downtime_reason_load_error"),
        color: "negative",
        icon: "error",
        position: "top",
      });
    }
  };

  // Acción para obtener los eventos de downtime
  const fetchDowntimeEvents = async (FechaFin = null) => {
    const AreaId = localStorage.getItem("MES_SelectedArea");
    const LineId = localStorage.getItem("MES_SelectedLine");
    const StationId = localStorage.getItem("MES_SelectedStation");
    const Shift = currentShift.value;
    const Fecha = dayjs().format("YYYY-MM-DD");

    if (!AreaId || !LineId || !StationId || !Shift || !Fecha) {
      console.error("Faltan parámetros para obtener los eventos de downtime.");
      return;
    }

    try {
      const params = {
        AreaId,
        LineId,
        StationId,
        Fecha,
        Shift,
      };

      if (FechaFin) {
        params.FechaFin = dayjs(FechaFin).format("YYYY-MM-DD");
      }

      // 🚨 LOG DE LA INFORMACIÓN ENVIADA
      console.log("Parámetros enviados al backend:", params);

      const response = await api.get("/downtime/get", { params });

      downtimeEvents.value = response.data.map((event) => ({
        ...event,
        start: event.StartTime,
        end: event.EndTime,
        duration: formatDuration(event.DurationSeconds),

        // Aplicando la lógica de lang exactamente igual a fetchDowntimeReasons
        justifiedBy:
          (lang.value === "en"
            ? event.DownTimeReasonEN
            : lang.value === "es"
            ? event.DownTimeReasonES
            : event.DownTimeReason) || "No Justificado",

        createdByFullName: event.FULL_NAME,
        showJustifyOptions: false,
      }));
    } catch (error) {
      console.error("Error al obtener los eventos de downtime:", error);
      downtimeEvents.value = [];
    }
  };

  // Función auxiliar para formatear la duración
  const formatDuration = (seconds) => {
    if (seconds === null) return "---";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  //Inicio de Downtime, insertar datos en la tabla T_DowntimeEvents
  const startDowntime = async (reasonLabel, jobId) => {
    if (!reasonLabel || !jobId) {
      console.error("Faltan datos para iniciar el downtime.");
      Notify.create({
        type: "negative",
        // Uso de i18n
        message: t("storeNotify.downtime_start_missing_data"),
        position: "top",
      });
      return { success: false };
    }

    // Buscar el ID numérico de la razón desde el label
    const downtimeReason = downtimeReasons.value.find(
      (r) => r.label === reasonLabel
    );
    const reasonId = downtimeReason ? downtimeReason.value : null;

    if (!reasonId) {
      console.error("No se encontró el ReasonID para la razón:", reasonLabel);
      Notify.create({
        type: "negative",
        // Uso de i18n
        message: t("storeNotify.downtime_start_invalid_reason"),
        position: "top",
      });
      return { success: false };
    }

    const activeOperators = JSON.parse(
      localStorage.getItem("MES_ActiveOperators") || "[]"
    );
    const createdBy = activeOperators[0]?.employeeId || null;
    const now = new Date();
    const local = new Date(now.getTime() - 6 * 60 * 60 * 1000); // GMT-6

    const payload = {
      ReasonID: reasonId, // Aquí enviamos el ID correcto
      StartTime: toSqlDateString(now),
      EndTime: null,
      DowntimeType: 1,
      IsSplit: 0,
      SplitFromDowntimeID: null,
      CreatedAt: toSqlDateString(now),
      CreatedBy: createdBy,
      Shift: currentShift.value,
      AreaId: localStorage.getItem("MES_SelectedArea"),
      LineId: localStorage.getItem("MES_SelectedLine"),
      StationId: localStorage.getItem("MES_SelectedStation"),
      JobIDs: jobId,
    };
    console.log("Payload a enviar en startDowntime:", payload);
    try {
      const response = await api.post("/production/downtime/start", payload);

      if (response.status === 201) {
        const downtimeId = response.data.DowntimeID; // 👈 lo recibes aquí

        // ✅ 1. Crea el objeto completo del downtime con el ID del servidor
        const activeDowntimeData = {
          ...payload, // Copia todos los datos del payload
          DowntimeID: downtimeId, // Agrega el ID que devuelve el servidor
          ReasonLabel: reasonLabel, // Agrega la etiqueta de la razón para mostrarla en el overlay
          start: now, // Usamos el objeto Date para poder formatearlo más adelante
        };

        // ✅ 2. Guarda el objeto completo en localStorage
        localStorage.setItem(
          "activeDowntime",
          JSON.stringify(activeDowntimeData)
        );

        currentDowntimeId.value = downtimeId; // 👈 lo guardas en el store

        Notify.create({
          type: "positive",
          // Uso de i18n
          message: t("storeNotify.downtime_start_success"),
          position: "top",
        });

        await fetchDowntimeEvents();
        return { success: true, downtimeId };
      }
    } catch (error) {
      console.error("Error al iniciar un nuevo downtime:", error);

      if (error.response && error.response.data) {
        console.error("Detalle del error:", error.response.data);
      }

      Notify.create({
        type: "negative",
        // Uso de i18n
        message: t("storeNotify.downtime_start_error"),
        position: "top",
      });
    }

    return { success: false };
  };

  // Función para terminar downtime
  const terminarDowntime = async (downtimeID) => {
    if (!downtimeID) {
      Notify.create({
        type: "negative",
        // Uso de i18n
        message: t("storeNotify.downtime_end_invalid_id"),
        position: "top",
      });
      return false;
    }

    const now = new Date();
    const local = new Date(now.getTime() - 6 * 60 * 60 * 1000); // GMT-6

    const payload = {
      DowntimeID: downtimeID,
      EndTime: toSqlDateString(now), // <-- aquí usas el formato correcto
    };
    console.log("Payload a enviar en ClosetDowntime:", payload);
    try {
      const response = await api.post("/downtime/close", payload);

      if (response.status === 200) {
        // ✅ Línea importante: liberar el localStorage después de terminar el downtime
        localStorage.removeItem("activeDowntime");

        Notify.create({
          type: "positive",
          // Uso de i18n
          message: t("storeNotify.downtime_end_success"),
          position: "top",
        });

        // Actualiza localmente el downtime activo
        const eventIndex = downtimeEvents.value.findIndex(
          (e) => e.DowntimeID === downtimeID
        );
        if (eventIndex !== -1) {
          const event = downtimeEvents.value[eventIndex];
          event.EndTime = payload.EndTime; // mantén el mismo formato

          const startTime = new Date(event.StartTime);
          const durationMs = now - startTime;
          const seconds = Math.floor((durationMs / 1000) % 60);
          const minutes = Math.floor((durationMs / 1000 / 60) % 60);
          const hours = Math.floor(durationMs / 1000 / 60 / 60);

          event.Duration = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }

        updateDowntimeActiveStatus();

        currentDowntimeId.value = null;

        return true;
      }
    } catch (error) {
      console.error("Error al cerrar downtime:", error);
      Notify.create({
        type: "negative",
        // Uso de i18n
        message: t("storeNotify.downtime_end_error"),
        position: "top",
      });
      return false;
    }
  };

  // Complete production: update status and connectors
  // productionStore.js

  const updateProductionRecordStatus = async (
    recordId,
    terminalA,
    terminalB
  ) => {
    try {
      const { data } = await api.post("/production/complete", {
        recordId,
        terminalA,
        terminalB,
      });

      if (!data.success) {
        Notify.create({
          message:
            data.message ||
            t("storeNotify.prod_complete_api_error", { recordId }),
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 3000,
        });
        return { success: false, error: data.message };
      }

      // Recarga los datos para refrescar la tabla
      await loadProductionData();
      return { success: true };
    } catch (err) {
      console.error("Error al invocar /production/complete:", err);
      Notify.create({
        message: t("storeNotify.prod_complete_server_error", { recordId }),
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 3000,
      });
      return { success: false, error: err.message };
    }
  };

  const PauseConfirm = async (recordId) => {
    try {
      const { data } = await api.post("/production/pause", {
        recordId,
      });

      if (!data.success) {
        Notify.create({
          message:
            data.message ||
            t("storeNotify.prod_complete_api_error", { recordId }),
          color: "negative",
          icon: "error",
          position: "top",
          timeout: 3000,
        });
        return { success: false, error: data.message };
      }

      // Recarga los datos para refrescar la tabla
      await loadProductionData();
      return { success: true };
    } catch (err) {
      console.error("Error al invocar /production/pause:", err);
      Notify.create({
        message: t("storeNotify.prod_complete_server_error", { recordId }),
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 3000,
      });
      return { success: false, error: err.message };
    }
  };

  // Fetch recent history and KPIs
  const fetchRecentProductionHistory = async (
    lineCodeId,
    stationId,
    prodDate,
    topN = 20
  ) => {
    try {
      const res = await api.get("/production/history", {
        params: { lineCodeId, stationId, prodDate, topN },
      });

      // 🔍 DEBUG
      console.log("📡 API Response completa:", res);
      console.log("📦 Data:", res.data);

      const data = res.data;
      const history = data.history ?? data;

      // 🔍 DEBUG
      console.log("📊 History:", history);
      console.log("⏱ AvgCycleSeconds:", data.avgCycleSeconds);
      console.log("🔢 Sum OK:", data.sumConnectorsOk);
      console.log("🔴 Sum NG:", data.sumConnectorsNg);
      console.log("🔄 Current Shift:", data.currentshift);

      averageCycleSeconds.value = data.avgCycleSeconds ?? 0;
      sumConnectorsOk.value = data.sumConnectorsOk ?? 0;
      sumConnectorsNg.value = data.sumConnectorsNg ?? 0;
      currentShift.value = data.currentshift || "--";

      productionRows.value = history.map((item, idx) => {
        // AQUÍ ESTÁ EL CAMBIO: Pasamos la fecha ISO cruda o null si no existe
        const scanStart = item.ScanStart ? item.ScanStart : null;
        const scanEnd = item.ScanEnd ? item.ScanEnd : null;

        const prodDate = item.ScanStart
          ? dayjs(item.ScanStart).format("YYYY-MM-DD")
          : "-";

        return {
          id: item.Id,
          index: idx + 1,

          jobId: item.JobNumber,

          jobNumberId: item.JobNumberId ?? null,

          status: item.Status,
          scanStart, // Se guarda el texto crudo (ej: "2026-03-18T11:34:15.443Z")
          scanEnd, // Se guarda el texto crudo o null
          duration: item.Duration || "-",
          startTimeStamp: dayjs(),
          endTimeStamp: item.ScanEnd ? dayjs(item.ScanEnd) : null,

          rawNumberOfConnectors: item.NumberOfConnectors,
          numberOfConnectors: item.NumberOfConnectors,
          connectorsOk: item.connectorsOk,
          connectorsNg: item.connectorsNg,
          AFL_Drawing_NUMBER: item.AFL_DRAWING_NUMBER,
          passedSameProductionOrder: !!item.PassedSameProductionOrder,
          hasDefects: !!item.HasDefects,
          productionDate: prodDate,
        };
      });

      Notify.create({
        // Uso de i18n
        message: t("storeNotify.prod_history_load_success"),
        color: "positive",
        position: "top",
        timeout: 1000,
      });

      return {
        history,
        avgCycleSeconds: averageCycleSeconds.value,
        sumConnectorsOk: sumConnectorsOk.value,
        sumConnectorsNg: sumConnectorsNg.value,
        currentshift: currentShift.value,
      };
    } catch (error) {
      console.error("Error al cargar historial de producción:", error);
      Notify.create({
        // Uso de i18n
        message: t("storeNotify.prod_history_load_error"),
        color: "negative",
      });
      throw error;
    }
  };

  // Load data wrapper
  const loadProductionData = async () => {
    const prodDate = dayjs().format("YYYYMMDD");
    if (stationStore.selectedLine && stationStore.selectedStation) {
      await fetchRecentProductionHistory(
        stationStore.selectedLine,
        stationStore.selectedStation,
        prodDate,
        20
      );
    } else {
      productionRows.value = [];
      averageCycleSeconds.value = 0;
      sumConnectorsOk.value = 0;
      sumConnectorsNg.value = 0;
      currentShift.value = "--";
    }
  };

  /**
   * @action loadHelpRequest
   * @description Carga los posibles tipos de probelmas que pueden ser solictados
   */
  const loadHelpRequest = async () => {
    if (!isConfigured.value || !stationType.value) {
      HelpRequestGet.value = [];
      return;
    }
    try {
      const res = await api.get(`/HelpRequestGet/`);
      HelpRequestGet.value = res.data;
    } catch (err) {
      console.error(`Error al cargar datos`, err);
      Notify.create({
        // Uso de i18n
        message: t("storeNotify.help_request_load_error"),
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 3000,
      });
      HelpRequestGet.value = [];
    }
  };

  const SendHelpRequest = async (requestData) => {
    try {
      const response = await api.post("/production/HelpRequest", requestData);
      const { success, NewId, Number, message } = response.data || {};

      if (success && NewId) {
        return {
          success: true,
          newRecord: { id: NewId, number: Number },
          message: message || `Incidente ${Number} creado exitosamente`,
        };
      } else {
        return { success: false, error: "No se recibió ID del incidente" };
      }
    } catch (error) {
      console.error("Error al enviar Solicitud de Ayuda:", error);
      return {
        success: false,
        error: error.message,
        backendMessage: error.response?.data?.message,
      };
    }
  };

  const fetchIncidentStatusesFromSNOW = async () => {
    const incidentNumbersJson = localStorage.getItem("incidentNumbers");
    let incidentNumbers = [];

    try {
      incidentNumbers = incidentNumbersJson
        ? JSON.parse(incidentNumbersJson)
        : [];

      if (!Array.isArray(incidentNumbers)) {
        console.warn(
          "localStorage 'incidentNumbers' no es un array válido, inicializando a vacío."
        );
        incidentNumbers = [];
      }
    } catch (e) {
      console.error("Error al parsear 'incidentNumbers' de localStorage:", e);
      incidentNumbers = [];
    }

    if (incidentNumbers.length === 0) {
      helpRequestsStatus.value = [];
      Notify.create({
        type: "info",
        // Uso de i18n
        message: t("storeNotify.incident_status_no_numbers"),
        position: "top",
      });
      return {
        success: true,
        message: "No hay incidentes para consultar.",
      };
    }

    try {
      const response = await api.post("/production/incidentStatus", {
        incidentNumbers: incidentNumbers,
      });

      if (response.data.success) {
        helpRequestsStatus.value = response.data.incidents;

        let resolvedLog = JSON.parse(
          localStorage.getItem("resolvedIncidentsLog") || "[]"
        );
        const now = Date.now();

        response.data.incidents.forEach((incident) => {
          if (incident.status === "Resuelto") {
            const existeEnLog = resolvedLog.some(
              (item) => item.incidentNumber === incident.number
            );

            if (!existeEnLog) {
              resolvedLog.push({
                incidentNumber: incident.number,
                resolvedAt: now,
              });
              console.log(
                `[Registro] Incidente ${incident.number} registrado como Resuelto en log.`
              );
            }
          }
        });

        localStorage.setItem(
          "resolvedIncidentsLog",
          JSON.stringify(resolvedLog)
        );

        Notify.create({
          type: "positive",
          // Uso de i18n
          message: t("storeNotify.incident_status_success", {
            count: response.data.incidents.length,
          }),
          position: "top",
        });
        return {
          success: true,
          data: response.data.incidents,
        };
      } else {
        Notify.create({
          type: "negative",
          // Uso de i18n
          message: t("storeNotify.incident_status_api_error", {
            message:
              response.data.message || t("notify.error_unknown_server_error"), // Usamos una clave de fallback si no hay mensaje
          }),
          position: "top",
        });
        return {
          success: false,
          error: response.data.message,
        };
      }
    } catch (error) {
      console.error("Error al consultar el estado de incidentes:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error de red/servidor";
      Notify.create({
        type: "negative",
        // Uso de i18n
        message: t("storeNotify.incident_status_connection_error", {
          message: errorMessage,
        }),
        position: "top",
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Register epoxy data
  const registerEpoxyData = async ({
    lotA,
    lotB,
    serialEpoxyNo,
    expirationDate,
    stationId,
  }) => {
    try {
      const response = await api.post("/epoxy/register", {
        lotA,
        lotB,
        serialEpoxyNo,
        expirationDate,
        stationId,
      });
      return {
        success: response.data.success,
        message: response.data.message,
        newEpoxyId: response.data.newEpoxyId,
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || err.message || "Error desconocido",
        newEpoxyId: null,
      };
    }
  };

  return {
    productionRows,
    averageCycleSeconds,
    sumConnectorsOk,
    sumConnectorsNg,
    currentShift,
    averageCycleTime,
    totalDowntime,
    hasPendingScans,
    addProductionRecord,
    updateProductionRecordStatus,
    fetchRecentProductionHistory,
    loadProductionData,
    registerEpoxyData,
    downtimeReasons,
    fetchDowntimeReasons,
    downtimeEvents,
    fetchDowntimeEvents,
    startDowntime,
    terminarDowntime,
    currentDowntimeId,
    isDowntimeActive,
    updateDowntimeActiveStatus,
    SendHelpRequest,
    HelpRequestGet,
    loadHelpRequest,
    helpRequestsStatus,
    fetchIncidentStatusesFromSNOW,
    lang,
    setLangAction,
    PauseConfirm,
  };
});
