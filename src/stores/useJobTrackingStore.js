import { defineStore } from "pinia";
import i18n from "src/i18n";
import { Notify } from "quasar";
import { api } from "src/boot/axios";
import { ref } from "vue";

export const useJobTrackingStore = defineStore("jobTracking", () => {
  const t = i18n.global.t;

  const searchResult = ref([]);
  const loadingSearch = ref(false);
  const loadingReport = ref(false);
  const searchError = ref(null);

  const fetchJobDetails = async (jobNumber) => {
    if (!jobNumber) return;

    loadingSearch.value = true;

    searchError.value = null;
    searchResult.value = [];

    try {
      const response = await api.get(`/reports/job-details/${jobNumber}`);

      if (response.data) {
        searchResult.value = Array.isArray(response.data)
          ? response.data
          : [response.data];
      } else {
        searchResult.value = [];
        Notify.create({
          type: "warning",
          message: t("storeNotify.no_results"),
          position: "top",
        });
      }
    } catch (error) {
      searchError.value = error.message;
      console.error("Error en fetchJobDetails:", error);

      Notify.create({
        type: "negative",
        message: t("storeNotify.search_error"),
        position: "top",
      });
    } finally {
      loadingSearch.value = false;
    }
  };

  const fetchWeeklyReport = async (from, to) => {
    loadingSearch.value = true;
    try {
      console.log("fetchWeeklyReport called with:", { from, to });
      const response = await api.get("/reports/weekly-report", {
        params: { from, to },
      });

      if (response.data) {
        searchResult.value = response.data;
        return response.data;
      }
    } catch (error) {
      console.error("Error en fetchWeeklyReport:", error.response.data);
      Notify.create({
        type: "negative",
        message: t("storeNotify.search_error"),
        position: "top",
      });
    } finally {
      loadingSearch.value = false;
    }
  };

  const resetSearchState = () => {
    searchResult.value = [];
    searchError.value = null;
    loadingSearch.value = false;
  };

  return {
    searchResult,
    loadingSearch,
    loadingReport,
    searchError,
    fetchWeeklyReport,
    fetchJobDetails,
    resetSearchState,
  };
});
