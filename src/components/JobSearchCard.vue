<template>
  <div class="col-xs-12 col-md-3">
    <q-card flat bordered class="job-card-static">
      <q-card-section class="q-pa-sm">
        <div class="search-label text-weight-bold q-mb-xs">
          <q-icon name="search" color="primary" size="16px" class="q-mr-xs" />
          {{ $t("configuration.searchTitle") }}
        </div>

        <q-input
          v-model="searchQuery"
          :placeholder="$t('configuration.searchPlaceholder')"
          outlined
          square
          dense
          color="primary"
          class="slim-square-input"
          @keyup.enter="handleSearch"
        >
          <template v-slot:append>
            <q-btn
              dense
              flat
              icon="arrow_forward"
              color="primary"
              @click="handleSearch"
              class="search-btn-compact"
            />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showSearchDialog" backdrop-filter="blur(4px)">
      <q-card style="width: 1200px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary flex items-center">
            <q-icon name="analytics" class="q-mr-sm" />
            {{ $t("configuration.jobDetails") }} {{ searchQueryCopy }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-table
            flat
            bordered
            :rows="reportStore.searchResult"
            :columns="dynamicColumns"
            row-key="JobNumber"
            dense
            :pagination="{ rowsPerPage: 0 }"
            hide-bottom
            class="modern-table"
          >
            <template v-slot:body-cell="props">
              <q-td :props="props">
                <div
                  v-if="
                    props.value &&
                    props.value !== 'NULL' &&
                    String(props.value).trim() !== ''
                  "
                >
                  <div
                    v-for="(item, index) in String(props.value).split(',')"
                    :key="index"
                    :class="[
                      'trace-item-data',
                      isLastActiveStation(props.row, props.col.name)
                        ? 'last-station-highlight'
                        : '',
                    ]"
                  >
                    <div class="row no-wrap items-center">
                      <q-icon
                        :name="
                          isLastActiveStation(props.row, props.col.name)
                            ? 'stars'
                            : 'chevron_right'
                        "
                        :color="
                          isLastActiveStation(props.row, props.col.name)
                            ? 'blue-9'
                            : 'green-7'
                        "
                        size="14px"
                        v-if="props.col.name !== 'JobNumber'"
                      />
                      <span
                        :class="[
                          'text-caption text-weight-medium',
                          isLastActiveStation(props.row, props.col.name)
                            ? 'text-blue-10'
                            : 'text-green-10',
                        ]"
                      >
                        {{ item.trim() }}
                      </span>
                    </div>

                    <div
                      v-if="isLastActiveStation(props.row, props.col.name)"
                      class="last-station-label text-weight-bolder"
                    >
                      {{ $t("configuration.lastStation") }}
                    </div>
                  </div>
                </div>

                <div v-else class="empty-data-container">
                  <span class="text-weight-bolder text-red-14">--</span>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md border-top">
          <q-btn
            flat
            :label="$t('common.close')"
            color="grey-7"
            v-close-popup
          />
          <q-btn
            unelevated
            color="primary"
            :label="$t('configuration.update')"
            @click="handleSearch"
            icon="refresh"
            :loading="reportStore.loadingSearch"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useJobTrackingStore } from "src/stores/useJobTrackingStore";
import * as XLSX from "xlsx-js-style";
import dayjs from "dayjs";

const reportStore = useJobTrackingStore();
const searchQuery = ref("");
const searchQueryCopy = ref("");
const showSearchDialog = ref(false);

const dynamicColumns = computed(() => {
  if (reportStore.searchResult.length === 0) return [];

  const firstRow = reportStore.searchResult[0];
  return Object.keys(firstRow).map((key) => ({
    name: key,
    label: key === "JobNumber" ? "Job #" : key,
    field: key,
    align: key === "JobNumber" ? "left" : "center",
    sortable: true,
  }));
});

const isLastActiveStation = (row, colName) => {
  if (colName === "JobNumber") return false;

  const stationColumns = dynamicColumns.value
    .map((c) => c.name)
    .filter((name) => name !== "JobNumber");

  const activeStations = stationColumns.filter((name) => {
    const val = row[name];
    return val && val !== "NULL" && String(val).trim() !== "";
  });

  if (activeStations.length === 0) return false;

  return activeStations[activeStations.length - 1] === colName;
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  searchQueryCopy.value = searchQuery.value;
  await reportStore.fetchJobDetails(searchQuery.value);
  showSearchDialog.value = true;
};
</script>

<style scoped>
.job-card-static {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  max-width: 350px;
}
.search-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #757575;
  display: flex;
  align-items: center;
}
.slim-square-input :deep(.q-field__control) {
  height: 40px;
  min-height: 28px;
  border-radius: 0px !important;
}
.slim-square-input :deep(.q-field__native) {
  font-size: 12px;
  padding: 0;
}
.slim-square-input :deep(.q-field__append) {
  height: 28px;
  min-height: 28px;
}
.search-btn-compact {
  padding: 0;
  min-height: 24px;
}
.modern-table :deep(thead tr th) {
  font-weight: bold;
  background-color: #f8f9fa;
  color: #1976d2;
  position: sticky;
  top: 0;
  z-index: 1;
}
.modern-table :deep(tbody td) {
  border-right: 1px solid #f0f0f0;
  vertical-align: top;
  padding: 8px 4px;
}
.trace-item-data {
  margin-bottom: 4px;
  padding: 4px 6px;
  background-color: #e8f5e9;
  border-radius: 4px;
  border: 1px solid #c8e6c9;
  position: relative;
  transition: all 0.3s ease;
}
.last-station-highlight {
  background-color: #e3f2fd !important;
  border: 1px solid #90caf9 !important;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
}
.last-station-label {
  font-size: 8px;
  color: #1565c0;
  margin-top: 2px;
  text-align: right;
  letter-spacing: 0.3px;
}
.empty-data-container {
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  padding: 4px;
  text-align: center;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.border-top {
  border-top: 1px solid #eeeeee;
}
</style>
