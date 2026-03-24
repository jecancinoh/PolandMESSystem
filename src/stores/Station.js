// src/stores/Station.js
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { api } from "src/boot/axios";

export const useStationStore = defineStore("station", () => {
  const $q = useQuasar();

  // --- Estado inicial sincronizado con localStorage ---
  const selectedArea = ref(
    localStorage.getItem("MES_SelectedArea") != null
      ? Number(localStorage.getItem("MES_SelectedArea"))
      : null
  );
  const selectedLine = ref(
    localStorage.getItem("MES_SelectedLine") != null
      ? Number(localStorage.getItem("MES_SelectedLine"))
      : null
  );
  const selectedStation = ref(
    localStorage.getItem("MES_SelectedStation") != null
      ? Number(localStorage.getItem("MES_SelectedStation"))
      : null
  );

  // Opciones de select
  const areaOptions = ref([]);
  const lineOptions = ref([]);
  const stationOptions = ref([]);

  // Información de la estación
  const stationName = ref("");
  const stationType = ref(null);
  const isStationConfigured = ref(false);
  const stationDescription = ref("");

  // Control de múltiples escaneos pendientes
  const MultipleScanAllowed = ref(
    JSON.parse(localStorage.getItem("MES_MultipleScanAllowed") || "false")
  );

  // Computeds
  const getStationName = computed(() => {
    const st = stationOptions.value.find((s) => s.ID === selectedStation.value);
    return st ? st.Station : "";
  });

  const showEpoxyBtn = computed(() => stationName.value.includes("xxx"));

  // --- Métodos para cargar datos ---

  const fetchAreasFromDb = async ($qInstance) => {
    try {
      const res = await api.get("/areas");
      areaOptions.value = res.data.map((item) => ({
        ID: item.Id,
        Area: item.AreaName,
      }));
      if (
        selectedArea.value != null &&
        !areaOptions.value.some((opt) => opt.ID === selectedArea.value)
      ) {
        selectedArea.value = null;
      }
    } catch (e) {
      console.error(e);
      $qInstance.notify({
        type: "negative",
        message: `Error al cargar áreas.`,
      });
    }
  };

  const fetchLinesFromDb = async (areaId, $qInstance) => {
    try {
      const res = await api.get(`/lines/${areaId}`);
      lineOptions.value = res.data.map((item) => ({
        ID: item.Id,
        Line: item.LineName,
      }));
      if (
        selectedLine.value != null &&
        !lineOptions.value.some((opt) => opt.ID === selectedLine.value)
      ) {
        selectedLine.value = null;
      }
    } catch (e) {
      console.error(e);
      $qInstance.notify({
        type: "negative",
        message: `Error al cargar líneas para área ${areaId}.`,
      });
    }
  };

  const fetchStationsFromDb = async (lineId, $qInstance) => {
    try {
      const res = await api.get(`/stations/${lineId}`);
      stationOptions.value = res.data.map((item) => ({
        ID: item.Id,
        Station: item.StationName,
        Description: item.Description,
        Production_Order: item.Production_Order,
        label: `${item.StationName} - ${item.Description}`,

        MultipleScan:
          item.MultipleScan === true ||
          item.MultipleScan === "true" ||
          item.MultipleScan === 1,
        StationType: item.StationType,
      }));
      if (
        selectedStation.value != null &&
        !stationOptions.value.some((opt) => opt.ID === selectedStation.value)
      ) {
        selectedStation.value = null;
      }
    } catch (e) {
      console.error(e);
      $qInstance.notify({
        type: "negative",
        message: `Error al cargar estaciones para línea ${lineId}.`,
      });
    }
  };

  // Watcher: actualiza MultipleScanAllowed cuando cambia la estación seleccionada
  watch(selectedStation, (stationId) => {
    const station = stationOptions.value.find((s) => s.ID === stationId);
    const allowed = !!station?.MultipleScan;
    MultipleScanAllowed.value = allowed;
    localStorage.setItem("MES_MultipleScanAllowed", String(allowed));

    stationName.value = station?.Station ?? "";
    stationType.value = station?.StationType ?? null;
    stationDescription.value = station?.Description ?? "";

    //  Si la estación no contiene "PRP", limpia todas las claves de Epoxy
    if (!(stationName.value || "").includes("PRP")) {
      [
        "EpoxylotA",
        "EpoxylotB",
        "serialEpoxyNo",
        "EpoxyexpirationDate",
        "EpoxyTimerStart",
        "MES_EpoxyId",
      ].forEach((k) => localStorage.removeItem(k));
    }
  });

  const initializeStationState = async ($qInstance) => {
    const savedConfig = localStorage.getItem("MES_IsStationConfigured");
    if (savedConfig) {
      isStationConfigured.value = JSON.parse(savedConfig);
    }

    if (selectedArea.value != null && areaOptions.value.length === 0) {
      await fetchAreasFromDb($qInstance);
    }
    if (selectedLine.value != null && lineOptions.value.length === 0) {
      await fetchLinesFromDb(selectedArea.value, $qInstance);
    }
    if (selectedStation.value != null) {
      await fetchStationsFromDb(selectedLine.value, $qInstance);
      const station = stationOptions.value.find(
        (s) => s.ID === selectedStation.value
      );
      const allowed = !!station?.MultipleScan;
      MultipleScanAllowed.value = allowed;
      localStorage.setItem("MES_MultipleScanAllowed", String(allowed));

      stationName.value = station?.Station ?? "";
      stationType.value = station?.StationType ?? null;
      stationDescription.value = station?.Description ?? "";
    }
  };

  // Setters que sincronizan con localStorage
  const setSelectedArea = (areaId) => {
    selectedArea.value = areaId;
    localStorage.setItem("MES_SelectedArea", String(areaId));
  };
  const setSelectedLine = (lineId) => {
    selectedLine.value = lineId;
    localStorage.setItem("MES_SelectedLine", String(lineId));
  };
  const setSelectedStation = (stationId) => {
    selectedStation.value = stationId;
    localStorage.setItem("MES_SelectedStation", String(stationId));
  };
  const setStationName = (name) => {
    stationName.value = name;
  };

  // Enviar Estacion prefix a server.js
  const sendStationPrefixToServer = async () => {
    const stationPrefix = stationName.value.slice(0, 3);
    try {
      const response = await api.get(`/api/etq-docs/${stationPrefix}`);
      console.log("Respuesta del servidor:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al enviar el prefijo de la estación:", error);
      throw error;
    }
  };

  const fetchEtqDocsByPrefix = async (prefixOverride) => {
    const prefix = (prefixOverride ?? stationName.value ?? "").slice(0, 3);
    const { api } = await import("boot/axios");
    const { data } = await api.get(`/etq-docs/${prefix}`);
    return Array.isArray(data) ? data : [];
  };

  return {
    selectedArea,
    selectedLine,
    selectedStation,
    stationDescription,
    areaOptions,
    lineOptions,
    stationOptions,
    stationName,
    stationType,
    isStationConfigured,
    MultipleScanAllowed,
    getStationName,
    showEpoxyBtn,
    fetchAreasFromDb,
    fetchLinesFromDb,
    fetchStationsFromDb,
    initializeStationState,
    setSelectedArea,
    setSelectedLine,
    setSelectedStation,
    setStationName,
    sendStationPrefixToServer,
    fetchEtqDocsByPrefix,
  };
});
