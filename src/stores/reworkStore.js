// src/stores/reworkStore.js
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useStationStore } from "src/stores/Station";
import { useProductionStore } from "./productionStore";
import { api } from "src/boot/axios";
import { Notify } from "quasar";

export const useReworkStore = defineStore("rework", () => {
  // Referencia al store de estación
  const stationStore = useStationStore();
  const isConfigured = computed(() => stationStore.isStationConfigured);
  const stationType = computed(() => stationStore.stationType);
  const reworkEntries = ref([]);
  // Lista reactiva de defectos
  const defects = ref([]);

  /**
   * @action loadDefects
   * @description Carga los defectos para el tipo de estación actual
   */
  const loadDefects = async () => {
    if (!isConfigured.value || !stationType.value) {
      defects.value = [];
      return;
    }
    try {
      const res = await api.get(`/defects/${stationType.value}`);
      defects.value = res.data;
    } catch (err) {
      console.error(
        `Error al cargar defectos para StationType="${stationType.value}":`,
        err
      );
      Notify.create({
        message: `Error al cargar defectos: ${err.message}`,
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 3000,
      });
      defects.value = [];
    }
  };

  // Recarga defectos al cambiar configuración o tipo de estación
  watch([isConfigured, stationType], loadDefects, { immediate: true });

  /**
   * @action createReworkEntries
   * @description Registra en lote las terminales+defectos para un cable usando el SP dbo.ReworkProdPart
   * @param {Object} payload
   * @param {number} payload.prodPartId — ID en T_ProdPart
   * @param {Array}  payload.entries    — Array de { defectId, terminalNumber, terminalSide }
   * @returns {Promise<{ success: boolean, rowsUpdated: number, rowsInserted: number, message: string }>}
   */
  const createReworkEntries = async ({
    prodPartId,
    MES_SelectedStation,
    entries,
  }) => {
    // Validación básica
    if (!prodPartId || !Array.isArray(entries) || entries.length === 0) {
      Notify.create({
        message: "No hay datos de retrabajo para procesar.",
        color: "warning",
        icon: "warning",
        position: "top",
        timeout: 3000,
      });
      return {
        success: false,
        rowsUpdated: 0,
        rowsInserted: 0,
        message: "No hay datos de retrabajo para procesar.",
      };
    }

    // 1) Obtenemos el número de conectores desde el store de producción
    const { productionRows } = useProductionStore();
    const record = productionRows.find((r) => r.id === prodPartId);
    const numberOfConnectors = record?.numberOfConnectors ?? null;
    const numberOfConnectorsB = record?.numberOfConnectorsB ?? null;

    try {
      // 2) Serializar entries (si tu backend espera JSON en NVARCHAR)
      const jsonEntries = JSON.stringify(entries);

      // 3) Enviar ProdPartId, numberOfConnectors y Entries al endpoint
      const res = await api.post("/rework/registerAll", {
        ProdPartId: prodPartId,
        MES_SelectedStation: MES_SelectedStation,
        numberOfConnectors,
        numberOfConnectorsB,
        Entries: jsonEntries,
      });

      // 4) Leer respuesta del servidor
      const { success = false, rowsUpdated = 0, rowsInserted = 0 } = res.data;

      const message = success
        ? "Retrabajo registrado correctamente."
        : "No se registró ningún nuevo retrabajo (quizá ya estaba marcado).";

      // 5) Notificación de resultado
      Notify.create({
        message,
        color: success ? "positive" : "info",
        icon: success ? "check" : "info",
        position: "top",
        timeout: 3000,
      });

      // 6) Refrescar producción para ver nuevo status si quieres
      if (success) {
        await useProductionStore().loadProductionData();
      }

      return { success, rowsUpdated, rowsInserted, message };
    } catch (error) {
      console.error("Error al crear retrabajos batch:", error);
      Notify.create({
        message: `Error al registrar retrabajos: ${
          error.response?.data?.message || error.message
        }`,
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 5000,
      });
      return {
        success: false,
        rowsUpdated: 0,
        rowsInserted: 0,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  /**
   * @action loadReworkEntries
   * @description Trae de la DB todos los registros de T_Reworks para un ProdPartId,
   *              incluyendo la descripción desde M_Defects.
   */
  const loadReworkEntries = async ({
    jobNumberId = null,
    prodPartId = null,
  } = {}) => {
    // ⭐️ LOG 1: Muestra los valores recibidos por la acción.
    console.log("-> loadReworkEntries recibiendo:", {
      jobNumberId,
      prodPartId,
    });

    // si no viene ninguno, limpia y sal
    if (jobNumberId == null && prodPartId == null) {
      reworkEntries.value = [];
      return;
    }

    const params = {};
    if (jobNumberId != null) params.JobNumberId = Number(jobNumberId);
    if (prodPartId != null) params.ProdPartId = Number(prodPartId);

    // ⭐️ LOG 2: Muestra los parámetros de la API finalizados.
    console.log("-> Parámetros de la API a enviar:", params);

    try {
      const { data } = await api.get("/rework/entries", {
        params,
        // asegura que axios no serialice arrays/objetos con índices
        paramsSerializer: { indexes: null },
      });
      // data = [{ id, defect, terminalNumber, terminalSide, regDate }, …]
      reworkEntries.value = data;

      // ⭐️ LOG 3 (Opcional pero útil): Muestra la data devuelta por el API.
      console.log(
        "<- Datos de retrabajo cargados correctamente:",
        data.length,
        "registros."
      );
    } catch (err) {
      console.error("Error al cargar entradas de retrabajo:", err);
      Notify.create({
        message: `No se pudieron cargar retrabajos: ${err.message}`,
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 3000,
      });
      reworkEntries.value = [];
    }
  };

  /**
   * Actualiza el estado de una entrada de retrabajo en el backend y localmente.
   * @param {object} payload
   * @param {number} payload.id     - ID de la entrada.
   * @param {number} payload.status - Nuevo estado.
   */
  async function setReworkEntryStatus({ id, MES_SelectedStation }) {
    await api.post("/rework/entry/status", { id, MES_SelectedStation });
    // Actualiza localmente para feedback inmediato
    const idx = reworkEntries.value.findIndex((e) => e.id === id);
    if (idx !== -1) reworkEntries.value[idx].status = status;
  }

  return {
    defects,
    loadDefects,
    createReworkEntries,
    reworkEntries,
    loadReworkEntries,
    setReworkEntryStatus,
  };
});
