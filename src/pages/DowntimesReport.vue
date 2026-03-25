<template>
  <q-layout view="lHh LpR lFf">
    <!-- Drawer lateral para filtros -->
    <q-drawer
      side="left"
      show-if-above
      v-model="drawer"
      bordered
      :width="240"
      class="bg-white column q-pa-md modern-drawer"
      behavior="desktop"
    >
      <!-- Título -->
      <div
        class="text-h6 text-weight-bolder text-primary flex items-center justify-center q-mb-md q-pt-xl"
      >
        <q-icon name="tune" color="primary" size="28px" class="q-mr-sm" />
        {{ $t("configuration.drawerTitle") }}
      </div>

      <q-separator spaced="md" />

      <!-- Contenido -->
      <div class="q-mt-sm">
        <q-input
          v-model="start"
          :label="$t('Downtimes.date1')"
          clearable
          type="date"
          outlined
          dense
          class="modern-input q-mb-md"
        />

        <q-input
          v-model="end"
          :label="$t('Downtimes.date2')"
          clearable
          type="date"
          outlined
          dense
          class="modern-input q-mb-lg"
          :min="start"
        />

        <q-btn
          :label="$t('Downtimes.query')"
          color="primary"
          icon="fact_check"
          @click="fetchSummary"
          class="full-width modern-btn rounded-btn"
          :loading="isLoading"
          :disable="isLoading"
        />
      </div>

      <q-space />

      <!-- Reloj -->
      <div class="q-mt-lg">
        <div
          class="fecha-ajustada text-center text-dark shadowed rounded-borders q-pa-sm"
        >
          <span class="text-bold">{{ fechaFormateada }}</span>
        </div>

        <div
          class="reloj text-center text-white shadowed-modern rounded-borders q-pa-sm q-mt-sm"
        >
          <p class="text-h6 q-ma-none">{{ horaFormateada }}</p>
        </div>
      </div>

      <div>
        <LanguageToggle />
      </div>
    </q-drawer>

    <!-- Página principal -->
    <q-page-container>
      <q-page padding>
        <!-- Overlay de carga con transición -->
        <transition name="fade-overlay">
          <div v-if="isLoading" class="loading-overlay-relative">
            <div class="dual-ring-large"></div>
            <div class="loading-text">{{ $t("Downtimes.upload") }}</div>
          </div>
        </transition>

        <!-- Contenido del REPORTE -->
        <div v-if="downtimeResults.length" class="row items-center q-mb-md">
          <img
            src="/img/AFL.png"
            style="width: 3em; height: 4em; margin-right: 1em"
            alt="Logo AFL"
          />
          <div>
            <div class="text-h4 text-bold text-primary">
              {{ $t("Downtimes.panel") }}
            </div>
            <div class="text-subtitle1 text-grey-7">
              {{ $t("Downtimes.report") }} {{ TitleStartDate }}
              <span v-if="TitleEndDate"> al {{ TitleEndDate }}</span>
            </div>
          </div>
        </div>

        <div v-if="downtimeResults.length">
          <div class="row q-col-gutter-lg q-mb-lg">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="q-pa-md rounded-borders kpi-card">
                <q-card-section horizontal class="items-center">
                  <q-icon
                    name="timeline"
                    size="40px"
                    color="primary"
                    class="q-mr-md"
                  />
                  <div class="column">
                    <div class="text-caption text-grey-6">
                      {{ $t("Downtimes.total1") }}
                    </div>
                    <div class="text-h5 text-weight-bold text-primary">
                      {{ totalDowntimeMinutes }}
                    </div>
                  </div>
                  <q-space />
                  <div class="column items-end">
                    <q-badge
                      color="primary"
                      text-color="white"
                      class="q-px-sm q-py-xs"
                    >
                      <q-icon
                        name="format_list_numbered"
                        size="14px"
                        class="q-mr-xs"
                      />
                      {{ downtimeResults.length }} {{ $t("Downtimes.reg") }}
                    </q-badge>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="q-pa-md rounded-borders kpi-card">
                <q-card-section horizontal class="items-center">
                  <q-icon
                    name="done_all"
                    size="40px"
                    color="positive"
                    class="q-mr-md"
                  />
                  <div class="column">
                    <div class="text-caption text-grey-6">
                      {{ $t("Downtimes.min") }}
                    </div>
                    <div class="text-h5 text-weight-bold text-positive">
                      {{ totalJustifiedDowntimeMinutes }}
                    </div>
                  </div>
                  <q-space />
                  <div class="column items-end">
                    <q-badge
                      color="positive"
                      text-color="white"
                      class="q-px-sm q-py-xs"
                    >
                      <q-icon name="percent" size="14px" class="q-mr-xs" />
                      {{ justifiedPercentage }}
                    </q-badge>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="q-pa-md rounded-borders kpi-card">
                <q-card-section horizontal class="items-center">
                  <q-icon
                    name="gavel"
                    size="40px"
                    color="negative"
                    class="q-mr-md"
                  />
                  <div class="column">
                    <div class="text-caption text-grey-6">
                      {{ $t("Downtimes.minunjust") }}
                    </div>
                    <div class="text-h5 text-weight-bold text-negative">
                      {{ totalUnjustifiedDowntimeMinutes }}
                    </div>
                  </div>
                  <q-space />
                  <div class="column items-end">
                    <q-badge
                      color="negative"
                      text-color="white"
                      class="q-px-sm q-py-xs"
                    >
                      <q-icon name="warning" size="14px" class="q-mr-xs" />
                      {{ countNullDTID }} {{ $t("Downtimes.reg") }}
                    </q-badge>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="q-pa-md rounded-borders kpi-card">
                <q-card-section horizontal class="items-center">
                  <q-icon
                    name="pending_actions"
                    size="40px"
                    color="warning"
                    class="q-mr-md"
                  />
                  <div class="column">
                    <div class="text-caption text-grey-6">
                      {{ $t("Downtimes.opendowntimes") }}
                    </div>
                    <div class="text-h5 text-weight-bold text-warning">
                      {{ countOpenDowntimes }}
                    </div>
                  </div>
                  <q-space />
                  <div class="column items-end">
                    <q-badge
                      color="warning"
                      text-color="dark"
                      class="q-px-sm q-py-xs"
                    >
                      <q-icon name="lock_open" size="14px" class="q-mr-xs" />
                      {{ $t("Downtimes.close") }}
                    </q-badge>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Resumen general de Downtime en todas las estaciones -->
        <section v-if="downtimeResults.length" class="q-mb-lg">
          <q-card class="q-pa-md rounded-borders shadow-4">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-primary q-mb-sm">
                {{ $t("Downtimes.breakdown") }}
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <div class="text-subtitle1 text-weight-bold q-mb-sm">
                    {{ $t("Downtimes.shift") }}
                  </div>
                  <div class="column q-gutter-sm chips-container">
                    <q-chip
                      v-for="shift in availableOverallShifts"
                      :key="shift"
                      clickable
                      size="sm"
                      :selected="selectedOverallShift === shift"
                      color="primary"
                      text-color="white"
                      outline
                      class="text-weight-bold shift-chip chip-center"
                      @click="
                        selectedOverallShift = shift;
                        generateOverallDowntimeChart();
                      "
                    >
                      {{ shift }}
                    </q-chip>
                  </div>
                </div>

                <div class="col-12 col-md-9 row q-col-gutter-md">
                  <div class="col-12 col-lg-7">
                    <div
                      id="overallDowntimeChart"
                      style="width: 100%; height: 400px"
                    ></div>
                  </div>

                  <div
                    class="col-12 col-lg-5"
                    style="max-height: 400px; overflow-y: auto; padding: 0"
                    v-html="sidebarTableHtmlContent"
                  ></div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </section>

        <div v-if="downtimeResults.length" class="row q-col-gutter-lg q-mb-lg">
          <div class="col-12 col-md-6">
            <q-card class="q-pa-md rounded-borders shadow-4">
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">
                  {{ $t("Downtimes.tendencia") }}
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div
                  id="overallDowntimeChart2"
                  style="width: 100%; height: 350px"
                ></div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card class="q-pa-md rounded-borders shadow-4">
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">
                  {{ $t("Downtimes.station") }}
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div
                  id="overallDowntimeChartStation"
                  style="width: 100%; height: 350px"
                ></div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-separator
          v-if="downtimeResults.length"
          spaced="lg"
          color="blue-grey-5"
          size="2px"
          inset="16px"
        />

        <!-- Sección resumen por línea y estación -->
        <section class="downtime-summary" v-if="downtimeResults.length">
          <div
            v-for="(stationsByLine, line) in groupedByLineWithTurns"
            :key="line"
            class="line-group q-pa-md q-mb-xl rounded-borders shadow-2 bg-white"
          >
            <!-- Encabezado -->
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center" style="gap: 1em">
                <q-avatar size="60px" rounded>
                  <img src="/img/AFL.png" alt="Logo AFL" />
                </q-avatar>
                <div>
                  <div class="text-h5 text-weight-bold text-primary">
                    {{ line }}
                  </div>
                  <div class="text-subtitle2 text-grey-7">
                    {{ $t("Downtimes.rango") }}
                    <span class="text-weight-medium text-dark">
                      {{ TitleStartDate }}
                      <span v-if="TitleEndDate"> a {{ TitleEndDate }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- KPIs de la línea -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-sm-6 col-md-3">
                <q-card class="kpi-card q-py-sm q-px-md">
                  <q-card-section horizontal class="items-center q-pa-none">
                    <q-icon
                      name="timeline"
                      size="32px"
                      color="primary"
                      class="q-mr-md"
                    />
                    <div class="column">
                      <div class="text-caption text-grey-6 text-no-wrap">
                        {{ $t("Downtimes.total2") }}
                      </div>
                      <div
                        class="text-h6 text-weight-bold text-primary text-no-wrap"
                      >
                        {{ downtimeResults.length }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-sm-6 col-md-3">
                <q-card class="kpi-card q-py-sm q-px-md">
                  <q-card-section horizontal class="items-center q-pa-none">
                    <q-icon
                      name="done_all"
                      size="32px"
                      color="positive"
                      class="q-mr-md"
                    />
                    <div class="column">
                      <div class="text-caption text-grey-6 text-no-wrap">
                        {{ $t("Downtimes.djustify") }}
                      </div>
                      <div
                        class="text-h6 text-weight-bold text-positive text-no-wrap"
                      >
                        {{ downtimeResults.length - countNullDTID }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-sm-6 col-md-3">
                <q-card class="kpi-card q-py-sm q-px-md">
                  <q-card-section horizontal class="items-center q-pa-none">
                    <q-icon
                      name="gavel"
                      size="32px"
                      color="negative"
                      class="q-mr-md"
                    />
                    <div class="column">
                      <div class="text-caption text-grey-6 text-no-wrap">
                        {{ $t("Downtimes.dunjustify") }}
                      </div>
                      <div
                        class="text-h6 text-weight-bold text-negative text-no-wrap"
                      >
                        {{ countNullDTID }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-sm-6 col-md-3">
                <q-card class="kpi-card q-py-sm q-px-md">
                  <q-card-section horizontal class="items-center q-pa-none">
                    <q-icon
                      name="pending_actions"
                      size="32px"
                      color="warning"
                      class="q-mr-md"
                    />
                    <div class="column">
                      <div class="text-caption text-grey-6 text-no-wrap">
                        {{ $t("Downtimes.opendowntimes") }}
                      </div>
                      <div
                        class="text-h6 text-weight-bold text-warning text-no-wrap"
                      >
                        {{ countOpenDowntimes }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <q-separator
              spaced="lg"
              color="blue-grey-5"
              size="2px"
              inset="16px"
            />

            <!-- Estaciones -->
            <div class="station-list">
              <template
                v-for="station in stationsByLine"
                :key="station.StationID"
              >
                <div v-if="station.totalMinutos > 0" class="station-card">
                  <!-- Encabezado -->
                  <div class="station-header">
                    <q-icon
                      name="precision_manufacturing"
                      size="24px"
                      color="primary"
                    />
                    <span class="station-id text-primary q-ml-md">{{
                      station.StationID
                    }}</span>
                  </div>

                  <!-- Total -->
                  <div class="station-total">
                    <q-icon
                      name="timer"
                      size="18px"
                      color="grey-8"
                      class="q-mr-xs"
                    />
                    <span class="text-weight-bold">{{
                      station.totalMinutos
                    }}</span>
                    <span class="text-caption q-ml-xs">
                      {{ $t("Downtimes.totalmin") }}</span
                    >
                  </div>

                  <!-- Desglose -->
                  <div class="turno-breakdown">
                    <template
                      v-for="(valor, turno) in station.turnos"
                      :key="turno"
                    >
                      <div v-if="valor > 0" class="turno-item">
                        <q-icon
                          :name="
                            ['N1', 'N2'].includes(turno)
                              ? 'wb_sunny'
                              : 'bedtime'
                          "
                          :color="
                            ['N1', 'N2'].includes(turno) ? 'amber' : 'indigo-7'
                          "
                          size="16px"
                          class="q-mr-xs"
                        />
                        <span class="text-caption">
                          <strong>{{ turno }}</strong
                          >: {{ valor }} min
                        </span>
                      </div>
                    </template>
                  </div>

                  <!-- Acción -->
                  <div class="station-footer">
                    <q-icon
                      name="bar_chart"
                      size="18px"
                      color="primary"
                      class="q-mr-xs"
                    />
                    <q-btn
                      flat
                      dense
                      color="primary"
                      :label="$t('Downtimes.show')"
                      class="text-weight-bold"
                      @click="openChart(station.StationID)"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </section>

        <!-- 📊 Modal de gráfica -->
        <q-dialog
          v-model="showChartModal"
          persistent
          class="custom-modal-overlay"
          :maximized="false"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-card class="custom-modal-card">
            <!-- Encabezado -->
            <div
              class="custom-modal-header row items-center q-pa-sm bg-primary text-white"
            >
              <img
                src="/img/AFL_Logo.svg"
                style="width: 2.5em; height: 2.5em; margin-right: 1em"
                class="q-mr-sm"
              />
              <div class="text-h5">
                {{ $t("Downtimes.station") }}: {{ selectedStationIdForChart }}
              </div>
              <q-space />
              <q-btn
                icon="close"
                flat
                round
                dense
                color="white"
                @click="showChartModal = false"
              />
            </div>

            <!-- Selector de turno -->
            <q-card-section>
              <div class="q-mb-md row items-center q-gutter-x-md">
                <div class="col">
                  <div class="text-h6 text-weight-bold text-primary q-mb-xs">
                    {{ $t("Downtimes.shift") }}
                  </div>

                  <div class="q-gutter-sm">
                    <q-chip
                      clickable
                      dense
                      :selected="
                        selectedShiftForStationChart === $t('Downtimes.all')
                      "
                      color="primary"
                      text-color="white"
                      @click="
                        selectedShiftForStationChart = $t('Downtimes.all');
                        applyShiftFilterAndRedrawChart();
                      "
                    >
                      {{ $t("Downtimes.all") }}
                    </q-chip>

                    <q-chip
                      v-for="shiftOption in availableShiftsForStationChartFilter.filter(
                        (s) => s !== $t('Downtimes.all')
                      )"
                      :key="shiftOption"
                      clickable
                      dense
                      :selected="selectedShiftForStationChart === shiftOption"
                      color="primary"
                      text-color="white"
                      @click="
                        selectedShiftForStationChart = shiftOption;
                        applyShiftFilterAndRedrawChart();
                      "
                    >
                      {{ shiftOption }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-card-section>

            <!-- Contenedor de la gráfica -->
            <q-card-section>
              <div
                id="stationChartContainer"
                class="custom-chart-container"
              ></div>
            </q-card-section>
          </q-card>
        </q-dialog>

        <q-separator
          spaced="lg"
          color="blue-grey-5"
          size="2px"
          inset="16px"
          v-if="downtimeResults.length"
        />

        <div v-if="downtimeResults.length" class="q-mt-lg">
          <div class="row items-center justify-between q-mb-md">
            <!-- Izquierda: Logo y Título -->
            <div class="row items-center" style="gap: 1em">
              <q-avatar size="60px" rounded>
                <img src="/img/AFL.png" alt="Logo AFL" />
              </q-avatar>
              <div>
                <div class="text-h5 text-weight-bold text-primary">
                  {{ $t("Downtimes.report") }}
                </div>
                <div class="text-subtitle2 text-grey-7 q-mt-xs">
                  ({{ TitleStartDate }}
                  <span v-if="TitleEndDate"> a {{ TitleEndDate }}</span
                  >)
                </div>
              </div>
            </div>

            <!-- Derecha: Botón -->
            <q-btn
              :label="$t('Downtimes.export')"
              color="secondary"
              @click="exportDowntime"
              :disable="!downtimeResultsFetched"
              class="q-mt-sm"
            />
          </div>

          <!-- KPIs de la línea -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="kpi-card q-py-sm q-px-md">
                <q-card-section horizontal class="items-center q-pa-none">
                  <q-icon
                    name="timeline"
                    size="32px"
                    color="primary"
                    class="q-mr-md"
                  />
                  <div class="column">
                    <div class="text-caption text-grey-6 text-no-wrap">
                      {{ $t("Downtimes.total2") }}
                    </div>
                    <div
                      class="text-h6 text-weight-bold text-primary text-no-wrap"
                    >
                      {{ downtimeResults.length }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="kpi-card q-py-sm q-px-md">
                <q-card-section horizontal class="items-center q-pa-none">
                  <q-icon
                    name="done_all"
                    size="32px"
                    color="positive"
                    class="q-mr-md"
                  />
                  <div class="column">
                    <div class="text-caption text-grey-6 text-no-wrap">
                      {{ $t("Downtimes.djustify") }}
                    </div>
                    <div
                      class="text-h6 text-weight-bold text-positive text-no-wrap"
                    >
                      {{ downtimeResults.length - countNullDTID }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="kpi-card q-py-sm q-px-md">
                <q-card-section horizontal class="items-center q-pa-none">
                  <q-icon
                    name="gavel"
                    size="32px"
                    color="negative"
                    class="q-mr-md"
                  />
                  <div class="column">
                    <div class="text-caption text-grey-6 text-no-wrap">
                      {{ $t("Downtimes.dunjustify") }}
                    </div>
                    <div
                      class="text-h6 text-weight-bold text-negative text-no-wrap"
                    >
                      {{ countNullDTID }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="kpi-card q-py-sm q-px-md">
                <q-card-section horizontal class="items-center q-pa-none">
                  <q-icon
                    name="pending_actions"
                    size="32px"
                    color="warning"
                    class="q-mr-md"
                  />
                  <div class="column">
                    <div class="text-caption text-grey-6 text-no-wrap">
                      {{ $t("Downtimes.opendowntimes") }}
                    </div>
                    <div
                      class="text-h6 text-weight-bold text-warning text-no-wrap"
                    >
                      {{ countOpenDowntimes }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <section
          v-if="downtimeResults.length || downtimeResultsFetched"
          class="q-mb-lg"
        >
          <q-card class="q-pa-md rounded-borders shadow-4">
            <q-table
              class="custom-q-table"
              :rows="downtimeResults"
              :columns="columns"
              row-key="id"
              flat
              bordered
              dense
              :rows-per-page-options="[10, 20, 50, 0]"
            >
              <template v-slot:no-data>
                <div class="full-width row flex-center text-center q-pa-md">
                  <q-icon
                    name="warning"
                    size="lg"
                    color="orange"
                    class="q-mr-sm"
                  />
                  <div
                    class="text-caption text-bold"
                    style="color: orange; font-size: 16px"
                  >
                    {{ $t("Downtimes.nodata") }}
                  </div>
                </div>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props" class="custom-header-row">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                  >
                    <q-icon :name="col.icon" size="sm" class="q-mr-xs" />
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="custom-body-row">
                  <q-td key="id" :props="props">{{ props.row.id }}</q-td>

                  <q-td key="downtimeReason" :props="props">
                    {{
                      props.row.DownTimeReason
                        ? props.row.DownTimeReason
                        : `⚠️ ${$t("graph.nodefine")} ⚠️`
                    }}
                  </q-td>

                  <q-td key="type" :props="props">
                    {{
                      props.row.DowntimeType === true ||
                      props.row.DowntimeType === 1
                        ? "Manual"
                        : "Automatic"
                    }}
                  </q-td>

                  <q-td key="jobNumber" :props="props">{{
                    props.row.JobNumber
                  }}</q-td>
                  <q-td key="stationID" :props="props">{{
                    props.row.StationID
                  }}</q-td>
                  <q-td key="linea" :props="props">{{ props.row.Linea }}</q-td>
                  <q-td key="productionDate" :props="props">{{
                    props.row.ProductionDate
                  }}</q-td>

                  <q-td
                    key="empID"
                    :props="props"
                    class="ellipsis"
                    style="max-width: 200px"
                  >
                    {{ props.row.empID }}
                  </q-td>

                  <q-td key="turno" :props="props">
                    <q-badge color="primary" outline class="text-subtitle2">
                      {{ props.row.Turno }}
                    </q-badge>
                  </q-td>

                  <q-td key="horaInicio" :props="props">
                    {{
                      formatSmartDate(
                        props.row.start_adjusted,
                        props.row.EndTime,
                        true
                      )
                    }}
                  </q-td>

                  <q-td
                    key="horaFin"
                    :props="props"
                    :class="{
                      'text-red text-bold': isCrossedDay(
                        props.row.start_adjusted,
                        props.row.EndTime
                      ),
                    }"
                  >
                    {{
                      formatSmartDate(
                        props.row.start_adjusted,
                        props.row.EndTime,
                        false
                      )
                    }}
                  </q-td>

                  <q-td key="duracion" :props="props">
                    <q-chip color="orange" text-color="white" dense>
                      {{ props.row.DuracionEnMinutos }} min
                    </q-chip>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card>
        </section>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";

import LanguageToggle from "src/components/LanguageToggle.vue";
import { useI18n } from "vue-i18n";
import { useReportStore } from "stores/ReportStore";
import { Notify } from "quasar";
import Highcharts from "highcharts";
import * as XLSX from "xlsx-js-style";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/es"; // Cargar español
import "dayjs/locale/en"; // Cargar inglés
import "dayjs/locale/pl"; // Cargar polaco
import localeData from "dayjs/plugin/localeData"; // Permite usar .locale()
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

dayjs.extend(localeData);

dayjs.extend(localizedFormat);
// Establecer idioma globalmente
dayjs.locale("es");

const { t, locale } = useI18n();

const fechaFormateada = ref("");
const horaFormateada = ref("");

// --- Estados reactivos ---
const drawer = ref(true); // Drawer lateral
const startMenu = ref(false);
const endMenu = ref(false);
const start = ref(""); // Fecha inicio
const end = ref(""); // Fecha fin

const downtimeResults = ref([]); // Resultados del SP
const downtimeResultsFetched = ref(false); // Para controlar tabla vacía
const countNullDTID = ref(0); //Contador de Downtimes sin declarar
const countOpenDowntimes = ref(0); // contador global Downtimes sin Cerrar
const countAutomaticDowntimes = ref(0); //Contador Downtimes Automaticos
const countManualDowntimes = ref(0); //Contador Downtimes Automaticos Manuales
const TitleStartDate = ref("");
const TitleEndDate = ref("");

const currentStartDate = ref(null);
const currentEndDate = ref(null);

// --- Grafica / Modal ---
const selectedStationIdForChart = ref(null);
const selectedShiftForStationChart = ref("Todos");
const availableShiftsForStationChartFilter = ref([]);
const showChartModal = ref(false);

//Grafica Pie
const selectedOverallShift = ref("Todos");
const availableOverallShifts = ref(["Todos"]); // Se llenará dinámicamente

const sidebarTableHtmlContent = ref(""); // contenido HTML de la tabla

const selectedReason = ref("Todos");
const selectedLineValue = ref("Todas");
const selectedShiftValue = ref("Todos");

const chartOptionsByStation = ref(null);

// Variable reactiva para las opciones de la gráfica
const columnChartOptions = ref({});

// --- Store ---
const ReportStore = useReportStore();

const justifiedPercentage = computed(() => {
  const total = totalDowntimeMinutes.value; // Ya definida
  const justified = totalJustifiedDowntimeMinutes.value; // Ya definida

  if (total === 0) {
    return "100%"; // Si no hay downtime, se considera 100% eficiente (o 0%)
  }

  const percentage = (justified / total) * 100;
  return `${percentage.toFixed(1)}%`; // Formatear a un decimal y agregar el signo %
});

const totalDowntimeMinutes = computed(() => {
  const results = downtimeResults.value;
  if (!results || results.length === 0) {
    return 0;
  }
  const total = results.reduce((sum, item) => {
    // Suma todos los minutos, asegurando que el valor sea un número
    return sum + (item.DuracionEnMinutos || 0);
  }, 0);
  // Devuelve el total redondeado
  return Math.round(total);
});

// ---------------------------------------------------------------------
// 1. KPI: Total de Minutos de Downtime JUSTIFICADO
// ---------------------------------------------------------------------
const totalJustifiedDowntimeMinutes = computed(() => {
  const results = downtimeResults.value;

  if (!results || results.length === 0) {
    return 0;
  }

  const justifiedTotal = results.reduce((sum, item) => {
    // CONDICIÓN: Sumar si DownTimeReason tiene un valor (no es falsy, como null o '')
    if (item.DownTimeReason) {
      return sum + (item.DuracionEnMinutos || 0);
    }
    return sum;
  }, 0);

  return Math.round(justifiedTotal);
});

// ---------------------------------------------------------------------
// 2. KPI: Total de Minutos de Downtime SIN JUSTIFICAR
// ---------------------------------------------------------------------
const totalUnjustifiedDowntimeMinutes = computed(() => {
  const results = downtimeResults.value;

  if (!results || results.length === 0) {
    return 0;
  }

  const unjustifiedTotal = results.reduce((sum, item) => {
    // CONDICIÓN: Sumar si DownTimeReason es falsy (null, undefined, '')
    // Usamos '!' para verificar si el campo está vacío/nulo
    if (!item.DownTimeReason) {
      return sum + (item.DuracionEnMinutos || 0);
    }
    return sum;
  }, 0);

  return Math.round(unjustifiedTotal);
});

const isLoading = ref(false);

// --- Función para consultar downtime ---
const fetchSummary = async () => {
  isLoading.value = true; // <-- indicar inicio de carga

  try {
    // Limpiar datos anteriores
    downtimeResults.value = [];
    downtimeResultsFetched.value = false;
    countNullDTID.value = 0;
    countOpenDowntimes.value = 0;
    countAutomaticDowntimes.value = 0;
    countManualDowntimes.value = 0;
    TitleStartDate.value = null;
    TitleEndDate.value = null;

    const chartContainers = [
      "overallDowntimeChart2",
      "overallDowntimeChartStation",
      "stationChartContainer",
    ];
    chartContainers.forEach((id) => {
      const container = document.getElementById(id);
      if (container) container.innerHTML = "";
    });

    if (!start.value) {
      Notify.create({
        type: "negative",
        message: t("Downtimes.alert1"),
      });
      return;
    }

    await ReportStore.fetchDownTimeSummary(start.value, end.value);
    downtimeResults.value = ReportStore.downtimeResults || [];

    countNullDTID.value = downtimeResults.value.filter(
      (item) => item.DTID == null
    ).length;
    countOpenDowntimes.value = downtimeResults.value.filter(
      (item) => item.EndTime == null
    ).length;
    countAutomaticDowntimes.value = downtimeResults.value.filter(
      (d) => d.DowntimeType === false || d.DowntimeType === 0
    ).length;
    countManualDowntimes.value = downtimeResults.value.filter(
      (d) => d.DowntimeType === true || d.DowntimeType === 1
    ).length;

    downtimeResultsFetched.value = true;
    TitleStartDate.value = start.value;
    TitleEndDate.value = end.value;
  } catch (error) {
    console.error("Error fetching downtime:", error);
    Notify.create({
      type: "negative",
      message: t("Downtimes.alert2"),
    });
  } finally {
    isLoading.value = false; // <-- indicar fin de carga
  }
};

// Asegúrate de tener el import arriba
// import * as XLSX from "xlsx-js-style";

const exportDowntime = () => {
  if (!downtimeResults.value || downtimeResults.value.length === 0) {
    Notify.create({
      type: "warning",
      message: t("Downtimes.alert3"),
    });
    return;
  }

  // 1. Definir los encabezados traducidos
  const headers = [
    t("unjustifyt.id"),
    t("Downtimes.down"), // "Downtime"
    t("Downtimes.jobn"), // "JobNumber"
    t("Downtimes.stat"), // "Estación"
    t("Downtimes.line"), // "Línea"
    t("Downtimes.prodate"), // "Fecha de Producción"
    t("Downtimes.oper"), // "Operador"
    t("Downtimes.shift2"), // "Turno"
    t("Downtimes.hrstart"), // "Hora Inicio"
    t("unjustifyt.hrf"), // "Hora Fin"
    t("Downtimes.totalmin"), // "Minutos Totales"
  ];

  // 2. Preparar los datos (Sin las comillas dobles extras)
  const rows = downtimeResults.value.map((item) => [
    item.id,
    item.DownTimeReason || t("graph.nodefine"), // 👈 Aquí está la condicional
    item.JobNumber,
    item.StationID,
    item.Linea,
    item.ProductionDate,
    item.empID,
    item.Turno,
    formatSmartDate(item.start_adjusted, item.EndTime, true), // Hora Inicio
    formatSmartDate(item.start_adjusted, item.EndTime, false), // Hora Fin
    item.DuracionEnMinutos,
  ]);

  // 3. Crear el arreglo principal (Headers + Datos)
  const wsData = [headers, ...rows];

  // 4. Crear la hoja de trabajo (Worksheet)
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 5. Definir el estilo del encabezado (Ej: Azul Quasar con letras blancas)
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1976D2" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  // 6. Aplicar el estilo SOLO a la primera fila (los headers)
  for (let i = 0; i < headers.length; i++) {
    // encode_cell recibe { c: columna, r: fila (empieza en 0) }
    const cellAddress = XLSX.utils.encode_cell({ c: i, r: 0 });
    if (ws[cellAddress]) {
      ws[cellAddress].s = headerStyle;
    }
  }

  // 7. Ajustar el ancho de las columnas (wch = width character)
  ws["!cols"] = [
    { wch: 15 }, // ID
    { wch: 25 }, // Downtime
    { wch: 15 }, // JobNumber
    { wch: 15 }, // Estacion
    { wch: 15 }, // Linea
    { wch: 15 }, // ProductionDate
    { wch: 15 }, // Operador
    { wch: 10 }, // Turno
    { wch: 20 }, // Hora Inicio
    { wch: 20 }, // Minutos Totales
  ];

  // 8. Crear el libro de trabajo (Workbook) y añadir la hoja
  const wb = XLSX.utils.book_new();
  // Nombramos la pestaña de Excel usando tu diccionario
  XLSX.utils.book_append_sheet(wb, ws, t("Downtimes.report"));

  // 9. Construir el nombre del archivo de forma dinámica y traducida
  const safeStart = TitleStartDate.value
    ? TitleStartDate.value.replace(/\//g, "")
    : currentStartDate.value.replace(/\//g, "");
  const safeEnd = TitleEndDate.value
    ? TitleEndDate.value.replace(/\//g, "")
    : safeStart;

  // Ej: Reporte_de_Downtimes_20260312_20260315.xlsx
  const fileName = `${t("Downtimes.report").replace(
    / /g,
    "_"
  )}_${safeStart}_${safeEnd}.xlsx`;

  // 10. Descargar el archivo
  try {
    XLSX.writeFile(wb, fileName);
    Notify.create({
      type: "positive",
      message: t("Downtimes.alert4"),
    });
  } catch (error) {
    console.error("Error al exportar Excel:", error);
    Notify.create({
      type: "negative",
      message: t("Downtimes.alert5"),
    });
  }
};

// --- Computed para agrupar por línea, estación y turnos ---
const groupedByLineWithTurns = computed(() => {
  const grouped = {};
  downtimeResults.value.forEach((item) => {
    const line = item.Linea || t("Downtimes.noline");
    if (!grouped[line]) grouped[line] = [];

    let station = grouped[line].find((s) => s.StationID === item.StationID);
    if (!station) {
      station = { StationID: item.StationID, totalMinutos: 0, turnos: {} };
      grouped[line].push(station);
    }

    station.totalMinutos += item.DuracionEnMinutos || 0;
    const turno = item.Turno || t("helper.unknow");
    station.turnos[turno] =
      (station.turnos[turno] || 0) + (item.DuracionEnMinutos || 0);
  });

  return grouped;
});

// --- Función para formatear hora ---
const formatTimeToUTC = (timeStr) => {
  if (!timeStr) return "-";
  const date = new Date(timeStr);

  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  // Determinar AM o PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convertir a formato 12h
  hours = hours % 12;
  hours = hours ? hours : 12; // el 0 se convierte en 12

  return `${hours}:${minutes} ${ampm}`;
};

// --- Función dinámica para Hora Fin ---
// --- 1. Formateador inteligente con Day.js ---
const formatSmartDate = (start, end = null, isStartTime = false) => {
  if (!start) return "-";

  const startDate = dayjs.utc(start);
  const endDate = end ? dayjs.utc(end) : null;

  // Lógica para START TIME
  if (isStartTime) {
    if (!endDate) return startDate.format("hh:mm A");
    // Si cruzó el día, fecha completa. Si no, solo hora.
    return startDate.isSame(endDate, "day")
      ? startDate.format("hh:mm A")
      : startDate.format("DD/MM/YYYY HH:mm:ss");
  }

  // Lógica para END TIME
  if (!endDate) return "-";
  return startDate.isSame(endDate, "day")
    ? endDate.format("hh:mm A")
    : endDate.format("DD/MM/YYYY HH:mm:ss");
};

// --- 2. Validador para activar el texto rojo ---
const isCrossedDay = (start, end) => {
  if (!start || !end) return false;
  // Retorna true si NO pertenecen al mismo día
  return !dayjs.utc(start).isSame(dayjs.utc(end), "day");
};
// --- Abrir modal y preparar gráfica ---
const openChart = async (stationId) => {
  selectedStationIdForChart.value = stationId;
  selectedShiftForStationChart.value = "Todos";

  // Filtra turnos únicos para esa estación
  const shiftsForCurrentStation = new Set(
    downtimeResults.value
      .filter((item) => item.StationID === stationId && item.Turno)
      .map((item) => item.Turno)
  );

  availableShiftsForStationChartFilter.value = [
    "Todos",
    ...Array.from(shiftsForCurrentStation).sort(),
  ];

  // Mostrar modal primero
  showChartModal.value = true;

  // 🔹 Esperar a que se monte el DOM del modal
  await nextTick();

  // Ahora sí generar la gráfica inicial
  generateChartForStationModal(stationId, selectedShiftForStationChart.value);
};

// --- Mapeo de colores para las razones de Downtime (basado en tu imagen) ---
const reasonColors = {
  Mantenimiento: "#1565C0",
  Descanso: "#2E7D32",
  Material: "#00838F",
  Almuerzo: "#EF6C00",
  Reunión: "#FF8F00",
  Entrenamiento: "#283593",
  Break: "#2E7D32",
  Lunch: "#EF6C00",
  Meeting: "#FF8F00",
  Maintenance: "#1565C0",
  Training: "#283593",
  Przerwa: "#2E7D32",
  Obiad: "#EF6C00",
  Spotkanie: "#FF8F00",
  Konserwacja: "#1565C0",
  Szkolenie: "#283593",
  Materialy: "#00838F",
};

// --- Generar gráfica ---
const generateChartForStationModal = (stationId, shift) => {
  // 💡 Mantenemos "Todos" por si la lógica interna aún lo usa,
  // pero agregamos la traducción para mayor seguridad.
  const isAllShifts = shift === "Todos" || shift === t("Downtimes.all");

  const stationData = downtimeResults.value.filter(
    (item) =>
      item.StationID === stationId && (isAllShifts || item.Turno === shift)
  );

  if (!stationData.length) {
    Highcharts.chart("stationChartContainer", {
      // 🔄 Reemplazo: "No hay registros de Downtime"
      title: { text: t("Downtimes.nodata") },
      series: [],
    });
    return;
  }

  // Agrupamos por DownTimeReason
  const reasonMap = {};
  stationData.forEach((item) => {
    const reason = item.DownTimeReason || t("Downtimes.rason");
    reasonMap[reason] =
      (reasonMap[reason] || 0) + (item.DuracionEnMinutos || 0);
  });

  const categories = Object.keys(reasonMap);

  // Convertimos a objetos con color por razón
  const data = categories.map((reason) => ({
    name: reason,
    y: reasonMap[reason],
    color: reasonColors[reason] || "#1976D2",
  }));

  // 1️⃣ Calcular totales por turno
  const turnoTotals = {};
  stationData.forEach((item) => {
    const turno = item.Turno || t("Downtimes.noshift");
    turnoTotals[turno] =
      (turnoTotals[turno] || 0) + (item.DuracionEnMinutos || 0);
  });

  // 2️⃣ Generar HTML de totales por turno ("min" es universal, lo dejamos igual)
  const totalesPorTurnoHtml = Object.keys(turnoTotals)
    .map((turno) => `${turno} = ${turnoTotals[turno]} min`)
    .join(" | ");

  // 3️⃣ Rango de fechas
  // 🔄 Reemplazo: t("Downtimes.rango") y cambié " a " por " - " para que funcione en cualquier idioma
  const rangoFechas = `(${t("Downtimes.rango")} ${
    TitleStartDate.value || currentStartDate
  }${TitleEndDate.value ? ` - ${TitleEndDate.value || currentEndDate}` : ""})`;

  // 4️⃣ Subtítulo final
  const subtituloTotales = `${totalesPorTurnoHtml}<br>${rangoFechas}`;

  // 🔄 Variable auxiliar para los tooltips (convierte "Minutos" a minúscula)
  const minText = t("Downtimes.graph4").toLowerCase();

  Highcharts.chart("stationChartContainer", {
    chart: { type: "column", inverted: false },

    title: {
      useHTML: true,
      text: `
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; font-weight:bold; font-size:1.2rem; color:#333;">
        <img src="/img/AFL.png" alt="Logo" style="height:28px; border-radius:4px;" />
        <span>${t("Downtimes.graph1")} ${stationId}</span>
      </div>
    `,
    },

    subtitle: {
      useHTML: true,
      text: subtituloTotales,
      style: { fontSize: "14px", color: "#555", marginTop: "5px" },
    },

    // 🔄 Reemplazo: Ejes X y Y
    xAxis: { categories, title: { text: t("Downtimes.graph2") } },
    yAxis: { min: 0, title: { text: t("Downtimes.graph3") } },

    // 🔄 Reemplazo: Nombre de la serie
    series: [{ name: t("Downtimes.graph4"), data }],

    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          inside: false,
          verticalAlign: "bottom",
          style: { fontSize: "12px", fontWeight: "bold", textOutline: "none" },
        },
      },
    },

    tooltip: {
      shared: true,
      headerFormat: "<b>{point.key}</b><br/>",
      // 🔄 Reemplazo: Texto dentro del pointFormat
      pointFormat: `{series.name}: <b>{point.y} ${minText}</b><br/>`,
      formatter: function () {
        if (this.points) {
          return this.points
            .filter((p) => p.y !== 0)
            .map((p) => `<b>${p.series.name}</b>: ${p.y} ${minText}`)
            .join("<br/>");
        }
        return `<b>${this.key}</b>: ${this.y} ${minText}`;
      },
    },
    credits: { enabled: false },
    accessibility: { enabled: false },
  });
};

const applyShiftFilterAndRedrawChart = () => {
  if (!selectedStationIdForChart.value) return;

  generateChartForStationModal(
    selectedStationIdForChart.value,
    selectedShiftForStationChart.value
  );
};

//Función para obtener los turnos únicos de los resultados
const updateAvailableOverallShifts = () => {
  const shifts = new Set(
    downtimeResults.value.map((item) => item.Turno).filter((t) => t) // elimina null/undefined
  );
  availableOverallShifts.value = ["Todos", ...Array.from(shifts).sort()];
};

// --- Función principal para generar la gráfica de pie ---
const prepareOverallDowntimeDataByShift = () => {
  const reasonMap = {};

  downtimeResults.value.forEach((item) => {
    const turnoMatch =
      selectedOverallShift.value === "Todos" ||
      item.Turno === selectedOverallShift.value;

    // ✅ Excluir cualquier registro sin razón de downtime
    const isInvalid = item.DownTimeReason == null || item.DownTimeReason === "";

    if (turnoMatch && !isInvalid) {
      const reason = item.DownTimeReason;
      reasonMap[reason] =
        (reasonMap[reason] || 0) + (item.DuracionEnMinutos || 0);
    }
  });

  return Object.keys(reasonMap).map((reason) => ({
    name: reason,
    y: reasonMap[reason],
    color: reasonColors[reason] || "#A9A9A9",
  }));
};

// Función para generar el gráfico
const generateOverallDowntimeChart = () => {
  const container = document.getElementById("overallDowntimeChart");
  if (!container) return;

  const data = prepareOverallDowntimeDataByShift();

  // Calcular sumatoria total
  const totalMinutes = data.reduce((acc, d) => acc + d.y, 0);

  // Calcular totales por turno
  const totalsByShift = { N1: 0, N2: 0, N3: 0, N4: 0 };
  downtimeResults.value.forEach((item) => {
    if (item.Turno && totalsByShift[item.Turno] !== undefined) {
      totalsByShift[item.Turno] += item.DuracionEnMinutos;
    }
  });

  // Generar HTML para subtítulos
  let shiftTotalsHtml = "";
  const shiftsPresent = Object.keys(totalsByShift).filter(
    (t) => totalsByShift[t] > 0
  );
  if (shiftsPresent.length) {
    shiftTotalsHtml += `<div style="text-align:center; font-size:0.9rem; color:#555; margin-top:5px;">`;
    shiftsPresent.forEach((turno, index) => {
      shiftTotalsHtml += `<span>${turno}: <b>${totalsByShift[turno]} ${t(
        "Downtimes.min"
      )}</b></span>`;
      if (index < shiftsPresent.length - 1) shiftTotalsHtml += ` &nbsp; `;
    });
    shiftTotalsHtml += `</div>`;
  }

  const dateRangeHtml = `<div style="text-align:center; font-size:0.9rem; color:#555; margin-top:5px;">
    (${t("Downtimes.rango")} ${
    currentStartDate.value || TitleStartDate.value
  } - ${
    currentEndDate.value ||
    TitleEndDate.value ||
    currentStartDate.value ||
    TitleStartDate.value
  })
  </div>`;

  Highcharts.chart(container, {
    chart: { type: "pie", animation: true },
    title: {
      useHTML: true,
      text: t("Downtimes.totalByReason", {
        shift: selectedOverallShift.value,
        total: totalMinutes,
      }),
    },
    subtitle: {
      useHTML: true,
      text: shiftTotalsHtml + dateRangeHtml,
      style: { fontSize: "0.9rem", color: "#555", marginTop: "5px" },
    },
    tooltip: {
      pointFormat: `<b>{point.y} ${t(
        "Downtimes.min"
      )}</b> ({point.percentage:.1f}%)`,
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: `{point.name}: {point.y} ${t("Downtimes.min")}`,
          style: { fontWeight: "bold", color: "#000" },
        },
      },
    },
    series: [{ name: t("Downtimes.totalmin"), colorByPoint: true, data }],
    credits: { enabled: false },
    accessibility: { enabled: false },
  });
};

// 🔹 Watch para actualizar el gráfico al cambiar idioma o filtros
watch(
  [
    locale, // cambio de idioma
    selectedOverallShift,
    downtimeResults,
    currentStartDate,
    currentEndDate,
  ],
  () => {
    generateOverallDowntimeChart();
  },
  { deep: true } // necesario para observar arrays/objetos como downtimeResults
);

/**
 * Genera el HTML de la tabla de minutos de downtime por línea, razón y turno
 * @param {Array} results - Arreglo de objetos con datos de downtime
 * @returns {string} HTML de la tabla listo para inyectar
 */
const generateDowntimeTableHtml = (results) => {
  if (!results || results.length === 0) {
    return `<div style="padding:10px; text-align:center; color:#888;">No hay datos de downtime disponibles.</div>`;
  }

  const groupedDataForTable = {};
  const uniqueShiftsInTable = new Set();

  // Agrupar datos por línea, razón y turno
  results.forEach((item) => {
    const reason = item.DownTimeReason;
    const line = item.Linea;
    const shift = item.Turno || t("Downtimes.noshift");
    const duration = parseFloat(item.DuracionEnMinutos);

    if (!reason || !line || isNaN(duration)) return;

    uniqueShiftsInTable.add(shift);

    if (!groupedDataForTable[line]) {
      groupedDataForTable[line] = { total: 0, shiftsTotal: {}, reasons: {} };
    }
    groupedDataForTable[line].total += duration;
    groupedDataForTable[line].shiftsTotal[shift] =
      (groupedDataForTable[line].shiftsTotal[shift] || 0) + duration;

    if (!groupedDataForTable[line].reasons[reason]) {
      groupedDataForTable[line].reasons[reason] = { total: 0, shifts: {} };
    }
    groupedDataForTable[line].reasons[reason].total += duration;
    groupedDataForTable[line].reasons[reason].shifts[shift] =
      (groupedDataForTable[line].reasons[reason].shifts[shift] || 0) + duration;
  });

  const sortedShifts = Array.from(uniqueShiftsInTable).sort();
  const shiftHeaders = sortedShifts
    .map(
      (shift) =>
        `<th style="padding:6px; border-bottom:1px solid #ddd; text-align:center; color:white;">${shift}</th>`
    )
    .join("");

  const sortedLines = Object.keys(groupedDataForTable).sort(
    (a, b) => groupedDataForTable[b].total - groupedDataForTable[a].total
  );

  let tableRowsHtml = "";
  let grandTotalMinutes = 0;
  let grandTotalByShift = {};

  sortedLines.forEach((line) => {
    const lineData = groupedDataForTable[line];
    grandTotalMinutes += lineData.total;

    const lineShiftTotals = sortedShifts
      .map((shift) => {
        const value = lineData.shiftsTotal[shift] || 0;
        grandTotalByShift[shift] = (grandTotalByShift[shift] || 0) + value;
        return `<td style="padding:5px; border-bottom:1px solid #ccc; text-align:center;">${value}</td>`;
      })
      .join("");

    // Fila de la línea
    tableRowsHtml += `
      <tr style="background-color:#e0e0e0; font-weight:bold;">
        <td style="padding:5px; border-bottom:1px solid #ccc; text-align:center;">${line}</td>
        ${lineShiftTotals}
        <td style="padding:5px; border-bottom:1px solid #ccc; text-align:center;">${lineData.total}</td>
      </tr>
    `;

    // Fila por razón dentro de la línea
    const sortedReasons = Object.keys(lineData.reasons).sort(
      (a, b) => lineData.reasons[b].total - lineData.reasons[a].total
    );

    sortedReasons.forEach((reason) => {
      const reasonData = lineData.reasons[reason];
      const reasonShiftMinutes = sortedShifts
        .map(
          (shift) =>
            `<td style="padding:3px; border-bottom:1px solid #eee; text-align:center;">${
              reasonData.shifts[shift] || 0
            }</td>`
        )
        .join("");

      tableRowsHtml += `
        <tr>
          <td style="padding:3px; border-bottom:1px solid #eee; text-align:left; padding-left:20px;">${reason}</td>
          ${reasonShiftMinutes}
          <td style="padding:3px; border-bottom:1px solid #eee; text-align:center;">${reasonData.total}</td>
        </tr>
      `;
    });
  });

  // Fila de gran total
  const grandTotalShiftColumns = sortedShifts
    .map(
      (shift) =>
        `<td style="padding:5px; border-top:2px solid #aaa; text-align:right;">${
          grandTotalByShift[shift] || 0
        }</td>`
    )
    .join("");

  tableRowsHtml += `
    <tr style="background-color:#d0d0d0; font-weight:bold;">
      <td style="padding:5px; border-top:2px solid #aaa; text-align:center;">Total</td>
      ${grandTotalShiftColumns}
      <td style="padding:5px; border-top:2px solid #aaa; text-align:right;">${grandTotalMinutes}</td>
    </tr>
  `;

  // HTML final de la tabla
  return `
    <div style="padding:10px; border:1px solid #e0e0e0; border-radius:8px; background-color:#fcfcfc; overflow:auto;">
      <div style="display:flex; align-items:center; justify-content:center; margin-bottom:10px;">
        <img src="/img/AFL.png" alt="Logo" style="height:28px; border-radius:4px; margin-right:8px;" />
        <div style="font-weight:bold; font-size:1.1rem; color:#003153;">Minutos de Downtime por Línea</div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:0.9em; table-layout:auto;">
        <thead>
          <tr style="background-color:#003153;">
            <th style="padding:6px; border-bottom:1px solid #ddd; text-align:center; color:white;">Downtimes</th>
            ${shiftHeaders}
            <th style="padding:6px; border-bottom:1px solid #ddd; text-align:center; color:white;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </div>
  `;
};

const updateSidebarTable = () => {
  let filteredResults = downtimeResults.value;

  if (selectedOverallShift.value !== "Todos") {
    filteredResults = filteredResults.filter(
      (item) => item.Turno === selectedOverallShift.value
    );
  }

  sidebarTableHtmlContent.value = generateDowntimeTableHtml(filteredResults);
};

const generateColumnChartByDay = () => {
  const container = document.getElementById("overallDowntimeChart2");
  if (!container) return;

  if (!downtimeResults.value.length) {
    // Opcional: limpiar gráfico si no hay datos
    container.innerHTML =
      "<p style='text-align:center;'>Sin datos disponibles</p>";
    return;
  }

  const groupedByDateAndReason = {};
  const datesSet = new Set();
  const reasonsSet = new Set();

  const dataLabelsPorRazon = {
    enabled: true,
    formatter: function () {
      return `${this.y} min`; // muestra solo el valor de esta barra
    },
    style: {
      color: "#000",
      fontSize: "10px",
      textOutline: "none",
      fontWeight: "bold",
    },
  };

  downtimeResults.value.forEach((item) => {
    // ✅ Excluir cualquier registro sin razón de downtime
    if (item.DownTimeReason == null || item.DownTimeReason === "") return;

    // Filtrado por razón, línea y turno
    const reasonMatch =
      selectedReason.value === "Todos" ||
      item.DownTimeReason === selectedReason.value;
    const lineMatch =
      selectedLineValue.value === "Todas" ||
      item.Linea === selectedLineValue.value;
    const shiftMatch =
      selectedShiftValue.value === "Todos" ||
      item.Turno === selectedShiftValue.value;

    if (!(reasonMatch && lineMatch && shiftMatch)) return;

    const [day, month, year] = item.ProductionDate.split("/");
    const formattedDate = `${year}-${month}-${day}`;

    datesSet.add(formattedDate);
    const reason = item.DownTimeReason; // ✅ Ya no necesitas el fallback "Desconocido"
    reasonsSet.add(reason);

    if (!groupedByDateAndReason[formattedDate])
      groupedByDateAndReason[formattedDate] = {};
    groupedByDateAndReason[formattedDate][reason] =
      (groupedByDateAndReason[formattedDate][reason] || 0) +
      (item.DuracionEnMinutos || 0);
  });

  const sortedDates = Array.from(datesSet).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const allReasons = Array.from(reasonsSet).sort();

  const seriesData = allReasons.map((reason) => ({
    name: reason,
    data: sortedDates.map(
      (date) => groupedByDateAndReason[date]?.[reason] || 0
    ),
    color: reasonColors[reason] || "#A9A9A9",
  }));

  const totalOverall = seriesData.reduce(
    (sum, series) => sum + series.data.reduce((a, b) => a + b, 0),
    0
  );

  Highcharts.chart(container, {
    chart: { type: "column" },

    // ✅ Título principal con logo y estilos
    title: {
      useHTML: true,
      text: `
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; font-weight:bold; font-size:1.2rem; color:#333;">
        <img src="/img/AFL.png" alt="Logo" style="height:28px; border-radius:4px;" />
        <span>Minutos de Downtime por Día</span>
      </div>
      <div style="text-align:center; font-size:1rem; color:#555; margin-top:5px;">
        (Del ${currentStartDate.value || TitleStartDate.value} al ${
        currentEndDate.value ||
        TitleEndDate.value ||
        currentStartDate.value ||
        TitleStartDate.value
      })
      </div>
    `,
    },

    subtitle: {
      useHTML: true,
      text: `Total Global: <b>${totalOverall} min</b>`,
      style: { fontSize: ".8rem", color: "#555", marginTop: "5px" },
    },

    xAxis: {
      categories: sortedDates,
      title: { text: "Fecha de Producción" },
      labels: { rotation: -45, style: { fontSize: "9px" } },
    },

    yAxis: { min: 0, title: { text: "Duración (Minutos)" } },

    tooltip: {
      shared: true,
      formatter: function () {
        let s = `<b>${this.x}</b><br/>`; // cabecera con el nombre de la categoría
        this.points.forEach((point) => {
          if (point.y !== 0) {
            s += `${point.series.name}: <b>${point.y} min</b><br/>`;
          }
        });
        return s;
      },
    },

    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: dataLabelsPorRazon,
      },
    },

    series: seriesData,
    credits: { enabled: false },
    accessibility: { enabled: false },
    legend: { enabled: true },
  });
};

// --- Función para generar la gráfica por estación ---
// --- Función para generar la gráfica ---
const generateColumnChartByStation = () => {
  if (!downtimeResults.value.length) {
    const container = document.getElementById("overallDowntimeChartStation");
    if (container) {
      container.innerHTML =
        "<p style='text-align:center;'>Sin datos disponibles</p>";
    }
    return;
  }

  const groupedByStationAndReason = {};
  const stationsSet = new Set();
  const stationToProductionOrder = {};
  const reasonsInFilteredData = new Set();
  const totalsByShiftForStationChart = { N1: 0, N2: 0, N3: 0, N4: 0 };
  let totalOverallDowntimeForStationChart = 0;

  downtimeResults.value.forEach((item) => {
    // ✅ Excluir registros sin razón de downtime
    if (item.DownTimeReason == null || item.DownTimeReason === "") return;

    const station = item.StationID || t("Downtimes.unknow");
    const reason = item.DownTimeReason; // ✅ Ya no necesitas "Desconocido"
    const productionOrder = Number(item.ProductionOrder) || 0;

    stationsSet.add(station);
    reasonsInFilteredData.add(reason);

    if (
      !stationToProductionOrder[station] ||
      productionOrder < stationToProductionOrder[station]
    ) {
      stationToProductionOrder[station] = productionOrder;
    }

    if (!groupedByStationAndReason[station])
      groupedByStationAndReason[station] = {};
    groupedByStationAndReason[station][reason] =
      (groupedByStationAndReason[station][reason] || 0) +
      item.DuracionEnMinutos;

    const turno = item.Turno;
    const duration = item.DuracionEnMinutos;
    if (turno && totalsByShiftForStationChart[turno] !== undefined) {
      totalsByShiftForStationChart[turno] += duration;
    }
    totalOverallDowntimeForStationChart += duration;
  });

  const filteredStations = Array.from(stationsSet).filter((station) => {
    const reasons = groupedByStationAndReason[station];
    return Object.values(reasons).some((minutos) => minutos > 0);
  });

  const sortedStations = filteredStations.sort(
    (a, b) =>
      (stationToProductionOrder[a] || 0) - (stationToProductionOrder[b] || 0)
  );

  const allReasons = Array.from(reasonsInFilteredData).sort();

  const seriesDataByStation = allReasons.map((reason) => ({
    name: reason,
    data: sortedStations.map(
      (station) => groupedByStationAndReason[station]?.[reason] || 0
    ),
    color: reasonColors[reason] || reasonColors["Desconocido"],
  }));

  // Configuración común de etiquetas
  const dataLabelsPorRazon = {
    enabled: true,
    formatter: function () {
      return `${this.y} min`; // muestra solo el valor de esta barra
    },
    style: {
      color: "#000",
      fontSize: "10px",
      textOutline: "none",
      fontWeight: "bold",
    },
  };

  let yAxisMaxForStationChart = 0;
  sortedStations.forEach((station) => {
    const totalForStation = allReasons.reduce(
      (acc, reason) =>
        acc + (groupedByStationAndReason[station]?.[reason] || 0),
      0
    );
    if (totalForStation > yAxisMaxForStationChart)
      yAxisMaxForStationChart = totalForStation;
  });
  yAxisMaxForStationChart *= 1.2;

  // Construir totales por turno HTML
  let shiftTotalsHtml = "";
  const shiftsPresent = Object.keys(totalsByShiftForStationChart).filter(
    (t) => totalsByShiftForStationChart[t] > 0
  );
  if (shiftsPresent.length) {
    shiftTotalsHtml += `<div style="text-align:center; font-size:0.8rem; color:#666; margin-top:8px;">`;
    shiftsPresent.forEach((turno, index) => {
      shiftTotalsHtml += `<span>${turno}: <b>${totalsByShiftForStationChart[turno]} min</b></span>`;
      if (index < shiftsPresent.length - 1) shiftTotalsHtml += ` &nbsp; `;
    });
    shiftTotalsHtml += `</div>`;
  }

  chartOptionsByStation.value = {
    chart: { type: "column" },
    title: {
      useHTML: true,
      text: `
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; font-weight:bold; font-size:1.2rem; color:#333;">
        <img src="/img/AFL.png" alt="Logo" style="height:28px; border-radius:4px;" />
        <span>Minutos de Downtime por Estación ${
          selectedReason.value !== "Todos" ? `(${selectedReason.value})` : ""
        }${
        selectedLineValue.value !== "Todas"
          ? ` (Línea: ${selectedLineValue.value})`
          : ""
      }${
        selectedShiftValue.value !== "Todos"
          ? ` (Turno: ${selectedShiftValue.value})`
          : ""
      }</span>
      </div>
      <div style="text-align:center; font-size:1rem; color:#555; margin-top:5px;">
       (Del ${currentStartDate.value || TitleStartDate.value} al ${
        currentEndDate.value ||
        TitleEndDate.value ||
        currentStartDate.value ||
        TitleStartDate.value
      })
      </div>
      ${shiftTotalsHtml}
    `,
    },
    subtitle: {
      useHTML: true,
      text: `Total Global: <b>${totalOverallDowntimeForStationChart} min</b>`,
      style: { fontSize: ".8rem", color: "#555", marginTop: "5px" },
    },
    xAxis: {
      type: "category",
      categories: sortedStations,
      title: { text: "Estación" },
    },
    yAxis: {
      min: 0,
      max: yAxisMaxForStationChart,
      title: { text: "Duración (Minutos)" },
    },
    series: seriesDataByStation,
    tooltip: {
      shared: true,
      formatter: function () {
        let s = `<b>${this.x}</b><br/>`; // cabecera con el nombre de la categoría
        this.points.forEach((point) => {
          if (point.y !== 0) {
            s += `${point.series.name}: <b>${point.y} min</b><br/>`;
          }
        });
        return s;
      },
    },

    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: dataLabelsPorRazon,
      },
    },

    credits: { enabled: false },
    accessibility: { enabled: false },
  };

  // Renderizar Highcharts
  nextTick(() => {
    Highcharts.chart(
      "overallDowntimeChartStation",
      chartOptionsByStation.value
    );
  });
};

//Reloj digital
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
// Usamos un computed para que las columnas reaccionen al cambio de idioma
const columns = computed(() => [
  {
    name: "id",
    label: "ID",
    field: "id",
    align: "center",
    icon: "label",
    sortable: true,
    style: "width: 60px",
  },
  {
    name: "downtimeReason",
    label: t("Downtimes.down"),
    field: "DownTimeReason",
    align: "center",
    icon: "report_problem",
    sortable: true,
    style: "width: 160px", // Más espacio porque las razones suelen ser largas
  },
  {
    name: "type",
    label: t("Downtimes.type"),
    field: "DowntimeType",
    align: "center",
    icon: "type_specimen",
    sortable: true,
    style: "width: 100px",
  },
  {
    name: "jobNumber",
    label: t("Downtimes.jobn"),
    field: "JobNumber",
    align: "center",
    icon: "category",
    sortable: true,
    style: "width: 120px",
  },
  {
    name: "stationID",
    label: t("Downtimes.stat"),
    field: "StationID",
    align: "center",
    icon: "memory",
    sortable: true,
    style: "width: 90px",
  },
  {
    name: "linea",
    label: t("Downtimes.line"),
    field: "Linea",
    align: "center",
    icon: "timeline",
    sortable: true,
    style: "width: 100px",
  },
  {
    name: "productionDate",
    label: t("Downtimes.prodate"),
    field: "ProductionDate",
    align: "center",
    icon: "event",
    sortable: true,
    style: "width: 110px",
  },
  {
    name: "empID",
    label: t("Downtimes.oper"),
    field: "empID",
    align: "center",
    icon: "person",
    sortable: true,
    style: "width: 180px", // El nombre del operador "Hilario Edgar Cantu..." necesita más aire
  },
  {
    name: "turno",
    label: t("Downtimes.shift2"),
    field: "Turno",
    align: "center",
    icon: "schedule",
    sortable: true,
    style: "width: 80px",
  },
  {
    name: "horaInicio",
    label: t("Downtimes.hrstart"),
    field: "start_adjusted",
    align: "center",
    icon: "play_arrow",
    sortable: true,
    style: "width: 100px",
  },
  {
    name: "horaFin",
    label: t("unjustifyt.hrf"),
    field: "EndTime",
    align: "center",
    icon: "play_arrow",
    sortable: true,
    style: "width: 100px",
  },
  {
    name: "duracion",
    label: t("Downtimes.tot"),
    field: "DuracionEnMinutos",
    align: "center",
    icon: "timer",
    sortable: true,
    style: "width: 100px",
  },
]);

onMounted(() => {
  mostrarHora();
  intervaloId = setInterval(mostrarHora, 1000);
});

onUnmounted(() => {
  clearInterval(intervaloId);
});

// Cuando cambien los resultados
watch(downtimeResults, updateSidebarTable, { immediate: true });

// Cuando cambie el turno seleccionado
watch(selectedOverallShift, updateSidebarTable);

// --- Watcher para ejecutar el gráfico cuando los datos estén listos ---
watch(downtimeResultsFetched, async (fetched) => {
  if (fetched) {
    await nextTick(); // Espera a que el DOM se actualice
    // Gráfica de pie
    generateOverallDowntimeChart();

    // Gráfica de columnas por día
    generateColumnChartByDay();

    generateColumnChartByStation();
  }
});

//Llamar updateAvailableOverallShifts  después de cargar los datos:
watch(downtimeResultsFetched, async (fetched) => {
  if (fetched) {
    await nextTick();
    updateAvailableOverallShifts(); // ✅ Actualiza turnos
    generateOverallDowntimeChart(); // ✅ Genera gráfica
  }
});
</script>

<style scoped>
/* =======================
   Drawer Filtros
   ======================= */
.q-drawer .q-input {
  width: 100%;
}
.q-drawer .q-btn {
  margin-top: 1em;
}

/* =======================
   Contenedor scrollable de tabla
   ======================= */
.scrollable-table-container {
  max-height: 500px; /* Ajusta la altura máxima para que se genere el scroll */
  overflow-y: auto; /* Habilita scroll vertical */
  position: relative;
  border: 1px solid #ccc;
  background-color: #f3f4f7;
  margin-top: 0;
  border-radius: 8px;
}

/* =======================
   Filas de tabla
   ======================= */
/* =======================
   Estilos Generales y Estructura para q-table
   ======================= */

/* 1. Forzar que la tabla respete estrictamente el contenedor (Anti-Scroll X) */
.custom-q-table .q-table__container {
  width: 100%;
}

.custom-q-table .q-table {
  table-layout: fixed !important;
  width: 100% !important;
}

/* =======================
   Encabezado (Headers)
   ======================= */
.custom-q-table .custom-header-row {
  background-color: #003153 !important;
}

.custom-q-table .custom-header-row th {
  /* Diseño visual */
  color: white !important;
  font-weight: bold !important;
  font-size: 15px !important;
  border-bottom: 2px solid #001f3f !important;

  /* Ajustes Anti-Scroll: Permitir 2 líneas si es necesario y reducir padding */
  white-space: normal !important;
  word-wrap: break-word;
  padding: 4px 8px !important;
  line-height: 1.2;
}

/* =======================
   Cuerpo de la Tabla (Body & Celdas)
   ======================= */

/* Zebra striping para las filas del body */
.custom-q-table .custom-body-row:nth-child(even) {
  background-color: #e9eef5;
}

.custom-q-table .custom-body-row:nth-child(odd) {
  background-color: #ffffff;
}

/* Hover animado para las filas */
.custom-q-table .custom-body-row:hover {
  background-color: #d0e4ff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

/* Estilo de texto y truncamiento (Ellipsis) para celdas */
.custom-q-table td {
  /* Diseño visual original */
  font-weight: bold;
  font-size: 14px;

  /* Ajustes Anti-Scroll: Cortar texto largo con "..." y reducir padding */
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  padding: 4px 8px !important;
}
.rounded-btn {
  border-radius: 10px;
  font-weight: bold;
  font-size: 14px;
  padding: 6px 12px; /* Controla el espacio interno horizontal y vertical */
  width: auto; /* Se adapta al contenido */
  min-width: unset; /* Elimina el tamaño mínimo forzado */
  border: 2px solid white;
}

/* =======================
   Resumen Downtime (Cards)
   ======================= */

.station-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: left;
}

.downtime-summary {
  padding: 1rem;
}

.line-group {
  margin-bottom: 2rem;
}

.station-card {
  display: flex;
  background-color: #f3f3f3;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem;
  padding-bottom: 0rem;
  margin: 0;
  width: 200px;
  font-size: 0.85rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  max-width: calc(25% - 0.6rem);
  min-width: 100px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.08);
}
.station-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.station-id {
  font-weight: bold;
  font-size: 1.1rem;
  color: #1a237e;
}

.station-duration {
  font-weight: bold;
  font-size: 1rem;
  color: #d84315;
  text-align: center;
}
.station-extra {
  font-size: 0.9rem;
  color: #424242;
}

.station-id,
.station-duration,
.station-extra {
  margin: 0;
  line-height: 1.2;
}

.turno-breakdown {
  margin-top: 0rem;
  font-size: 1rem;
  color: #555;
}

.station-extra {
  font-size: 0.9rem;
  color: #424242;
}

/* =======================
   Modal Grafica Downtime (Cards)
   ======================= */

.custom-modal-overlay {
  background-color: rgba(0, 0, 0, 0.6);
}

.custom-modal-card {
  max-width: 800px; /* Ajusta según lo que quieras */
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
}

.custom-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-chart-container {
  width: 100%;
  height: 400px; /* Puedes ajustar la altura de la gráfica */
}

/* =======================
   Estilos para Reloj
   ======================= */
.contenedor-reloj {
  width: 100%;
  text-align: center;
  padding: 10px;
}

.tiempo {
  width: 100%;
}

.fecha-ajustada {
  font-size: 1em; /* Reducido para que quepa */
  background: rgba(255, 255, 255, 0.5);
  padding: 10px;
  width: 100%;
  margin-bottom: 10px;
}

.fecha-ajustada span {
  display: inline;
}

.reloj {
  width: 100%;
  padding: 10px;
  font-size: 2em; /* Tamaño ideal para un ancho de 240px */
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

/************************************************* */

.kpi-card {
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
}
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.line-group {
  border: 1px solid #e0e0e0;
}

.station-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1em;
  margin-bottom: 1em;
  background-color: #fafafa;
  transition: all 0.25s ease;
}

.station-card:hover {
  transform: translateY(-3px);
  background-color: #ffffff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.station-id {
  font-weight: 600;
  color: #1976d2;
  font-size: 1.1em;
  margin-bottom: 0.3em;
}

.station-duration {
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5em;
}

.turno-breakdown p {
  margin: 0.1em 0;
  color: #666;
}

.text-caption {
  letter-spacing: 0.3px;
}

.q-avatar img {
  object-fit: contain;
}

/* =======================
    Estilos para Reloj (Digital y contrastado)
    ======================= */
.contenedor-reloj {
  width: 100%;
  text-align: center;
  padding: 10px;
  margin-top: auto; /* Mover al final si el drawer es alto */
}

.fecha-ajustada {
  font-size: 1em;
  background: white; /* Blanco */
  color: #1a237e; /* Azul oscuro */
  padding: 10px;
  width: 100%;
  margin-bottom: 0;
  border-radius: 8px 8px 0 0; /* Esquinas superiores */
  font-weight: bold;
}

.reloj {
  width: 100%;
  padding: 10px;
  font-size: 2.2em;
  background: #003153; /* Fondo oscuro y profesional */
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border-radius: 0 0 8px 8px; /* Esquinas inferiores */
}

.reloj p {
  line-height: 1;
  margin: 0;
  padding: 0 2px;
}

/* Estos estilos son menos relevantes si solo muestras horas y minutos */
.reloj .dos-puntos,
.reloj .caja,
.reloj .ampm {
  display: none;
}
/* ------------------------------------------------------------------- */
/* Drawer modern */
.modern-drawer {
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

/* Inputs modern */
.modern-input {
  --q-input-border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.modern-input.q-input--focused {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

/* Botón modern */
.modern-btn {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}
.modern-btn:hover {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

/* Encabezado */
.drawer-header {
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

/* Reloj y fecha */
.shadowed {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.shadowed-modern {
  background: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
}

/* =======================
    Estilos para Overlay de Carga de Reporte
    ======================= */
/* Transición suave para overlay */
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.4s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
.fade-overlay-enter-to,
.fade-overlay-leave-from {
  opacity: 1;
}

/* Overlay centrado y grande */
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

.shift-chip {
  width: 80px;
  padding: 2px 6px;
}

/* ✅ Nueva sintaxis recomendada */
:deep(.shift-chip .q-chip__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
  padding: 0;
  font-size: 1.1rem; /* ajusta el tamaño aquí */
  font-weight: 600; /* opcional */
}

.chips-container {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 8px;
  justify-content: left;
}

.modern-drawer {
  background: linear-gradient(180deg, #ffffff 0%, #f9fafc 100%);
}
</style>
