import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "src/boot/axios";
import { Notify } from "quasar";

export const useReportStore = defineStore("report", () => {
  // --- State ---
  const downtimeResults = ref([]);
  const totalMinutos = ref(0);
  const TitleStartDate = ref(null);
  const TitleEndDate = ref(null);

  const stationOptions = ref([]);
  const reporteCapturas = ref([]);
  const reporteTurnos = ref([]);

  // Para fetchEmployee
  const getempresponse = ref("");

  const startDate = ref(null);
  const endDate = ref(null);

  //Obtencion de Jobnumber
  const jobsByDateResults = ref([]);

  //reporte de Job's abiertos
  const openJobsList = ref([]);

  // --- ESTADO (State) ---
  const monthlyData = ref([]); // Almacena datos mensuales por estación/turno
  const weeklyData = ref([]); // Almacena datos semanales por estación/turno
  const dailyData = ref([]); // Almacena datos diarios por estación/turno
  const isLoading = ref(false);
  const currentYear = ref(new Date().getFullYear());
  const currentMonth = ref(new Date().getMonth() + 1); // +1 porque getMonth() es base 0

  // 📌 Llama a /api/station-options
  const StationOptions = async () => {
    console.log(
      "📡 [StationOptions] Iniciando llamada a /api/station-options..."
    );

    try {
      const response = await api.get("/station-options");
      console.log(
        "✅ [StationOptions] Respuesta recibida desde API:",
        response.data
      );

      // 🔹 Filtra los que NO tienen TiempoInactividad nulo
      stationOptions.value = response.data.filter(
        (item) => item.InactivityTime !== null
      );

      console.log(
        `📊 [StationOptions] Estaciones válidas después del filtro: ${stationOptions.value.length}`
      );

      return stationOptions.value;
    } catch (error) {
      console.error(
        "❌ [StationOptions] Error al obtener opciones de estaciones:",
        error.message
      );
      Notify.create({
        type: "negative",
        message: "Error al obtener opciones de estaciones",
        position: "top",
      });
      return [];
    }
  };

  // 📌 Llama a /api/reporte-capturas
  const ReporteCapturas = async (fecha = null, tipoConteo = "Jobs") => {
    try {
      const params = { tipoConteo }; // 👈 usar el mismo nombre que en backend
      if (fecha) params.fecha = fecha;

      console.log("📤 Params enviados al backend:", params);

      const response = await api.get("/reporte-capturas", { params });
      reporteCapturas.value = response.data;
      return reporteCapturas.value;
    } catch (error) {
      console.error("Error al obtener reporte de capturas:", error);
      Notify.create({
        type: "negative",
        message: "Error al obtener reporte de capturas",
        position: "top",
      });
      return [];
    }
  };

  // 📌 Llama a /api/reporte-turnos
  // store.js
  const ReporteTurnos = async (fecha = null, tipoConteo = "Jobs") => {
    try {
      const params = {
        // ✅ Usa el tipoConteo recibido como parámetro
        tipoConteo: tipoConteo,
      };
      if (fecha) params.fecha = fecha;

      console.log("📤 Params enviados al backend:", params);

      const response = await api.get("/reporte-turnos", { params });
      reporteTurnos.value = response.data;
      return reporteTurnos.value;
    } catch (error) {
      console.error("Error al obtener reporte de turnos:", error);
      Notify.create({
        type: "negative",
        message: "Error al obtener reporte de turnos",
        position: "top",
      });
      return [];
    }
  };

  // Este es el código de tu 'ReportStore.js'
  const getDownTimeSummary = async (startDate, endDate = null) => {
    // Log 1: Qué se recibió en la función
    console.log("🟢 [getDownTimeSummary] Parámetros recibidos:");
    console.log("  - Fecha de inicio:", startDate);
    console.log("  - Fecha de fin:", endDate);

    if (!startDate) {
      Notify.create({
        type: "negative",
        message: "Debes seleccionar al menos la fecha de inicio.",
        icon: "warning",
        position: "top",
      });
      // Log 2: Notificación si falta la fecha de inicio
      console.warn("🟡 [getDownTimeSummary] Falta fecha de inicio. Abortando.");
      return [];
    }

    // A partir de aquí, el código es el que te sugerí en la respuesta anterior
    try {
      // Log 3: Creando los parámetros de consulta para la URL
      const params = {
        productionDateStart: startDate,
        ...(endDate && { productionDateEnd: endDate }), // Solo si endDate tiene un valor
      };
      console.log(
        "✅ [getDownTimeSummary] Parámetros de consulta a enviar:",
        params
      );

      // Log 4: Antes de la llamada a la API
      console.log(
        "📡 [getDownTimeSummary] Realizando llamada GET a /getDownTimeSummary"
      );

      // Nota: Es crucial que cambies '.post' por '.get'
      const response = await api.get("/getDownTimeSummary", { params }); // <- ¡CAMBIO CLAVE!

      // Log 5: Después de recibir la respuesta de la API
      console.log("🎉 [getDownTimeSummary] Respuesta recibida:", response.data);

      downtimeResults.value = response.data;

      // 👉 AÑADE ESTA LÍNEA AQUÍ
      console.log(
        "🔍 [getDownTimeSummary] Contenido de downtimeResults:",
        downtimeResults.value
      );

      totalMinutos.value = response.data.reduce(
        (sum, item) => sum + (item.DuracionEnMinutos || 0),
        0
      );
      TitleStartDate.value = startDate;
      TitleEndDate.value = endDate;

      if (response.data.length === 0) {
        Notify.create({
          type: "warning",
          message:
            "No se encontraron datos de downtime para los filtros seleccionados.",
          icon: "warning",
          timeout: 3000,
          position: "top",
        });
        console.warn("🟡 [getDownTimeSummary] No se encontraron datos.");
      }

      return response.data;
    } catch (error) {
      // Log 6: Manejo de errores de la API
      console.error(
        "❌ [getDownTimeSummary] Error en la llamada a la API:",
        error
      );
      Notify.create({
        type: "negative",
        message: "Error al obtener los datos de downtime.",
        icon: "error",
        position: "top",
      });
      return [];
    }
  };

  const fetchDownTimeSummary = async (start, end) => {
    if (!start) {
      Notify.create({
        type: "negative",
        message: "Debes seleccionar al menos la fecha de inicio.",
      });
      return;
    }

    const payload = {
      productionDateStart: new Date(start).toISOString().split("T")[0],
      productionDateEnd: end ? new Date(end).toISOString().split("T")[0] : null,
      stationID: null,
    };

    try {
      console.log("📤 Payload enviado:", payload);

      const response = await api.post("/getDownTimeSummary2", payload);

      downtimeResults.value = response.data;

      console.log("✅ Datos de downtime recibidos:", response.data);

      totalMinutos.value = response.data.reduce(
        (sum, item) => sum + (item.DuracionEnMinutos || 0),
        0
      );
    } catch (error) {
      console.error("❌ Error al consultar downtime:", error);
      Notify.create({
        type: "negative",
        message: "Error al obtener los datos de downtime.",
        icon: "error",
        position: "top",
      });
    }
  };

  // 1️⃣ Obtener empleado por badge fetchEmployee
  const fetchEmployee = async (badgeNum) => {
    console.log("📡 Fetching employee from server", badgeNum);
    try {
      const response = await api.get(`/getEmp/${badgeNum}`);
      const employee = response.data;

      if (employee && employee.length > 0) {
        // Solo asignamos el nombre para mostrar
        getempresponse.value = employee[0].EMPLOYEE_FULL_NAME;

        console.log("✅ Operator fetched from server: ", employee[0]);
      } else {
        getempresponse.value = "No employee found for this badge number";
        console.warn("⚠️ No employee found for this badge number");
      }

      return employee;
    } catch (error) {
      getempresponse.value = "Error fetching employee from server";
      console.error("❌ Error fetching employee from server:", error);
      $q.notify({
        type: "negative",
        message: "Error al obtener información del empleado",
      });
      return null;
    }
  };

  // 2️⃣ Insertar nuevo empleado
  const insertEmployee = async ({ employeeNumber, fullName, description }) => {
    try {
      // Log 1: Verificar los datos que se enviarán
      console.log("➡️ [STORE-LOG] Intentando insertar empleado con datos:", {
        employeeNumber,
        fullName,
        description,
      });

      const { data } = await api.post("/employeeInsert", {
        employeeNumber,
        fullName,
        description,
      });

      // Log 2: Confirmar éxito
      console.log(
        "✅ [STORE-LOG] Inserción exitosa. Respuesta del servidor:",
        data
      );
      return data; // { success: boolean, message: string }
    } catch (error) {
      // Log 3: Manejo de errores detallado
      console.error("❌ [STORE-ERROR] Error al insertar empleado:", error);

      let errorMessage = "No se pudo conectar al servidor";

      // Intentar extraer un mensaje útil del error de Axios/Backend
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error(
          `❌ [STORE-ERROR] Código de estado HTTP: ${error.response.status}`
        );
        console.error(
          "❌ [STORE-ERROR] Respuesta del servidor:",
          error.response.data
        );

        // Si el backend devolvió el campo 'debugInfo' que agregamos:
        if (error.response.data && error.response.data.debugInfo) {
          errorMessage = `Error de DB: ${error.response.data.debugInfo}`;
        } else if (error.response.data && error.response.data.message) {
          // Si el backend devolvió un mensaje de error simple
          errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          errorMessage = "Error interno del servidor (Revisar logs de Node.js)";
        }
      } else if (error.request) {
        // La solicitud fue enviada pero no hubo respuesta (ej. servidor no responde)
        errorMessage =
          "No se recibió respuesta del servidor. (Revisar conexión)";
      }

      // Devolver el objeto de error mejorado al componente Vue
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Función para eliminar un registro local (EmployeeDetails)
  async function deleteEmployeeDetail(employeeNumber) {
    try {
      const response = await api.delete(
        `/deleteEmployeeDetail/${employeeNumber}`
      );

      // Notificación de éxito
      Notify.create({
        type: "positive",
        message: response.data.message,
      });

      return true; // Indica éxito
    } catch (error) {
      console.error("Error al eliminar el registro:", error);

      let errorMessage = "Error desconocido al eliminar el registro.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data; // Mensaje del backend
      }

      // Notificación de error
      Notify.create({
        type: "negative",
        message: errorMessage,
      });

      return false; // Indica fallo
    }
  }

  const updateEmployee = async (employeeNumber, fullName, description) => {
    // 1. Prepara el objeto de datos que se enviará
    const payload = {
      employeeNumber,
      fullName,
      description,
    };

    // 2. AÑADIDO: Log para verificar los datos enviados
    console.log(
      "🚀 Enviando datos para actualización de empleado a /employee/update:",
      payload
    );

    try {
      const response = await api.post("/employee/update", payload);

      // Opcional: Puedes también loggear la respuesta de la API para confirmar el éxito
      console.log("✅ Respuesta exitosa de la API:", response.data);

      Notify.create({
        type: "positive",
        message: response.data.message || "Empleado actualizado correctamente",
      });

      return response.data;
    } catch (err) {
      console.error("❌ Error al actualizar empleado:", err);

      // Log extra para ver el error completo (útil si el servidor devuelve un cuerpo de error)
      if (err.response) {
        console.error(
          "Detalles del error de la API (response):",
          err.response.data
        );
      }

      Notify.create({
        type: "negative",
        message: "No se pudo actualizar el empleado",
      });
      throw err;
    }
  };

  /**
   * Obtiene las métricas de captura del servidor para un año y mes específicos.
   * @param {number} year - Año a consultar (ej. 2025).
   * @param {number} [month=null] - Mes a consultar (opcional, ej. 10).
   */
  async function fetchMetrics(
    year = currentYear.value,
    month = currentMonth.value
  ) {
    isLoading.value = true;

    // Resetear datos
    monthlyData.value = [];
    weeklyData.value = [];
    dailyData.value = [];

    const url = `/captures-metrics`;
    const params = { year };
    if (month !== null) params.month = month;

    // LOG: solicitud
    console.log(
      `[Store Metrics] Llamando a API. Params: ${JSON.stringify(params)}`
    );

    try {
      const response = await api.get(url, { params });

      // LOG: respuesta completa del servidor
      console.log(
        "[Store Metrics] Respuesta completa del servidor:",
        response.data
      );

      const { data } = response.data;

      // Asignar datos a los estados
      monthlyData.value = data.monthly;
      weeklyData.value = data.weekly;
      dailyData.value = data.daily;

      // LOG: resumen de los datos
      console.log(`[Store Metrics] Resumen de datos recibidos:`);
      console.log("Mensual:", monthlyData.value);
      console.log("Semanal:", weeklyData.value);
      console.log("Diario:", dailyData.value);

      console.log(
        `[Store Metrics] Cantidad de registros -> Mensual=${monthlyData.value.length}, Semanal=${weeklyData.value.length}, Diario=${dailyData.value.length}`
      );

      // Actualizar año/mes
      currentYear.value = year;
      currentMonth.value = month;
    } catch (error) {
      console.error("Error al obtener métricas del servidor:", error);

      Notify.create({
        type: "negative",
        message: "Error al cargar las métricas. Inténtalo de nuevo.",
        caption: error.response?.data?.message || "Error de conexión.",
      });
    } finally {
      isLoading.value = false;
    }
  }

  const getJobsByProductionDate = async (
    productionDate,
    stationName = null,
    stationType = null
  ) => {
    console.log("🟢 [getJobsByDate] Parámetros recibidos:", {
      productionDate,
      stationName,
      stationType,
    });

    if (!productionDate) {
      Notify.create({
        type: "negative",
        message: "La fecha de producción es obligatoria.",
      });
      return [];
    }

    try {
      const params = {
        productionDate,
        ...(stationName && { stationName }),
        ...(stationType && { stationType }),
      };

      console.log(
        "📡 [getJobsByDate] Llamada GET a /getJobsByProductionDate con:",
        params
      );

      const response = await api.get("/getJobsByProductionDate", { params });

      console.log("🎉 [getJobsByDate] Respuesta recibida:", response.data);

      jobsByDateResults.value = response.data;
      return response.data;
    } catch (error) {
      console.error("❌ [getJobsByDate] Error:", error);
      Notify.create({
        type: "negative",
        message: "Error al obtener el detalle de los jobs.",
        position: "top",
      });
      return [];
    }
  };

  // 2️⃣ Obtener el reporte de trabajos abiertos
  const fetchOpenJobs = async () => {
    console.log("📡 Fetching open jobs from server...");
    try {
      // Llamamos a la nueva ruta
      const response = await api.get("/getOpenJobs");
      const jobs = response.data;

      // 👇 AGREGADO: Ver los resultados exactos que manda el backend
      console.log("📄 Resultados crudos de /getOpenJobs:", jobs);
      // Opcional: Si quieres verlo como una tabla bonita en consola
      // console.table(jobs);

      if (jobs && jobs.length > 0) {
        // Asignamos la respuesta a nuestra variable reactiva
        openJobsList.value = jobs;
        console.log(`✅ ${jobs.length} open jobs fetched from server.`);
      } else {
        openJobsList.value = []; // Limpiamos si no hay datos
        console.warn("⚠️ No open jobs found currently.");
      }

      return jobs;
    } catch (error) {
      console.error("❌ Error fetching open jobs from server:", error);

      // Usamos Notify.create en lugar de $q.notify para stores de Pinia
      Notify.create({
        type: "negative",
        message: "Error al obtener el reporte de la línea de producción",
      });

      return null;
    }
  };

  // 3️⃣ Pausar / Reanudar producción
  const pauseProduction = async (recordId) => {
    console.log(`⏸️ Sending pause request for recordId: ${recordId}`);

    try {
      const response = await api.post("/production/pause", {
        recordId,
      });

      const result = response.data;

      if (result.success) {
        console.log("✅ Estado actualizado correctamente (toggle pausa)");

        Notify.create({
          type: "positive",
          message: "Estado actualizado correctamente",
        });

        return true;
      } else {
        console.warn("⚠️ No se pudo actualizar:", result.message);

        Notify.create({
          type: "warning",
          message: result.message || "No se pudo actualizar el estado",
        });

        return false;
      }
    } catch (error) {
      console.error("❌ Error al pausar/reanudar:", error);

      Notify.create({
        type: "negative",
        message: "Error al cambiar el estado de pausa",
      });

      return false;
    }
  };

  // 4️⃣ Completar producción (con soporte para cycleMinutes)
  const completeProduction = async (
    recordId,
    terminalA,
    terminalB,
    cycleMinutes = null
  ) => {
    console.log(
      `✅ Sending complete request | recordId: ${recordId}, cycleMinutes: ${cycleMinutes}`
    );

    try {
      const response = await api.post("/production/complete", {
        recordId,
        terminalA,
        terminalB,
        cycleMinutes, // 👈 opcional, si es null no afecta backend
      });

      const result = response.data;

      if (result.success) {
        console.log("✅ Producción completada correctamente");

        Notify.create({
          type: "positive",
          message: "Producción completada correctamente",
        });

        return true;
      } else {
        console.warn("⚠️ No se pudo completar:", result.message);

        Notify.create({
          type: "warning",
          message: result.message || "No se pudo completar el registro",
        });

        return false;
      }
    } catch (error) {
      console.error("❌ Error al completar producción:", error);

      Notify.create({
        type: "negative",
        message: "Error al completar la producción",
      });

      return false;
    }
  };

  return {
    // state
    stationOptions,
    reporteCapturas,
    reporteTurnos,
    downtimeResults,
    totalMinutos,
    TitleStartDate,
    TitleEndDate,
    startDate,
    endDate,
    getempresponse,
    monthlyData,
    weeklyData,
    dailyData,
    isLoading,
    currentYear,
    currentMonth,
    jobsByDateResults,
    openJobsList,

    // actions
    StationOptions,
    ReporteCapturas,
    ReporteTurnos,
    getDownTimeSummary,
    fetchDownTimeSummary,
    fetchEmployee,
    insertEmployee,
    deleteEmployeeDetail,
    updateEmployee,
    fetchMetrics,
    getJobsByProductionDate,
    fetchOpenJobs,
    pauseProduction,
    completeProduction,
  };
});
