import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useStationStore } from "src/stores/Station";
import { Notify } from "quasar";
import { api } from "src/boot/axios";

dayjs.extend(duration);
dayjs.extend(customParseFormat);

export const usedowntimeStore = defineStore("downtime", () => {
  const downtimeReasons = ref([]);
  const downtimeEvents = ref([]);
  // Añadimos una variable para guardar la razón seleccionada desde el componente
  const selectedDowntimeReason = ref([]);
  const currentDowntimeId = ref(null);
  const isDowntimeActive = ref(false); // Aquí defines la variable reactiva

  // Temporizador para downtime automático
  const autoDowntimeTimer = ref(null);
  const autoDowntimeId = ref(null);

  const autoDowntimeInterval = ref(null);

  // Función para actualizar isDowntimeActive según tus eventos
  const updateDowntimeActiveStatus = () => {
    // Por ejemplo, puedes verificar si hay downtimes activos en downtimeEvents
    isDowntimeActive.value = downtimeEvents.value.some((e) => !e.EndTime);
  };

  const stationStore = useStationStore();

  // Valores de los indicadores (KPI) que vienen del servidor
  const averageCycleSeconds = ref(0);
  const sumConnectors = ref(0);
  const currentShift = ref("--"); // Variable para almacenar el turno actual

  // Estado
  const selectedDowntime = ref(null);
  const selectedMinutes = ref(0);
  const newReasonID = ref(null);

  // Computed
  const totalMinutes = computed(() => {
    if (!selectedDowntime.value) return 0;
    return Math.floor(selectedDowntime.value.DurationSeconds / 60);
  });

  // Abrir dialog desde el template
  function openSplit(downtimeEvent) {
    selectedDowntime.value = downtimeEvent;
    selectedMinutes.value = Math.floor(downtimeEvent.DurationSeconds / 60 / 2);
    newReasonID.value = null;
  }

  // Handle Split
  const handleSplit = async (
    selectedDowntime,
    selectedMinutes,
    newReasonID
  ) => {
    try {
      const percentParent =
        ((selectedMinutes * 60) / selectedDowntime.DurationSeconds) * 100;

      const payload = {
        ParentDowntimeID: selectedDowntime.DowntimeID,
        PercentParent: percentParent,
        NewReasonID: newReasonID?.ReasonID || newReasonID, // Aseguramos que sea el ID
        CreatedBy: selectedDowntime.CreatedBy,
      };

      console.log("Payload enviado:", payload);

      const response = await api.post("/downtime/split", payload);

      // 1. INTENTAR EXTRAER EL ID DEL DOWNTIME HIJO
      let newChildDowntimeID = null;
      if (response.data.result && response.data.result.length > 0) {
        // ⚠️ IMPORTANTE: CONFIRMA que el nombre de la columna sea 'NewDowntimeID'
        // Si no es correcto, cámbialo al nombre real de la columna de tu SP.
        newChildDowntimeID = response.data.result[0].NewDowntimeID;
      }

      Notify.create({
        type: "positive",
        message: response.data.message || "Split realizado con éxito",
      });

      // 2. RETORNAR EL ID O NULL
      return newChildDowntimeID;
    } catch (err) {
      console.error(err);
      Notify.create({
        type: "negative",
        message: "Error al realizar el split",
      });

      // 3. RETORNAR NULL EN CASO DE ERROR
      return null;
    }
  };

  // Función para actualizar ReasonID de un downtime
  const updateDowntimeReason = async (downtimeID, reasonID) => {
    if (!downtimeID || !reasonID) {
      console.warn("Faltan parámetros para actualizar ReasonID");
      return false;
    }

    try {
      const payload = { DowntimeID: downtimeID, ReasonID: reasonID };
      const response = await api.post("/downtime/update-reason", payload);

      if (response.status === 200) {
        console.log("ReasonID actualizado correctamente:", response.data);
        return true;
      } else {
        console.warn("No se pudo actualizar ReasonID:", response.data);
        return false;
      }
    } catch (error) {
      console.error("Error al actualizar ReasonID:", error);
      return false;
    }
  };

  /** Obtener informacion para el manejo de Downtimes **/
  const fetchDowntimeReasons = async () => {
    try {
      const response = await api.get("/downtime-reasons");
      console.log("Respuesta de downtime-reasons:", response.data);
      downtimeReasons.value = response.data
        .filter((item) => item.autonum !== 0)
        .map((item) => ({
          label: item.DownTimeReason,
          value: item.autonum,
        }));
    } catch (error) {
      console.error("Error al obtener razones de downtime:", error);
      downtimeReasons.value = [];
      Notify.create({
        message: "Error al cargar razones de downtime",
        color: "negative",
        icon: "error",
        position: "top",
      });
    }
  };

  // Acción para obtener los eventos de downtime
  const fetchDowntimeEvents = async (
    fechaInicioSeleccionada,
    fechaFinSeleccionada = null
  ) => {
    const AreaId = localStorage.getItem("MES_SelectedArea");
    const LineId = localStorage.getItem("MES_SelectedLine");
    const StationId = localStorage.getItem("MES_SelectedStation");
    const Shift = currentShift.value;

    if (
      !AreaId ||
      !LineId ||
      !StationId ||
      !Shift ||
      !fechaInicioSeleccionada
    ) {
      console.error("Faltan parámetros para obtener los eventos de downtime.");
      return;
    }

    try {
      const params = {
        AreaId,
        LineId,
        StationId,
        Fecha: dayjs(fechaInicioSeleccionada).format("YYYY-MM-DD"),
        Shift,
      };

      if (fechaFinSeleccionada) {
        params.FechaFin = dayjs(fechaFinSeleccionada).format("YYYY-MM-DD");
      }

      // ---- LOG: Antes de llamar al backend ----
      console.log("🟢 Enviando parámetros al backend:", params);

      const response = await api.get("/downtime/get", { params });

      // ---- LOG: Datos recibidos del backend ----
      console.log("🟢 Datos recibidos del backend:", response.data);

      downtimeEvents.value = response.data.map((event) => ({
        ...event,
        start: event.StartTime,
        end: event.EndTime,
        duration: formatDuration(event.DurationSeconds),
        justifiedBy: event.DownTimeReason || "No Justificado",
        createdByFullName: event.FULL_NAME,
        showJustifyOptions: false,
      }));

      // ---- LOG: Datos procesados en el store ----
      console.log("🟢 Eventos procesados:", downtimeEvents.value);
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
        message: "Faltan datos de justificación.",
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
        message: "Razón de downtime inválida.",
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
          message: "Downtime iniciado exitosamente.",
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
        message: "Error al iniciar un nuevo downtime.",
        position: "top",
      });
    }

    return { success: false };
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

  // Función para terminar downtime
  const terminarDowntime = async (
    downtimeID,
    reasonID = null,
    customEndTime = null
  ) => {
    // ¡Añadido: customEndTime!
    if (!downtimeID) {
      Notify.create({
        type: "negative",
        message: "DowntimeID inválido.",
        position: "top",
      });
      return false;
    }

    // 1. Determinar el valor de EndTime
    let finalEndTime;
    if (customEndTime) {
      // Caso Nuevo Proyecto: Usar el EndTime calculado (hora + minutos)
      finalEndTime = customEndTime;
    } else {
      // Caso Proyecto Anterior/Comportamiento Original: Usar la hora del sistema (now)
      const now = new Date();
      finalEndTime = toSqlDateString(now);
    }

    // 2. Construir el Payload
    const payload = reasonID
      ? { DowntimeID: downtimeID, ReasonID: reasonID } // 👈 Justificar
      : // 👈 Cerrar: Usamos finalEndTime, que es customEndTime o now
        { DowntimeID: downtimeID, EndTime: finalEndTime };

    console.log("Payload a enviar en CloseDowntime:", payload);

    try {
      const response = await api.post("/downtime/close", payload);

      if (response.status === 200) {
        localStorage.removeItem("activeDowntime");

        Notify.create({
          type: "positive",
          message: reasonID
            ? "Downtime justificado exitosamente."
            : "Downtime cerrado exitosamente.",
          position: "top",
        });

        updateDowntimeActiveStatus();
        currentDowntimeId.value = null;
        return true;
      }
    } catch (error) {
      console.error("Error en terminarDowntime:", error);
      Notify.create({
        type: "negative",
        message: "Error al procesar downtime.",
        position: "top",
      });
      return false;
    }
  };

  // 🔹 NUEVAS FUNCIONES PARA DOWNTIME AUTOMÁTICO
  const startAutoDowntimeTimer = () => {
    // Cancelar timers previos
    if (autoDowntimeTimer.value) {
      clearTimeout(autoDowntimeTimer.value);
      console.log("⏹ Timer previo de downtime automático cancelado.");
    }
    if (autoDowntimeInterval.value) {
      clearInterval(autoDowntimeInterval.value);
      autoDowntimeInterval.value = null;
    }

    console.log("⏳ Iniciando contador de downtime automático...");

    // Obtener datos desde localStorage
    const AreaId = localStorage.getItem("MES_SelectedArea");
    const LineId = localStorage.getItem("MES_SelectedLine");
    const StationId = localStorage.getItem("MES_SelectedStation");
    const Shift = localStorage.getItem("MES_CurrentShift");
    const activeOperators = JSON.parse(
      localStorage.getItem("MES_ActiveOperators") || "[]"
    );
    const CreatedBy = activeOperators[0]?.employeeId || null;

    if (!AreaId || !LineId || !StationId || !Shift || !CreatedBy) {
      console.error("❌ Faltan datos para iniciar downtime automático.");
      return;
    }

    // Guardar el momento exacto en el que debe ejecutarse
    const triggerAt = Date.now() + 60 * 1000;
    localStorage.setItem("MES_AutoDowntimeTriggerAt", triggerAt);

    // Cuenta regresiva
    let secondsRemaining = 60;
    console.log(`⏰ Cuenta regresiva: ${secondsRemaining} segundos`);
    autoDowntimeInterval.value = setInterval(() => {
      secondsRemaining--;
      console.log(`⏰ Quedan ${secondsRemaining} segundos...`);
      if (secondsRemaining <= 0) {
        clearInterval(autoDowntimeInterval.value);
        autoDowntimeInterval.value = null;
      }
    }, 1000);

    // Timer principal
    autoDowntimeTimer.value = setTimeout(async () => {
      console.log(
        "⏱ Tiempo de espera completado. Creando downtime automático..."
      );
      localStorage.removeItem("MES_AutoDowntimeTriggerAt"); // ya no se necesita

      const now = new Date();
      const payload = {
        AreaId,
        LineId,
        StationId,
        CreatedBy,
        Shift,
        StartTime: toSqlDateString(now), // 👈 ahora incluimos StartTime
      };
      console.log("📤 Payload a enviar a /downtime/auto:", payload);

      try {
        const { data } = await api.post("/downtime/auto", payload);
        autoDowntimeId.value = data.DowntimeID;
        localStorage.setItem("MES_AutoDowntimeID", autoDowntimeId.value);
        console.log("✅ Downtime automático creado:", autoDowntimeId.value);
      } catch (err) {
        console.error("❌ Error creando downtime automático:", err);
        if (err.response?.data) {
          console.log("📩 Error response data:", err.response.data);
        }
      }
    }, 60 * 1000);

    console.log("⏳ Timer de downtime automático configurado correctamente.");
  };

  const cancelAutoDowntimeTimer = () => {
    if (autoDowntimeTimer.value) {
      clearTimeout(autoDowntimeTimer.value);
      autoDowntimeTimer.value = null;
    }
    if (autoDowntimeInterval.value) {
      clearInterval(autoDowntimeInterval.value);
      autoDowntimeInterval.value = null;
    }
    localStorage.removeItem("MES_AutoDowntimeTriggerAt"); // limpiar trigger
    localStorage.removeItem("MES_AutoDowntimeID"); // limpiar si hubiera
    console.log("⏹️ Timer de downtime automático cancelado y limpiado.");
  };

  const resumeAutoDowntimeCountdown = (secondsRemaining) => {
    console.log("⏳ Reanudando contador de downtime automático...");

    autoDowntimeTimer.value = setTimeout(async () => {
      console.log(
        "⚡ Tiempo cumplido tras refresh, creando downtime automático..."
      );
      try {
        const payload = {
          AreaId: localStorage.getItem("MES_SelectedArea"),
          LineId: localStorage.getItem("MES_SelectedLine"),
          StationId: localStorage.getItem("MES_SelectedStation"),
          CreatedBy: JSON.parse(
            localStorage.getItem("MES_ActiveOperators") || "[]"
          )[0]?.employeeId,
          Shift: localStorage.getItem("MES_CurrentShift"),
        };

        const { data } = await api.post("/downtime/auto", payload);
        autoDowntimeId.value = data.DowntimeID;
        localStorage.setItem("MES_AutoDowntimeID", autoDowntimeId.value);
        console.log(
          "✅ Downtime automático creado tras refresh:",
          autoDowntimeId.value
        );
      } catch (err) {
        console.error(
          "❌ Error creando downtime automático tras refresh:",
          err
        );
      }
    }, secondsRemaining * 1000);

    // Cuenta regresiva en logs
    autoDowntimeInterval.value = setInterval(() => {
      secondsRemaining--;
      console.log(`⏰ Quedan ${secondsRemaining} segundos...`);
      if (secondsRemaining <= 0) {
        clearInterval(autoDowntimeInterval.value);
      }
    }, 1000);
  };

  // Función para formatear fecha a 'YYYY-MM-DD HH:mm:ss' en hora local
  const formatDateForSQL = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const closeAutoDowntime = async () => {
    const downtimeId =
      autoDowntimeId.value || localStorage.getItem("MES_AutoDowntimeID");

    if (!downtimeId) {
      console.warn("⚠️ No se encontró DowntimeID para cerrar.");
      return;
    }

    console.log("⏳ Cerrando downtime automático con ID:", downtimeId);

    const payload = {
      DowntimeID: downtimeId,
      EndTime: formatDateForSQL(new Date()), // ✅ hora local
    };

    console.log("📤 Payload a enviar a /downtime/close:", payload);

    try {
      const { data } = await api.post("/downtime/close", payload);

      console.log("✅ Downtime automático cerrado exitosamente:", data);
    } catch (err) {
      console.error("❌ Error cerrando downtime automático:", err);
      if (err.response?.data) {
        console.log("📩 Error response data:", err.response.data);
      }
    } finally {
      autoDowntimeId.value = null;
      localStorage.removeItem("MES_AutoDowntimeID");
      cancelAutoDowntimeTimer();
      console.log("🗑 Estado de downtime automático reseteado.");
    }
  };

  // Nueva función para cambiar el ReasonID
  const changeDowntimeReasonID = async (downtimeID, newReasonID) => {
    if (!downtimeID || !newReasonID) {
      Notify.create({
        type: "negative",
        message: "DowntimeID y ReasonID son obligatorios.",
        position: "top",
      });
      return false;
    }

    const payload = {
      DowntimeID: downtimeID,
      ReasonID: newReasonID,
    };

    console.log("Payload a enviar para cambiar la razón:", payload);

    try {
      const response = await api.post("/downtime/close", payload); // O tu nueva ruta, si la creas

      if (response.status === 200) {
        Notify.create({
          type: "positive",
          message: "Razón del downtime actualizada exitosamente.",
          position: "top",
        });
        return true;
      }
    } catch (error) {
      console.error("Error en changeDowntimeReasonID:", error);
      Notify.create({
        type: "negative",
        message: "Error al actualizar la razón del downtime.",
        position: "top",
      });
      return false;
    }
  };

  const fetchDowntimeEventsRango = async (
    fechaInicioSeleccionada,
    fechaFinSeleccionada = null
  ) => {
    if (!fechaInicioSeleccionada) {
      console.error("Debe especificarse la fecha de inicio.");
      return;
    }

    try {
      const params = {
        AreaId: null,
        LineId: null,
        StationId: null,
        Shift: null,
        Fecha: dayjs(fechaInicioSeleccionada).format("YYYY-MM-DD"),
        SoloSinReason: 1, // siempre enviar SoloSinReason = 1
      };

      if (fechaFinSeleccionada) {
        params.FechaFin = dayjs(fechaFinSeleccionada).format("YYYY-MM-DD");
      }

      // 🚀 LOG DE LOS PARÁMETROS
      console.log(
        "Parámetros enviados al backend (solo fechas, SoloSinReason=1):",
        params
      );

      const response = await api.get("/downtime/get", { params });

      downtimeEvents.value = response.data.map((event) => ({
        ...event,
        start: event.StartTime,
        end: event.EndTime,
        duration: formatDuration(event.DurationSeconds),
        justifiedBy: event.DownTimeReason || "No Justificado",
        createdByFullName: event.FULL_NAME,
        showJustifyOptions: false,
      }));

      // LOG: Datos procesados
      console.log(
        "Eventos procesados (solo fechas, SoloSinReason=1):",
        downtimeEvents.value
      );
    } catch (error) {
      console.error(
        "Error al obtener los eventos de downtime (solo fechas, SoloSinReason=1):",
        error
      );
      downtimeEvents.value = [];
    }
  };

  return {
    fetchDowntimeEventsRango,
    currentShift,
    downtimeReasons,
    fetchDowntimeReasons,
    downtimeEvents,
    fetchDowntimeEvents,
    startDowntime,
    terminarDowntime,
    currentDowntimeId,
    isDowntimeActive,
    updateDowntimeActiveStatus,
    startAutoDowntimeTimer,
    cancelAutoDowntimeTimer,
    closeAutoDowntime,
    autoDowntimeTimer,
    autoDowntimeId,
    updateDowntimeReason,
    autoDowntimeInterval,
    resumeAutoDowntimeCountdown,
    formatDateForSQL,
    selectedDowntime,
    selectedMinutes,
    newReasonID,
    totalMinutes,
    openSplit,
    handleSplit,
    changeDowntimeReasonID,
  };
});
