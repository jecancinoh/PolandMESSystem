<template>
  <q-layout view="lHh LpR lFf">
    <q-drawer
      v-model="drawer"
      side="left"
      show-if-above
      bordered
      :width="280"
      class="bg-white column no-wrap modern-drawer"
      behavior="desktop"
    >
      <div
        class="text-h6 text-weight-bolder text-primary flex items-center justify-center q-mb-md"
        style="padding-top: 65px"
      >
        <q-icon name="tune" color="primary" size="28px" class="q-mr-sm" />
        {{ $t("configuration.drawerTitle") }}
      </div>

      <q-separator />

      <q-card-section class="q-pt-md q-pb-md q-px-lg column gap-sm">
        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          :label="$t('configuration.selectYear')"
          outlined
          dense
          rounded
          color="primary"
          class="modern-input q-mb-md"
          hide-bottom-space
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="event" color="primary" />
          </template>
        </q-select>

        <q-select
          v-model="selectedMonth"
          :options="monthOptions"
          :label="$t('configuration.selectMonth')"
          emit-value
          map-options
          outlined
          dense
          rounded
          color="primary"
          class="modern-input"
          hide-bottom-space
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="calendar_today" color="primary" />
          </template>
        </q-select>

        <q-separator />

        <q-btn
          :label="$t('configuration.loadButton')"
          color="secondary"
          class="full-width rounded-btn q-mt-sm"
          @click="toggleload"
          :loading="reportStore.isLoading"
          :disable="!selectedYear"
        />
      </q-card-section>

      <q-separator />
      <div class="q-pa-md">
        <q-btn-dropdown
          split
          to="/start/pick-quasar-flavour"
          color="teal"
          rounded
          label="Select Date Range">
          <q-list>
            <div class="q-pa-md">
              <div class="q-pb-sm">
              Select Time Range
              </div>
            <q-date v-model="days" range multiple/>
            </div>
          </q-list>
        </q-btn-dropdown>
      </div>

      <q-separator />

      <q-item clickable>
        <q-btn
          color="green"
          :label="$t('hrxhr.label2')"
          icon="table_view"
          class="rounded-btn full-width"
          @click="handleExportExcel"
          dense
        />
      </q-item>

      <q-separator />

      <q-scroll-area class="col q-pa-sm">
        <q-card class="q-mb-sm shadow-1 rounded-borders">
          <q-card-section class="bg-primary text-white q-py-xs q-px-sm">
            <div class="kpi-title text-bold">
              {{ $t("kpiSidebar.monthlyKpiTitle") }} {{ periodLabel }}
            </div>
          </q-card-section>

          <q-list dense>
            <template v-if="reportStore.isLoading">
              <div
                class="full-width full-height flex flex-center column q-py-xl"
              >
                <q-spinner-bars color="primary" size="40px" />
                <p class="q-mt-md text-center">
                  {{ $t("configuration.loadingData") }}
                </p>
              </div>
            </template>

            <template v-else-if="monthlyData.length === 0">
              <q-item class="q-py-sm">
                <q-item-section
                  class="text-center text-grey-7"
                  :style="{ fontSize: '12px' }"
                >
                  {{ $t("kpiSidebar.noKpi") }}
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <q-item
                v-for="kpi in monthlyData"
                :key="kpi.i18nKey"
                class="q-py-none"
                style="
                  margin: 0 !important;
                  min-height: unset;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                <q-item-section>
                  <q-item-label
                    class="text-weight-medium text-grey-7"
                    :style="{ fontSize: '12px', lineHeight: '1.2' }"
                  >
                    {{ kpi.label }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label
                    :class="['text-bold', `text-${kpi.color}`]"
                    :style="{ fontSize: '16px', lineHeight: '1.2' }"
                  >
                    {{ kpi.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card>

        <q-separator spaced class="q-my-sm" />

        <q-card class="shadow-1 rounded-borders">
          <q-card-section class="bg-info text-white q-py-xs q-px-sm">
            <div class="kpi-title text-bold">
              {{ $t("kpiSidebar.annualKpiTitle") }} {{ selectedYearLabel }}
            </div>
          </q-card-section>

          <q-list dense>
            <template v-if="reportStore.isLoading">
              <div
                class="full-width full-height flex flex-center column q-py-xl"
              >
                <q-spinner-bars color="primary" size="40px" />
                <p class="q-mt-md text-center">
                  {{ $t("configuration.loadingData") }}
                </p>
              </div>
            </template>

            <template v-else-if="annualData.length === 0">
              <q-item class="q-py-sm">
                <q-item-section
                  class="text-center text-grey-7"
                  :style="{ fontSize: '12px' }"
                >
                  {{ $t("kpiSidebar.noKpi") }}
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <q-item
                v-for="kpi in annualData"
                :key="kpi.i18nKey"
                class="q-py-none"
                style="
                  margin: 0 !important;
                  min-height: unset;
                  border-bottom: 1px solid #eeeeee;
                "
              >
                <q-item-section>
                  <q-item-label
                    class="text-weight-medium text-grey-7"
                    :style="{ fontSize: '12px', lineHeight: '1.2' }"
                  >
                    {{ kpi.label }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label
                    :class="['text-bold', `text-${kpi.color}`]"
                    :style="{ fontSize: '16px', lineHeight: '1.2' }"
                  >
                    {{ kpi.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card>

        <div>
          <LanguageToggle />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page class="no-scroll-fix">
        <div
          v-if="hasData"
          class="row items-center justify-between q-mb-none q-pa-sm"
        >
          <!-- Logo + Título alineados a la izquierda -->
          <div class="row items-center">
            <img
              src="/img/AFL.png"
              style="width: 2.5em; height: 3em; margin-right: 0.5em"
              alt="Logo AFL"
            />
            <div class="text-h5 text-bold text-primary text-left">
              {{ $t("Reporte.title") }}
            </div>
          </div>

          <!-- Fecha y reloj alineados a la derecha -->
          <div class="text-primary text-right">
            <div class="text-bold">{{ fechaFormateada }}</div>
            <div class="reloj">{{ horaFormateada }}</div>
          </div>
        </div>

        <div class="q-pa-xs">
          <q-card
            v-if="hasData"
            class="q-mb-xs shadow-3 rounded-borders bg-grey-1"
          >
            <q-card-section class="q-pa-xs">
              <div
                class="text-subtitle1 text-primary q-mb-xs flex items-center text-weight-bold"
              >
                <q-icon name="tune" class="q-mr-sm" size="22px" />
                {{ $t("configuration.configTitle") }}
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-xs-12 col-sm-6 col-md-3">
                  <q-card flat bordered class="config-card">
                    <q-card-section class="q-pa-sm text-center">
                      <div class="section-title">
                        <q-icon name="category" class="q-mr-xs text-primary" />
                        {{ $t("configuration.countType") }}
                      </div>
                      <q-btn-toggle
                        v-model="selectedTipo"
                        toggle-color="primary"
                        color="white"
                        text-color="primary"
                        push
                        :options="[
                          {
                            label: $t('configuration.countTypeJobs'),
                            value: 'jobs',
                            icon: 'work',
                          },
                          {
                            label: $t('configuration.countTypeConnectors'),
                            value: 'connectors',
                            icon: 'settings_input_component',
                          },
                        ]"
                        @update:model-value="toggleMetric"
                        spread
                        class="full-width animated-toggle"
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-xs-12 col-sm-6 col-md-3">
                  <q-card flat bordered class="config-card">
                    <q-card-section class="q-pa-sm text-center">
                      <div class="section-title">
                        <q-icon name="insights" class="q-mr-xs text-accent" />
                        {{ $t("configuration.aggregationLevel") }}
                      </div>
                      <q-btn-toggle
                        v-model="groupByShift"
                        toggle-color="accent"
                        color="white"
                        text-color="accent"
                        push
                        :options="[
                          {
                            label: $t('configuration.groupByArea'),
                            value: false,
                            icon: 'factory',
                          },
                          {
                            label: $t('configuration.groupByAreaStation'),
                            value: true,
                            icon: 'groups',
                          },
                        ]"
                        spread
                        class="full-width animated-toggle"
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-xs-12 col-md-3">
                  <q-card flat bordered class="config-card">
                    <q-card-section class="q-pa-sm text-center">
                      <div class="section-title">
                        <q-icon name="schedule" class="q-mr-xs text-primary" />
                        {{ $t("configuration.filterByShift") }}
                      </div>

                      <q-btn-toggle
                        v-model="selectedShift"
                        toggle-color="primary"
                        color="white"
                        text-color="primary"
                        push
                        :options="shiftOptions"
                        spread
                        class="full-width animated-toggle"
                      />
                    </q-card-section>
                  </q-card>
                </div>
                <JobSearchCard />
              </div>
            </q-card-section>
          </q-card>

          <div v-if="reportStore.isLoading" class="text-center q-py-xl">
            <q-spinner-cube color="primary" size="50px" />
            <p class="q-mt-md">{{ $t("configuration.loadingData") }}</p>
          </div>

          <q-card
            v-else-if="hasData"
            class="shadow-4 rounded-borders bg-grey-1 q-pa-sm tabs-container"
          >
            <q-tabs
              v-model="tab"
              align="justify"
              indicator-color="transparent"
              active-color="primary"
              dense
              class="tabs-3d"
            >
              <q-tab name="daily" icon="event" :label="$t('tabs.daily')" />
              <q-tab
                name="weekly"
                icon="date_range"
                :label="$t('tabs.weekly')"
              />
              <q-tab
                name="monthly"
                icon="calendar_month"
                :label="$t('tabs.monthly')"
              />
            </q-tabs>

            <q-separator />

            <div class="tabs-container">
              <div class="tab-content">
                <!-- Mensual -->
                <div v-show="tab === 'monthly'" class="pivot-container">
                  <div class="row items-center q-my-sm q-ml-sm">
                    <h6 class="q-my-none text-primary">
                      {{ monthlyTitleNoShift }}
                    </h6>
                    <q-space />
                    <div class="q-mr-md">
                      <div class="q-my-none text-bold q-mr-md">
                        {{ $t("tabs.jobsTotal") }}
                      </div>
                      <div>
                        <q-chip
                          v-for="chip in monthlyShiftChips"
                          :key="chip.label"
                          :color="chip.color"
                          :text-color="chip.textColor"
                          :label="chip.label"
                          class="text-weight-bold"
                          square
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="table-auto-scroll">
                    <div class="pivot-table">
                      <div class="pivot-row pivot-header">
                        <div
                          class="pivot-cell"
                          v-for="col in pivotedMonthlyColumns"
                          :key="col.name"
                          :class="{ 'text-right': col.name !== 'StationType' }"
                        >
                          {{ col.label }}
                        </div>
                      </div>

                      <template
                        v-for="parentRow in pivotedMonthlyData"
                        :key="parentRow.StationType"
                      >
                        <div class="pivot-row">
                          <div
                            class="pivot-cell"
                            v-for="col in pivotedMonthlyColumns"
                            :key="col.name"
                            :class="{
                              'total-general bg-blue-1':
                                parentRow.StationType === $t('Reporte.total'),
                              'total-partial bg-teal-1':
                                parentRow.StationType.startsWith('TOTAL ') &&
                                parentRow.StationType !== $t('Reporte.total'),
                              'text-right':
                                col.name !== 'StationType' &&
                                col.name !== 'Total' &&
                                !parentRow.StationType.startsWith('TOTAL '),
                              'text-right text-bold text-primary':
                                col.name === 'Total',
                              'text-bold bg-teal-1 text-teal-8':
                                parentRow.isSubtotal,
                            }"
                          >
                            <div
                              v-if="col.name === 'StationType'"
                              class="flex items-center"
                            >
                              <q-btn
                                v-if="
                                  parentRow.details && parentRow.details.length
                                "
                                flat
                                round
                                dense
                                size="sm"
                                :icon="
                                  parentRow.isExpanded
                                    ? 'remove_circle'
                                    : 'add_circle'
                                "
                                @click="
                                  parentRow.isExpanded = !parentRow.isExpanded
                                "
                                class="q-mr-xs"
                              />
                              <span v-else class="q-ml-lg"></span>
                              <span class="text-no-wrap">{{
                                parentRow.StationType
                              }}</span>
                            </div>
                            <template v-else>
                              {{ parentRow[col.name] }}
                            </template>
                          </div>
                        </div>

                        <template v-if="parentRow.isExpanded">
                          <div
                            class="pivot-row pivot-detail-row"
                            v-for="childRow in parentRow.details"
                            :key="childRow.StationType"
                          >
                            <div
                              class="pivot-cell"
                              v-for="col in pivotedMonthlyColumns"
                              :key="col.name"
                              :class="{
                                'text-right': col.name !== 'StationType',
                              }"
                            >
                              <div
                                v-if="col.name === 'StationType'"
                                class="flex items-center"
                              >
                                <span
                                  class="text-no-wrap text-left **q-ml-none**"
                                  style="margin-left: -15px"
                                >
                                  {{ childRow.StationType }}
                                </span>
                              </div>
                              <span v-else class="text-no-wrap text-left">
                                {{ childRow[col.name] }}
                              </span>
                            </div>
                          </div>
                        </template>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Semanal -->
                <div v-show="tab === 'weekly'" class="pivot-container">
                  <div class="row items-center q-my-sm q-ml-sm">
                    <h6 class="q-my-none text-primary">
                      {{ weeklyTitleNoShift }}
                    </h6>
                    <q-space />
                    <div class="q-mr-md">
                      <div class="q-my-none text-bold q-mr-md">
                        {{ $t("tabs.jobsTotal") }}
                      </div>
                      <div>
                        <q-chip
                          v-for="chip in weeklyShiftChips"
                          :key="chip.label"
                          :color="chip.color"
                          :text-color="chip.textColor"
                          :label="chip.label"
                          class="text-weight-bold"
                          square
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="table-auto-scroll">
                    <div class="pivot-table">
                      <div class="pivot-row pivot-header">
                        <div
                          class="pivot-cell"
                          v-for="col in pivotedWeeklyColumns"
                          :key="col.name"
                          :class="{ 'text-right': col.name !== 'StationType' }"
                        >
                          {{ col.label }}
                        </div>
                      </div>

                      <template
                        v-for="parentRow in pivotedWeeklyData"
                        :key="parentRow.StationType"
                      >
                        <div class="pivot-row">
                          <div
                            class="pivot-cell"
                            v-for="col in pivotedWeeklyColumns"
                            :key="col.name"
                            :class="{
                              'total-general bg-blue-1':
                                parentRow.StationType === $t('Reporte.total'),
                              'total-partial bg-teal-1':
                                parentRow.StationType.startsWith('TOTAL ') &&
                                parentRow.StationType !== $t('Reporte.total'),
                              'text-right':
                                col.name !== 'StationType' &&
                                col.name !== 'Total' &&
                                !parentRow.StationType.startsWith('TOTAL '),
                              'text-right text-bold text-primary':
                                col.name === 'Total',
                              'text-bold bg-teal-1 text-teal-8':
                                parentRow.isSubtotal,
                            }"
                          >
                            <div
                              v-if="col.name === 'StationType'"
                              class="flex items-center"
                            >
                              <q-btn
                                v-if="
                                  parentRow.details && parentRow.details.length
                                "
                                flat
                                round
                                dense
                                size="sm"
                                :icon="
                                  parentRow.isExpanded
                                    ? 'remove_circle'
                                    : 'add_circle'
                                "
                                @click="
                                  parentRow.isExpanded = !parentRow.isExpanded
                                "
                                class="q-mr-xs"
                              />
                              <span v-else class="q-ml-lg"></span>
                              <span class="text-no-wrap">{{
                                parentRow.StationType
                              }}</span>
                            </div>
                            <template v-else>
                              {{ parentRow[col.name] }}
                            </template>
                          </div>
                        </div>

                        <template v-if="parentRow.isExpanded">
                          <div
                            class="pivot-row pivot-detail-row"
                            v-for="childRow in parentRow.details"
                            :key="childRow.StationType"
                          >
                            <div
                              class="pivot-cell"
                              v-for="col in pivotedWeeklyColumns"
                              :key="col.name"
                              :class="{
                                'text-right': col.name !== 'StationType',
                              }"
                            >
                              <div
                                v-if="col.name === 'StationType'"
                                class="flex items-center"
                              >
                                <span
                                  class="text-no-wrap text-left **q-ml-none**"
                                  style="margin-left: -15px"
                                >
                                  {{ childRow.StationType }}
                                </span>
                              </div>
                              <span v-else class="text-no-wrap text-left">
                                {{ childRow[col.name] }}
                              </span>
                            </div>
                          </div>
                        </template>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Diario (sin cambios) -->
                <div v-show="tab === 'daily'" class="pivot-container">
                  <div class="row items-center q-my-sm q-ml-sm">
                    <h6 class="q-my-none text-primary">
                      {{ dailyTitleNoShift }}
                    </h6>
                    <q-space />
                    <div class="q-mr-md">
                      <div class="q-my-none text-bold q-mr-md">
                        {{ $t("tabs.jobsTotal") }}
                      </div>
                      <div>
                        <q-chip
                          v-for="chip in dailyShiftChips"
                          :key="chip.label"
                          :color="chip.color"
                          :text-color="chip.textColor"
                          :label="chip.label"
                          class="text-weight-bold"
                          square
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="table-auto-scroll">
                    <div class="pivot-table">
                      <div class="pivot-row pivot-header">
                        <div
                          class="pivot-cell"
                          v-for="col in pivotedDailyColumns"
                          :key="col.name"
                          :class="{
                            'text-right': col.name !== 'StationType',
                            'weekend-header': col.isWeekend,
                          }"
                        >
                          {{ col.label }}
                        </div>
                      </div>

                      <template
                        v-for="parentRow in pivotedDailyData"
                        :key="parentRow.UniqueKey"
                      >
                        <div class="pivot-row">
                          <div
                            class="pivot-cell"
                            v-for="col in pivotedDailyColumns"
                            :key="parentRow.UniqueKey + '-' + col.name"
                            :class="{
                              'text-bold bg-blue-1':
                                parentRow.StationType === $t('Reporte.total'),

                              'text-bold bg-teal-1 text-teal-8':
                                parentRow.isSubtotal && !col.isWeekend,

                              'text-bold bg-grey-300 text-teal-8':
                                parentRow.isSubtotal && col.isWeekend,

                              'text-right':
                                col.name !== 'StationType' &&
                                col.name !== 'Total' &&
                                !parentRow.isSubtotal,

                              'text-right text-bold text-primary':
                                col.name === 'Total',

                              'weekend-cell': col.isWeekend,
                            }"
                          >
                            <!-- STATION TYPE COLUMN -->
                            <div
                              v-if="col.name === 'StationType'"
                              class="flex items-center"
                            >
                              <q-btn
                                v-if="parentRow.details?.length"
                                flat
                                round
                                dense
                                size="sm"
                                :icon="
                                  parentRow.isExpanded
                                    ? 'remove_circle'
                                    : 'add_circle'
                                "
                                @click="
                                  parentRow.isExpanded = !parentRow.isExpanded
                                "
                                class="q-mr-xs"
                              />

                              <span v-else class="q-ml-lg"></span>

                              <span class="text-no-wrap">
                                {{ parentRow.StationType }}
                              </span>
                            </div>

                            <!-- OTHER COLUMNS -->
                            <template v-else>
                              <span
                                v-if="isDailyClickableCell(parentRow, col)"
                                class="text-primary cursor-pointer hover-underline text-no-wrap"
                                @click="handleDailyClick(parentRow, col)"
                              >
                                {{ parentRow[col.name] }}
                              </span>

                              <span v-else class="text-no-wrap">
                                {{ parentRow[col.name] }}
                              </span>
                            </template>
                          </div>
                        </div>

                        <!-- DETAILS -->
                        <template v-if="parentRow.isExpanded">
                          <div
                            class="pivot-row pivot-detail-row"
                            v-for="childRow in parentRow.details"
                            :key="
                              parentRow.UniqueKey +
                              '-detail-' +
                              childRow.UniqueKey
                            "
                          >
                            <div
                              class="pivot-cell"
                              v-for="col in pivotedDailyColumns"
                              :key="
                                parentRow.UniqueKey +
                                '-detail-' +
                                childRow.UniqueKey +
                                '-' +
                                col.name
                              "
                              :class="{
                                'text-right': col.name !== 'StationType',
                                'weekend-cell': col.isWeekend,
                              }"
                            >
                              <!-- STATION TYPE IN DETAILS -->
                              <div
                                v-if="col.name === 'StationType'"
                                class="flex items-center"
                              >
                                <span
                                  class="text-no-wrap text-left"
                                  style="margin-left: -15px"
                                >
                                  {{ childRow.StationType }}
                                </span>
                              </div>

                              <!-- OTHER COLUMNS -->
                              <span
                                v-else
                                :class="{
                                  'text-primary cursor-pointer hover-underline':
                                    isDailyClickableCell(childRow, col),
                                  'text-no-wrap': true,
                                }"
                                @click="
                                  isDailyClickableCell(childRow, col) &&
                                    handleDailyClick(childRow, col)
                                "
                              >
                                {{ childRow[col.name] }}
                              </span>
                            </div>
                          </div>
                        </template>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card>

          <q-card
            v-else
            class="q-mt-md q-pa-lg text-center text-grey-6 shadow-3 rounded-borders"
          >
            <q-icon name="mdi-cloud-off-outline" size="xl" />
            <div class="text-h6 q-mt-sm">
              {{ $t("configuration.noDataAvailable") }}
            </div>
            <p>{{ $t("configuration.selectPeriodHint") }}</p>
          </q-card>
        </div>

        <q-dialog
          v-model="showJobsModal"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-card class="jobs-modal-card">
            <q-card-section class="row items-center q-pb-none">
              <div>
                <div class="text-h6 text-weight-bold">
                  {{ $t("Capture.detail") }}
                </div>
                <div class="text-subtitle2 text-grey-7">
                  {{ selectedContext.title }} - {{ selectedContext.date }}
                </div>
              </div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section class="q-pa-md">
              <q-table
                :rows="reportStore.jobsByDateResults"
                :columns="columns"
                row-key="RegDate1"
                flat
                bordered
                dense
                separator="cell"
                table-class="jobs-table"
                class="jobs-table-wrapper"
                :loading="loadingDetail"
                :pagination="{ rowsPerPage: 10 }"
              >
                <template v-slot:body-cell-JobNumber="props">
                  <q-td :props="props">
                    <div
                      class="text-primary text-bold cursor-pointer"
                      style="
                        text-decoration: underline;
                        text-underline-offset: 3px;
                      "
                      @click="handleDrillDown(props.value)"
                    >
                      <q-tooltip>
                        {{ $t("Capture.ver") }}{{ props.value }}</q-tooltip
                      >
                      {{ props.value }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-Turno="props">
                  <q-td :props="props">
                    <q-badge
                      :color="getTurnoColor(props.value)"
                      text-color="white"
                      class="text-bold"
                    >
                      {{ props.value }}
                    </q-badge>
                  </q-td>
                </template>

                <template v-slot:body-cell-EndJob="props">
                  <q-td :props="props">
                    <span
                      :class="{
                        'text-red-8 text-bold': !dayjs
                          .utc(props.row.StartJob)
                          .isSame(dayjs.utc(props.row.EndJob), 'day'),
                      }"
                    >
                      {{
                        formatSmartDate(
                          props.row.StartJob,
                          props.row.EndJob,
                          false
                        )
                      }}
                    </span>
                  </q-td>
                </template>

                <template v-slot:body-cell-CycleTimeMinutes="props">
                  <q-td :props="props">
                    <span
                      v-if="props.value !== null && props.value !== undefined"
                    >
                      {{ props.value }}
                      <span>min</span>
                    </span>
                    <span v-else>-</span>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                flat
                :label="$t('common.close')"
                color="primary"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="showTrackingModal" backdrop-filter="blur(4px)">
          <q-card style="width: 1200px; max-width: 95vw; border-radius: 12px">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6 text-primary flex items-center">
                <q-icon name="analytics" class="q-mr-sm" />
                {{ $t("Capture.traz") }} {{ selectedJobNumber }}
              </div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section class="q-pa-md">
              <q-table
                flat
                bordered
                dense
                :rows="reportStore2.searchResult"
                :columns="trackingColumns"
                row-key="JobNumber"
                :loading="reportStore2.loadingSearch"
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
                        class="trace-item-data"
                        :class="{
                          'last-station-highlight': isLastActiveStation(
                            props.row,
                            props.col.name
                          ),
                        }"
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
                            :class="
                              isLastActiveStation(props.row, props.col.name)
                                ? 'text-blue-10'
                                : 'text-green-10'
                            "
                            class="text-caption text-weight-medium q-ml-xs"
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
                :label="$t('Capture.actu')"
                icon="refresh"
                @click="handleDrillDown(selectedJobNumber)"
                :loading="reportStore2.loadingSearch"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted, reactive } from "vue";
import { useReportStore } from "src/stores/ReportStore";
import { Notify, useQuasar, Loading } from "quasar";
import { useJobTrackingStore } from "src/stores/useJobTrackingStore";
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

const reportStore2 = useJobTrackingStore();
const showTrackingModal = ref(false);
const selectedJobNumber = ref("");

const $q = useQuasar();
const { t, locale } = useI18n();
const fechaFormateada = ref("");
const horaFormateada = ref("");
import LanguageToggle from "src/components/LanguageToggle.vue";
import { useI18n } from "vue-i18n";

//Import JobSearchcard
import JobSearchCard from "src/components/JobSearchCard.vue";

// Totales por turno
const dailyTotalsByShift = ref({});
const weeklyTotalsByShift = ref({});
const monthlyTotalsByShift = ref({});

// --- KPIs sin traducir (Crudos) ---
const rawMonthlyKPIs = ref([]);
const rawAnnualKPIs = ref([]);

// Ref para datos mensuales y anuales (reactivos y asignables)
const monthlyData = ref([]);
const annualData = ref([]);

// Estado del Modal
const showJobsModal = ref(false);
const loadingDetail = ref(false);
const selectedContext = reactive({
  title: "",
  date: "",
});

const dailyShiftChips = computed(() => {
  // Asegúrate de acceder al valor del ref/reactive
  const selected = selectedShift.value;
  const totals = dailyTotalsByShift.value;

  // Clave: Retorna un array vacío si los totales aún no han cargado.
  if (!totals || Object.keys(totals).length === 0) return [];

  // Definimos los colores base para el estado "no seleccionado" (gris)
  const defaultColor = "grey-4"; // Un gris claro para el fondo
  const defaultTextColor = "grey-8"; // Un gris oscuro para el texto

  // Definimos los colores para el estado "seleccionado" (cyan-9)
  const activeColor = "cyan-9";
  const activeTextColor = "white";

  return ["N1", "N2", "N3", "N4"]
    .map((turno) => {
      const jobs = totals[turno] || 0;

      // Solo creamos el chip si hay trabajos (jobs > 0)
      if (jobs > 0) {
        let chipColor;
        let chipTextColor;

        // 1. Condición para cuando NO hay filtro (selected === null) o
        // 2. Condición para cuando el chip del turno coincide con la selección (selected === turno)
        if (selected === null || selected === turno) {
          // Asignar colores activos (cyan-9)
          chipColor = activeColor;
          chipTextColor = activeTextColor;
        } else {
          // Asignar colores por defecto (gris)
          chipColor = defaultColor;
          chipTextColor = defaultTextColor;
        }

        return {
          label: `${turno}: ${jobs.toLocaleString()}`,
          color: chipColor,
          textColor: chipTextColor,
        };
      }
      return null;
    })
    .filter((chip) => chip !== null);
});

const weeklyShiftChips = computed(() => {
  const selected = selectedShift.value; // Acceder al turno seleccionado
  const totals = weeklyTotalsByShift.value;

  // Clave: Retorna un array vacío si los totales aún no han cargado.
  if (!totals || Object.keys(totals).length === 0) return [];

  // Definimos los colores base para el estado "no seleccionado" (gris)
  const defaultColor = "grey-4";
  const defaultTextColor = "grey-8";

  // Definimos los colores para el estado "seleccionado" (blue-9)
  const activeColor = "blue-9";
  const activeTextColor = "white";

  return ["N1", "N2", "N3", "N4"]
    .map((turno) => {
      const jobs = totals[turno] || 0;

      if (jobs > 0) {
        let chipColor;
        let chipTextColor;

        // Si selected es null (Todos), O si el turno coincide con la selección
        if (selected === null || selected === turno) {
          // Asignar colores activos (blue-9)
          chipColor = activeColor;
          chipTextColor = activeTextColor;
        } else {
          // Asignar colores por defecto (gris)
          chipColor = defaultColor;
          chipTextColor = defaultTextColor;
        }

        return {
          label: `${turno}: ${jobs.toLocaleString()}`,
          color: chipColor,
          textColor: chipTextColor,
        };
      }
      return null;
    })
    .filter((chip) => chip !== null);
});

const monthlyShiftChips = computed(() => {
  const selected = selectedShift.value; // Acceder al turno seleccionado
  const totals = monthlyTotalsByShift.value;

  // Clave: Retorna un array vacío si los totales aún no han cargado.
  if (!totals || Object.keys(totals).length === 0) return [];

  // Definimos los colores base para el estado "no seleccionado" (gris)
  const defaultColor = "grey-4";
  const defaultTextColor = "grey-8";

  // Definimos los colores para el estado "seleccionado" (indigo-9)
  const activeColor = "indigo-9";
  const activeTextColor = "white";

  return ["N1", "N2", "N3", "N4"]
    .map((turno) => {
      const jobs = totals[turno] || 0;

      if (jobs > 0) {
        let chipColor;
        let chipTextColor;

        // Si selected es null (Todos), O si el turno coincide con la selección
        if (selected === null || selected === turno) {
          // Asignar colores activos (indigo-9)
          chipColor = activeColor;
          chipTextColor = activeTextColor;
        } else {
          // Asignar colores por defecto (gris)
          chipColor = defaultColor;
          chipTextColor = defaultTextColor;
        }

        return {
          label: `${turno}: ${jobs.toLocaleString()}`,
          color: chipColor,
          textColor: chipTextColor,
        };
      }
      return null;
    })
    .filter((chip) => chip !== null);
});

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

const drawer = ref(true);
// --- TIENDA PINIA ---
// Nota: Se asume que ReportStore está definido y tiene fetchMetrics, monthlyData, weeklyData, dailyData, e isLoading.
const reportStore = useReportStore();

// Inicializamos el año y mes actual
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const kpiCards = ref([]);

// --- OPCIONES DE SELECT Y BOTÓN ---
const yearOptions = computed(() => {
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push(y);
  }
  return years;
});

const monthOptions = computed(() => [
  { label: t("meses.all"), value: null },
  { label: t("meses.mes1"), value: 1 },
  { label: t("meses.mes2"), value: 2 },
  { label: t("meses.mes3"), value: 3 },
  { label: t("meses.mes4"), value: 4 },
  { label: t("meses.mes5"), value: 5 },
  { label: t("meses.mes6"), value: 6 },
  { label: t("meses.mes7"), value: 7 },
  { label: t("meses.mes8"), value: 8 },
  { label: t("meses.mes9"), value: 9 },
  { label: t("meses.mes10"), value: 10 },
  { label: t("meses.mes11"), value: 11 },
  { label: t("meses.mes12"), value: 12 },
]);

const shiftOptions = computed(() => [
  { label: t("tabs.all"), value: null },
  { label: "N1", value: "N1" },
  { label: "N2", value: "N2" },
  { label: "N3", value: "N3" },
  { label: "N4", value: "N4" },
]);

// --- ESTADO LOCAL ---
const selectedYear = ref(currentYear);
const initialMonthValue =
  monthOptions.value.find((o) => o.value === currentMonth)?.value ?? null;
const selectedMonth = ref(initialMonthValue);

const tab = ref("daily"); // Tab inicial

// Controla si se muestra Jobs o Puntas (Connectors)
const currentMetric = ref("jobs");

// Controla el filtro de Turno (null = Todos)
const selectedShift = ref(null);

// NUEVO: Controla si la data se agrupa también por Turno
const groupByShift = ref(true);

const selectedTipo = ref("jobs");

// --- FUNCIONALIDAD GENERAL ---

const hasData = computed(() => {
  return (
    reportStore.monthlyData.length > 0 ||
    reportStore.weeklyData.length > 0 ||
    reportStore.dailyData.length > 0
  );
});

async function loadData() {
  if (!selectedYear.value) {
    Notify.create({
      type: "warning",
      message: "Por favor, selecciona un año.",
    });
    return;
  }

  const monthValue = selectedMonth.value;

  await reportStore.fetchMetrics(parseInt(selectedYear.value), monthValue);

  if (!hasData.value) {
    Notify.create({
      type: "info",
      message:
        "La consulta se completó, pero no se encontraron datos para el período seleccionado.",
    });
  }
}

function toggleload() {
  monthlyData.value = [];
  annualData.value = [];

  loadDataAndKPIs();
}

// Cargar datos por defecto al montar el componente
onMounted(() => {
  loadDataAndKPIs();
  mostrarHora();

  // ⭐️ INICIAMOS EL TEMPORIZADOR: Llama a mostrarHora cada 1000 milisegundos (1 segundo)
  intervaloId = setInterval(mostrarHora, 1000);
});

// ⭐️ LIMPIAMOS EL TEMPORIZADOR al destruir el componente para evitar fugas de memoria
onUnmounted(() => {
  clearInterval(intervaloId);
});

// Implementar un watcher para recargar datos automáticamente al cambiar filtros
watch([selectedYear, selectedMonth], () => {
  if (selectedYear.value) {
    // 1. 🛑 REINICIAR: Limpia los datos de los KPI inmediatamente
    //    para mostrar el estado de "vacío" o el spinner de carga.
    monthlyData.value = [];
    annualData.value = [];

    loadDataAndKPIs();
  }
});

// Watcher para forzar la re-evaluación de los pivots al cambiar la segmentación/filtro de turno
watch([selectedShift, groupByShift], () => {
  // Las computed properties se encargan de la actualización
});

/**
 * Cambia la métrica activa ('jobs' a 'connectors' o viceversa).
 */
function toggleMetric(newMetricValue) {
  // Quasar pasa el 'value' del botón seleccionado (ej. 'Jobs' o 'Conectores')
  // como argumento. Simplemente lo asignamos a tu estado principal.
  currentMetric.value = newMetricValue;

  // Opcional: Si quieres mantener 'currentMetric.value' con valores en minúsculas
  // ('jobs', 'connectors'), haz una conversión aquí:
  // currentMetric.value = newMetricValue.toLowerCase();
}

// Ícono dinámico
const toggleButtonIcon = computed(() => {
  return currentMetric.value === "jobs"
    ? "settings_input_component" // ícono de puntas
    : "work"; // ícono de jobs
});

// Título dinámico para el botón de cambio
const toggleButtonLabel = computed(() => {
  return currentMetric.value === "jobs" ? "Mostrar Puntas" : "Mostrar Jobs";
});

// Helper para obtener el campo de la data basado en la métrica actual
const metricField = computed(() => {
  return currentMetric.value === "jobs" ? "Capturas_Jobs" : "Total_Connectors";
});

// Títulos dinámicos para los encabezados de las tablas
const metricLabel = computed(() => {
  return currentMetric.value === "jobs"
    ? t("configuration.countTypeJobs")
    : t("configuration.countTypeConnectors");
});

const shiftLabel = computed(() => {
  return selectedShift.value
    ? `(${t("configuration.shift")} ${selectedShift.value})`
    : t("configuration.allshift");
});

const groupingLabel = computed(() =>
  groupByShift.value ? "Segmentado por Turno" : "Agregado por Estación"
);

const periodLabel = computed(() => {
  // Encontrar el objeto del mes seleccionado
  const monthObj = monthOptions.value.find(
    (m) => m.value === selectedMonth.value
  );

  // Si existe, tomar su label; si no, dejar vacío
  const monthLabel = monthObj ? monthObj.label : "";

  const yearLabel = selectedYear.value || new Date().getFullYear();

  // Si hay mes seleccionado, mostrar "Mes Año", si no, solo el año
  return selectedMonth.value ? `${monthLabel} ${yearLabel}` : `${yearLabel}`;
});

const selectedYearLabel = computed(() => {
  // Retorna directamente el valor de la referencia reactiva 'selectedYear'
  // Si 'selectedYear' es null o undefined, puedes añadir un fallback (ej: new Date().getFullYear())
  return selectedYear.value || new Date().getFullYear();
});

const monthlyTitleNoShift = computed(
  () =>
    `${t("configuration.monthlyTitle")} (${metricLabel.value}) - ${
      shiftLabel.value
    } - ${selectedYearLabel.value}`
);

const weeklyTitleNoShift = computed(
  () =>
    `${t("configuration.weeklyTitle")} (${metricLabel.value}) - ${
      shiftLabel.value
    } - ${periodLabel.value}`
);

const dailyTitleNoShift = computed(
  () =>
    `${t("configuration.dailyTitle")} (${metricLabel.value}) - ${
      shiftLabel.value
    } - ${periodLabel.value}`
);

// -------------------------------------------------------------------
// --- FUNCIÓN CENTRAL DE PIVOTEO CON SEGMENTACIÓN (Reutilizable) ----
// -------------------------------------------------------------------
function processPivotedData(data, keyPrefix, pivotField) {
  const field = metricField.value; // espera string
  const totalColumnName = "Total"; // nombre de la propiedad que contiene totales
  const totalLabel = t("Reporte.total"); // etiqueta traducida para mostrar
  if (!data || data.length === 0) return [];

  // Conversor robusto para cualquier formato de fecha (mejor validar partes)
  function parseDate(dateStr) {
    if (!dateStr) return new Date(NaN);
    // si ya es Date
    if (dateStr instanceof Date) return dateStr;

    const s = String(dateStr).trim();
    const parts = s.split(/[\/-]/).map((p) => p.trim());
    if (parts.length >= 3) {
      // DD/MM/YYYY o DD-MM-YYYY
      if (parts[0].length === 2 && parts[2].length === 4) {
        return new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );
      }
      // YYYY/MM/DD o YYYY-MM-DD
      if (parts[0].length === 4) {
        return new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
      }
      // DD/MM/YY -> asumimos siglo 2000
      if (parts[2].length === 2) {
        return new Date(
          2000 + Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );
      }
    }

    // fallback: intentar con Date constructor
    const d = new Date(s);
    return isNaN(d) ? new Date(NaN) : d;
  }

  function formatDDMMYYYY(d) {
    if (!(d instanceof Date) || isNaN(d)) return null;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // 1. Filtrar por turno globalmente
  const filteredData = data.filter(
    (item) => !selectedShift.value || item.Turno === selectedShift.value
  );
  if (filteredData.length === 0) return [];

  // Ordenar por Production_Order (numérico)
  const sortedData = [...filteredData].sort(
    (a, b) =>
      (Number(a.Production_Order) || 0) - (Number(b.Production_Order) || 0)
  );

  const pivotMap = new Map();
  const grandTotalRow = {
    StationType: totalLabel,
    [totalColumnName]: 0,
  };
  const pivotKeysSet = new Set();
  const stationTypeOrder = new Set();

  // Generar rango completo de días si diario (normalizando formato dd/mm/yyyy)
  if (pivotField === "ProductionDate") {
    const dateList = filteredData
      .map((d) => parseDate(d.ProductionDate))
      .filter((d) => d instanceof Date && !isNaN(d));

    if (dateList.length > 0) {
      const minDate = new Date(Math.min(...dateList));
      const maxDate = new Date(Math.max(...dateList));
      let cursor = new Date(minDate);

      while (cursor <= maxDate) {
        const rawDate = formatDDMMYYYY(cursor); // dd/mm/yyyy
        if (rawDate)
          pivotKeysSet.add(`${keyPrefix}${rawDate.replace(/[\/-]/g, "_")}`);
        cursor.setDate(cursor.getDate() + 1);
      }
    }
  }

  // 2. Pivotear datos
  for (const item of sortedData) {
    const stationType = item.StationType ?? "Sin estación";
    const station = item.Station ?? "Sin estación";
    const rawPivotValue = item[pivotField];
    let pivotValueKey;

    if (pivotField === "ProductionDate") {
      // normalizar fecha a dd/mm/yyyy para formar la misma key que prepopulaste
      const parsed = parseDate(rawPivotValue);
      const normalized = formatDDMMYYYY(parsed);
      pivotValueKey = normalized
        ? normalized.replace(/[\/-]/g, "_")
        : String(rawPivotValue).replace(/[\/-]/g, "_");
    } else {
      pivotValueKey = String(rawPivotValue ?? "null");
    }

    const metricValue = Number(item[field]);
    const metric = Number.isFinite(metricValue) ? metricValue : 0;

    const uniqueKey = groupByShift.value ? `${station}` : `${stationType}`;
    const columnKey = `${keyPrefix}${pivotValueKey}`;

    if (pivotField !== "ProductionDate") pivotKeysSet.add(columnKey);
    stationTypeOrder.add(stationType);

    if (!pivotMap.has(uniqueKey)) {
      pivotMap.set(uniqueKey, {
        StationType: stationType,
        UniqueKey: uniqueKey,
        [totalColumnName]: 0,
        SortKey: Number(item.Production_Order) || 0,
        StationGroup: stationType,
        isSegment: !!groupByShift.value,
        Station: station,
        Shift: item.Turno,
      });
    }

    const row = pivotMap.get(uniqueKey);
    row[columnKey] = (Number(row[columnKey]) || 0) + metric;
    row[totalColumnName] = (Number(row[totalColumnName]) || 0) + metric;

    grandTotalRow[columnKey] = (Number(grandTotalRow[columnKey]) || 0) + metric;
    grandTotalRow[totalColumnName] =
      (Number(grandTotalRow[totalColumnName]) || 0) + metric;
  }

  // convertir pivotKeys a array ordenado (útil para render)
  const pivotKeys = Array.from(pivotKeysSet);
  // si son fechas, podrían venir como keyPrefix + dd_mm_yyyy: ordenamos por fecha si detectamos el formato
  const dateKeyRegex = new RegExp(`^${keyPrefix}(\\d{2})_(\\d{2})_(\\d{4})$`);
  if (pivotKeys.every((k) => dateKeyRegex.test(k))) {
    pivotKeys.sort((a, b) => {
      const ma = a.match(dateKeyRegex);
      const mb = b.match(dateKeyRegex);
      const da = new Date(Number(ma[3]), Number(ma[2]) - 1, Number(ma[1]));
      const db = new Date(Number(mb[3]), Number(mb[2]) - 1, Number(mb[1]));
      return da - db;
    });
  }

  const segmentedRows = Array.from(pivotMap.values());
  let consolidatedRows = [];

  // Rellenar columnas faltantes con 0
  for (const row of segmentedRows) {
    for (const key of pivotKeys) {
      if (!(key in row)) row[key] = 0;
    }
    if (!(totalColumnName in row)) row[totalColumnName] = 0;
  }

  // 3. Segmentación con subtotales (por StationType)
  if (groupByShift.value) {
    const groups = segmentedRows.reduce((acc, row) => {
      if (!acc[row.StationGroup]) acc[row.StationGroup] = [];
      acc[row.StationGroup].push(row);
      return acc;
    }, {});

    // ordenar station types por SortKey del primer elemento (si existe)
    const sortedStationTypes = Array.from(stationTypeOrder)
      .filter((k) => groups[k])
      .sort(
        (a, b) => (groups[a][0]?.SortKey || 0) - (groups[b][0]?.SortKey || 0)
      );

    for (const stationType of sortedStationTypes) {
      const segments = groups[stationType];
      if (!segments) continue;

      segments.sort((a, b) => {
        const shiftNumA =
          parseInt(String(a.Shift || "").replace(/\D/g, ""), 10) || 0;
        const shiftNumB =
          parseInt(String(b.Shift || "").replace(/\D/g, ""), 10) || 0;
        if (shiftNumA !== shiftNumB) return shiftNumA - shiftNumB;
        return String(a.Station).localeCompare(String(b.Station), undefined, {
          numeric: true,
        });
      });

      const parentRow = {
        StationType: `${stationType}`,
        UniqueKey: stationType,
        [totalColumnName]: segments.reduce(
          (sum, seg) => sum + (Number(seg[totalColumnName]) || 0),
          0
        ),
        details: segments.map((seg) => ({
          ...seg,
          StationType:
            `⚙️ ${seg.Station}` +
            (selectedShift.value ? ` (${seg.Shift})` : ""),
        })),
        isSubtotal: true,
        SortKey: segments[0].SortKey || 0,
      };

      for (const key of pivotKeys) {
        parentRow[key] = segments.reduce(
          (sum, seg) => sum + (Number(seg[key]) || 0),
          0
        );
      }

      consolidatedRows.push(parentRow);
    }
  } else {
    consolidatedRows = segmentedRows.sort((a, b) => a.SortKey - b.SortKey);
  }

  // Rellenar TOTAL GENERAL con claves faltantes
  for (const key of pivotKeys) {
    if (!(key in grandTotalRow)) grandTotalRow[key] = 0;
  }
  if (!(totalColumnName in grandTotalRow)) grandTotalRow[totalColumnName] = 0;

  // 4. Formateo final
  const formatNumericValue = (value) =>
    typeof value === "number" && value > 0
      ? value.toLocaleString()
      : value === 0
      ? "-"
      : value;

  const formatRow = (row) => {
    const formattedRow = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if ((keyPrefix && key.startsWith(keyPrefix)) || key === totalColumnName) {
        formattedRow[key] = formatNumericValue(Number(value) || 0);
      }
    }
    if (formattedRow.details)
      formattedRow.details = formattedRow.details.map(formatRow);
    return formattedRow;
  };

  const finalResult = consolidatedRows.map(formatRow);

  const formattedGrandTotal = formatRow({
    ...grandTotalRow,
    StationType: totalLabel,
  });

  if (finalResult.length > 0) return [...finalResult, formattedGrandTotal];
  return [];
}
// -------------------------------------------------------------------
// --- PIVOTS COMPUTADOS USANDO LA NUEVA FUNCIÓN GENÉRICA ------------
// -------------------------------------------------------------------

const pivotedMonthlyData = computed(() => {
  return processPivotedData(reportStore.monthlyData, "Mes_", "ProductionMonth");
});

const pivotedWeeklyData = computed(() => {
  return processPivotedData(
    reportStore.weeklyData,
    "Semana_",
    "ProductionWeek"
  );
});

const pivotedDailyData = computed(() => {
  return processPivotedData(reportStore.dailyData, "Fecha_", "ProductionDate");
});

// -------------------------------------------------------------------
// --- DEFINICIÓN DE COLUMNAS (Quasar Q-Table) -----------------------
// -------------------------------------------------------------------

// Columna Total dinámica
const totalColumn = computed(() => ({
  name: "Total",
  label: t("Reporte.total1"),
  align: "right",
  field: "Total",
  sortable: true,
  headerClasses: "bg-primary text-white",
  style: "font-weight: bold; min-width: 120px;",
}));

// Columnas para el modo Mensual Pivotado (Se mantiene igual, solo usa el totalColumn dinámico)
const pivotedMonthlyColumns = computed(() => {
  // Aseguramos que solo usamos los meses 1-12
  const monthColumns = monthOptions.value.slice(1, 13).map((month) => ({
    name: `Mes_${month.value}`,
    label: month.label.substring(0, 3),
    align: "right",
    field: `Mes_${month.value}`,
    sortable: false,
    headerClasses: "bg-grey-3",
  }));

  return [
    {
      name: "StationType",
      required: true,
      label: t("Reporte.tipo"),
      align: "left",
      field: "StationType",
      sortable: false, // Se desactiva la ordenación compleja
      style: "font-weight: bold; min-width: 170px;",
    },
    ...monthColumns,
    totalColumn.value,
  ];
});

// Columnas para el modo Semanal Pivotado
const pivotedWeeklyColumns = computed(() => {
  const data = reportStore.weeklyData || [];
  const uniqueWeeks = [
    ...new Set(data.map((item) => item.ProductionWeek)),
  ].sort((a, b) => a - b);

  if (!data.length || uniqueWeeks.length === 0) {
    return [
      {
        name: "StationType",
        label: t("Reporte.tipo"),
        align: "left",
        field: "StationType",
      },
      totalColumn.value,
    ];
  }

  const weekColumns = uniqueWeeks.map((week) => {
    // Buscamos la primera fila que tenga la semana para tomar ProductionDate
    const firstItem = data.find((item) => item.ProductionWeek === week);
    const dateRange = firstItem?.ProductionDate || "";

    return {
      name: `Semana_${week}`,
      label: `Sem${week}${dateRange ? ` (${dateRange})` : ""}`,
      align: "right",
      field: `Semana_${week}`,
      sortable: false,
      headerClasses: "bg-grey-3",
    };
  });

  return [
    {
      name: "StationType",
      required: true,
      label: t("Reporte.tipo"),
      align: "left",
      field: "StationType",
      sortable: false,
      style: "font-weight: bold; min-width: 170px;",
    },
    ...weekColumns,
    totalColumn.value,
  ];
});

// Columnas para el modo Diario Pivotado
const pivotedDailyColumns = computed(() => {
  const data = reportStore.dailyData;
  // Usar una copia del set para ordenar
  const uniqueDates = [
    ...new Set(data.map((item) => item.ProductionDate)),
  ].sort(); // Ya que las fechas están en formato 'dd/mm/yyyy' o 'dd-mm-yyyy', el sort() lexicográfico funciona bien si el mes es constante.

  if (!data || uniqueDates.length === 0) {
    return [
      {
        name: "StationType",
        label: t("Reporte.tipo"),
        align: "left",
        field: "StationType",
      },
      totalColumn.value,
    ];
  }

  const dateColumns = uniqueDates.map((date) => {
    // CLAVE: Asegurarse de que el formato de fecha sea 'yyyy/mm/dd' (o similar) para que new Date() funcione correctamente,
    // ya que el formato de entrada es 'dd/mm/yyyy' o 'dd-mm-yyyy'.
    const parts = date.split(/[\/-]/);
    const standardDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // Transforma a YYYY/MM/DD

    const dayLabel = parts[0] || date;
    const fieldName = `Fecha_${date.replace(/[\/-]/g, "_")}`;

    const dateObject = new Date(standardDate);
    const dayOfWeek = dateObject.getDay(); // 0 = Domingo, 6 = Sábado
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return {
      name: fieldName,
      label: dayLabel, // solo el número del día
      align: "right",
      field: fieldName,
      sortable: false,
      headerClasses: "bg-grey-3",
      style: "min-width: 50px;",

      // 💡 NUEVO INDICADOR: Lo usamos para aplicar estilos en el template
      isWeekend: isWeekend,
    };
  });

  return [
    {
      name: "StationType",
      required: true,
      label: t("Reporte.tipo"),
      align: "left",
      field: "StationType",
      sortable: false,
      style: "font-weight: bold; min-width: 170px;",
    },
    ...dateColumns,
    totalColumn.value,
  ];
});

// -----------------------------------------------
// Función para generar KPIs desde datos crudos
// -----------------------------------------------
function generateRawKPIs(data) {
  if (!data || data.length === 0) return { kpis: [], jobsByShift: {} };

  let totalJobs = 0;
  let totalConnectors = 0;
  const daysSet = new Set();
  const linesSet = new Set();
  const stationsSet = new Set();
  const jobsByShift = {};
  const jobsByStationType = {};

  data.forEach((item) => {
    const capturas = Number(item.Capturas_Jobs) || 0;
    const turno = item.Turno || "N/A";
    const stationType = item.StationType || "N/A";

    totalJobs += capturas;
    totalConnectors += Number(item.Total_Connectors) || 0;
    if (item.ProductionDate) daysSet.add(item.ProductionDate);
    if (item.Linea) linesSet.add(item.Linea);
    if (item.Station) stationsSet.add(item.Station);

    jobsByShift[turno] = (jobsByShift[turno] || 0) + capturas;
    jobsByStationType[stationType] =
      (jobsByStationType[stationType] || 0) + capturas;
  });

  // Mejor y peor turno
  let bestShift = { turno: "N/A", jobs: -1 };
  let worstShift = { turno: "N/A", jobs: Infinity };
  for (const turno in jobsByShift) {
    const jobs = jobsByShift[turno];
    if (jobs > bestShift.jobs) bestShift = { turno, jobs };
    if (jobs < worstShift.jobs && jobs > 0) worstShift = { turno, jobs };
  }
  if (worstShift.jobs === Infinity) worstShift = { turno: "N/A", jobs: 0 };

  // Mejor tipo de estación
  let bestStationType = { type: "N/A", jobs: -1 };
  for (const type in jobsByStationType) {
    const jobs = jobsByStationType[type];
    if (jobs > bestStationType.jobs) bestStationType = { type, jobs };
  }

  const diasConProduccion = daysSet.size || 1;
  const promedioConnectorsPorJob =
    totalJobs > 0 ? totalConnectors / totalJobs : 0;
  const capturasPorDiaPromedio = totalJobs / diasConProduccion;

  // Devuelve KPIs con keys i18n para labels
  return {
    kpis: [
      {
        i18nKey: "kpiSidebar.total",
        value: totalJobs.toLocaleString(),
        color: "primary",
      },
      {
        i18nKey: "kpiSidebar.totalc",
        value: totalConnectors.toLocaleString(),
        color: "secondary",
      },
      {
        i18nKey: "kpiSidebar.average",
        value: promedioConnectorsPorJob.toFixed(0),
        color: "accent",
      },
      {
        i18nKey: "kpiSidebar.capture",
        value: capturasPorDiaPromedio.toFixed(0),
        color: "positive",
      },
      {
        i18nKey: "kpiSidebar.max",
        value: bestStationType.jobs.toLocaleString(),
        color: "indigo",
        i18nParams: { type: bestStationType.type },
      },
      {
        i18nKey: "kpiSidebar.shiftmax",
        value: bestShift.jobs.toLocaleString(),
        color: "success",
        i18nParams: { turno: bestShift.turno },
      },
      {
        i18nKey: "kpiSidebar.shiftmin",
        value: worstShift.jobs.toLocaleString(),
        color: "negative",
        i18nParams: { turno: worstShift.turno },
      },
      {
        i18nKey: "kpiSidebar.stationact",
        value: stationsSet.size,
        color: "warning",
      },
      { i18nKey: "kpiSidebar.lineact", value: linesSet.size, color: "info" },
    ],
    jobsByShift,
  };
}

// -----------------------------------------------
// KPIs reactivos
// -----------------------------------------------

// Watch para reaccionar a cambios en el idioma
// 🎯 CLAVE: Watcher para reaccionar a cambios en el idioma (SÓLO TRADUCE ETIQUETAS)
watch(
  () => locale.value,
  () => {
    // Función de traducción simple y reutilizable
    const translateKPIs = (rawKpis) =>
      rawKpis.map((kpi) => ({
        ...kpi,
        // Solo se aplica la traducción al label usando las keys y params ya calculados
        label: t(kpi.i18nKey, kpi.i18nParams),
      }));

    // 1. Re-traduce los KPIs mensuales usando los datos crudos
    monthlyData.value = translateKPIs(rawMonthlyKPIs.value);

    // 2. Re-traduce los KPIs anuales usando los datos crudos
    annualData.value = translateKPIs(rawAnnualKPIs.value);
  },
  // Ejecuta inmediatamente para traducir la carga inicial
  { immediate: true }
);

// -----------------------------------------------
// Función para cargar datos y KPIs
// -----------------------------------------------
async function loadDataAndKPIs() {
  // 0. Cargar datos de la tienda Pinia (asumiendo que reportStore ya está inicializado)
  await loadData();

  if (!hasData.value) {
    // Resetear todos los refs si no hay data
    monthlyData.value = [];
    annualData.value = [];
    dailyTotalsByShift.value = {};
    weeklyTotalsByShift.value = {};
    monthlyTotalsByShift.value = {};
    // ✅ Resetear también los crudos
    rawMonthlyKPIs.value = [];
    rawAnnualKPIs.value = [];
    return;
  }

  // Helper para guardar los crudos y luego traducirlos para la visualización
  const translateAndAssign = (rawKpis, targetRef, rawTargetRef) => {
    rawTargetRef.value = rawKpis; // 1. 💾 Guardar los datos crudos (para el watcher de idioma)
    targetRef.value = rawKpis.map((kpi) => ({
      ...kpi,
      // 2. Aplicar la traducción para la visualización inmediata
      label: t(kpi.i18nKey, kpi.i18nParams),
    }));
  };

  // ----------------------------
  // Datos Mensuales (o del periodo seleccionado)
  // ----------------------------
  // Usamos dailyData ya que suele contener el detalle para el sidebar en la vista 'daily'
  // o si el reporte mensual es el periodo actual.
  const monthlyDisplaySource = reportStore.dailyData;
  const monthlyResult = generateRawKPIs(monthlyDisplaySource);

  // 🎯 GUARDAR Y TRADUCIR KPIs MENSUALES
  translateAndAssign(monthlyResult.kpis, monthlyData, rawMonthlyKPIs);

  // ----------------------------
  // Datos Anuales (Totales del año/periodo)
  // ----------------------------
  // Usamos monthlyData si está disponible, si no, el dailyData como fallback para un total.
  const annualSource =
    reportStore.monthlyData.length > 0
      ? reportStore.monthlyData
      : reportStore.dailyData;
  const annualResult = generateRawKPIs(annualSource);

  // 🎯 GUARDAR Y TRADUCIR KPIs ANUALES
  translateAndAssign(annualResult.kpis, annualData, rawAnnualKPIs);

  // ----------------------------
  // Totales por turno (CHIPS)
  // ----------------------------
  // Asignamos los totales de turno basados en el origen de datos correspondiente
  dailyTotalsByShift.value = generateRawKPIs(reportStore.dailyData).jobsByShift;
  weeklyTotalsByShift.value = generateRawKPIs(
    reportStore.weeklyData
  ).jobsByShift;
  // Usamos los totales calculados para el periodo/año para los totales mensuales
  monthlyTotalsByShift.value = annualResult.jobsByShift;

  console.log("Totales Diario:", dailyTotalsByShift.value);
  console.log("Totales Semanal:", weeklyTotalsByShift.value);
  console.log("Totales Mensual:", monthlyTotalsByShift.value);
}

// Definición de Columnas según el resultado de tu SP
const columns = [
  {
    name: "JobNumber",
    label: t("Capture.job"),
    field: "JobNumber",
    align: "center",
    sortable: true,
  },
  {
    name: "ConnectorsA",
    label: t("Capture.connA"),
    field: "ConnectorsA",
    align: "center",
  },
  {
    name: "ConnectorsB",
    label: t("Capture.connB"),
    field: "ConnectorsB",
    align: "center",
  },
  {
    name: "StationName",
    label: t("Capture.esta"),
    field: "StationName",
    align: "center",
    sortable: true,
  },
  {
    name: "StationType",
    label: t("Capture.tipo"),
    field: "StationType",
    align: "left",
  },
  {
    name: "Shift",
    label: t("Capture.turn"),
    field: "Shift",
    align: "center",
    sortable: true,
  },

  // Ajuste para Inicio Proceso
  {
    name: "StartJob",
    label: t("Capture.inic"),
    field: "StartJob",
    align: "center",
    sortable: true,
    format: (val, row) => formatSmartDate(row.StartJob, row.EndJob, true),
  },

  // Ajuste para Fin Proceso
  {
    name: "EndJob",
    label: t("Capture.fin"),
    field: "EndJob",
    align: "center",
    sortable: true,
  },

  // Tiempo de Ciclo
  {
    name: "CycleTimeMinutes",
    label: t("Capture.cicl"),
    field: "CycleTimeMinutes",
    align: "center",
    sortable: true,
  },
];

const handleDrillDown = async (jobNumber) => {
  if (!jobNumber) return;

  selectedJobNumber.value = jobNumber;

  try {
    // Llamada a la función del store específico
    await reportStore2.fetchJobDetails(jobNumber);

    // Abrimos el modal local tras recibir la respuesta
    showTrackingModal.value = true;
  } catch (error) {
    console.error("Error al obtener el tracking:", error);
  }
};

// Columnas dinámicas que reaccionan a reportStore2
const trackingColumns = computed(() => {
  if (!reportStore2.searchResult || reportStore2.searchResult.length === 0)
    return [];

  const firstRow = reportStore2.searchResult[0];
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
  const stationColumns = trackingColumns.value
    .map((c) => c.name)
    .filter((name) => name !== "JobNumber");

  const activeStations = stationColumns.filter((name) => {
    const val = row[name];
    return val && val !== "NULL" && String(val).trim() !== "";
  });

  return (
    activeStations.length > 0 &&
    activeStations[activeStations.length - 1] === colName
  );
};

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
      : startDate.format("DD/MM/YYYY hh:mm A");
  }

  // Lógica para END TIME
  if (!endDate) return "-";
  return startDate.isSame(endDate, "day")
    ? endDate.format("hh:mm A")
    : endDate.format("DD/MM/YYYY hh:mm A");
};

// Helper para formatear fechas dentro de la tabla
const formatDate = (date) => dayjs(date).format("DD/MM/YYYY HH:mm:ss");

// Lógica de colores para los turnos
const getTurnoColor = (turno) => {
  const map = {
    N1: "blue-7", // Lun-Jue Día
    N2: "green-7", // Vie-Dom Día
    N3: "indigo-10", // Lun-Jue Noche
    N4: "deep-purple-9", // Vie-Dom Noche
  };
  return map[turno] || "grey-7";
};

function isDailyClickableCell(row, col) {
  if (col.name === "StationType") return false;

  const value = Number(row[col.name]);

  const isDateColumn = col.name.startsWith("Fecha_");
  const isNotTotalColumn = col.name !== "Total";
  const isNotGrandTotal = row.StationType !== t("Reporte.total");
  const hasValue = !isNaN(value) && value > 0;

  return isDateColumn && isNotTotalColumn && isNotGrandTotal && hasValue;
}

/**
 * Función principal al hacer clic en una celda de la tabla Diario
 * Maneja la carga de datos del SP y abre el modal de detalle
 */
async function handleDailyClick(row, col) {
  // 0. Validamos que la celda tenga un valor mayor a 0
  const value = Number(row[col.name]);
  if (value <= 0) return;

  // 1. Limpiamos y formateamos la fecha para el SP (YYYY-MM-DD)
  // Asumimos que col.name viene como "Fecha_04_02_2026"
  const rawDate = col.name.replace("Fecha_", "").replace(/_/g, "/");

  const productionDate = dayjs(rawDate, "DD/MM/YYYY").format("YYYY-MM-DD");

  // Identificamos si es fila de Estación o de Tipo (Subtotal)
  const isStationTypeRow = row.isSubtotal === true;
  const isStationRow = !row.isSubtotal;

  const lang = localStorage.getItem("lang") || "en";

  // Preparamos el contexto para el título del modal
  selectedContext.date = dayjs(rawDate, "DD/MM/YYYY")
    .locale(lang)
    .format(lang === "es" ? "DD [de] MMMM, YYYY" : "DD MMMM YYYY");
  selectedContext.title = isStationRow ? row.Station : row.StationType;

  try {
    // 2. Mostramos el cargador (Usando la importación directa 'Loading')
    Loading.show({
      message: `${t("Capture.Carg")} ${selectedContext.title}...`,
      boxClass: "bg-grey-2 text-grey-9",
      spinnerColor: "primary",
    });

    loadingDetail.value = true;

    // 3. Ejecutamos la llamada al Store según el tipo de fila
    if (isStationRow) {
      console.log(`🔎 Ejecutando SP para Estación: ${row.Station}`);
      await reportStore.getJobsByProductionDate(
        productionDate,
        row.Station, // @StationName
        null // @StationType
      );
    } else if (isStationTypeRow) {
      console.log(`🔎 Ejecutando SP para Tipo de Estación: ${row.StationType}`);
      await reportStore.getJobsByProductionDate(
        productionDate,
        null, // @StationName
        row.StationType // @StationType
      );
    }

    // 4. Si la consulta fue exitosa, mostramos el modal
    showJobsModal.value = true;
  } catch (error) {
    console.error("❌ Error al obtener detalle del SP:", error);

    // Usando la importación directa 'Notify'
    Notify.create({
      type: "negative",
      message: "Hubo un error al consultar el detalle en la base de datos.",
      position: "top",
      timeout: 3500,
    });
  } finally {
    // 5. Ocultamos el cargador siempre, falle o no
    loadingDetail.value = false;
    Loading.hide();
  }
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  searchQueryCopy.value = searchQuery.value;
  await reportStore.fetchJobDetails(searchQuery.value);
  showSearchDialog.value = true;
};

const today = dayjs().format("YYYY-MM-DD");
const days = ref([
  { from: today, to: today },
]);

const handleExportExcel = async () => {
  // const data = await reportStore2.fetchWeeklyReport();
  console.log("days.value.raw: ", days.value);
  const { from, to } = days.value[0] || {};
  console.log("day.value: ", day.value);
  console.log("from: ", from);
  console.log("to: ", to);
  const data = await reportStore2.fetchWeeklyReport(from, to);
  if (!from || !to) {
    console.error("date range is missing:", { from, to });
  }

  const formatDate = (value) => {
    if (!value) return "";
    return dayjs(value.replace("Z", "")).format("DD-MM-YYYY HH:mm:ss");
  };

  if (data && data.length > 0) {
    try {
      const formattedData = data.map((row) => ({
        ...row,
        JobIn: formatDate(row.JobIn),
        JobOut: formatDate(row.JobOut),
        Startpause: formatDate(row.Startpause),
        Endpause: formatDate(row.Endpause),
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      /* ===== ESTILO HEADER ===== */
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });

        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
          font: {
            bold: true,
            color: { rgb: "FFFFFF" },
          },
          fill: {
            fgColor: { rgb: "4472C4" }, // Azul Excel
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }

      /* ===== ESTILO FILAS ===== */
      for (let R = 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

          if (!worksheet[cellAddress]) continue;

          worksheet[cellAddress].s = {
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
            fill:
              R % 2 === 0
                ? { fgColor: { rgb: "F2F2F2" } } // gris alternado
                : undefined,
            border: {
              top: { style: "thin", color: { rgb: "D0D0D0" } },
              bottom: { style: "thin", color: { rgb: "D0D0D0" } },
              left: { style: "thin", color: { rgb: "D0D0D0" } },
              right: { style: "thin", color: { rgb: "D0D0D0" } },
            },
          };
        }
      }

      /* ===== AUTO ANCHO COLUMNAS ===== */
      const columnWidths = Object.keys(formattedData[0]).map((key) => ({
        wch:
          Math.max(
            key.length,
            ...formattedData.map((row) =>
              row[key] ? row[key].toString().length : 0
            )
          ) + 2,
      }));

      worksheet["!cols"] = columnWidths;

      /* ===== FILTROS ===== */
      worksheet["!autofilter"] = {
        ref: XLSX.utils.encode_range(range),
      };

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Weekly Report");

      const fileName = `Weekly_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error generando el Excel:", error);
    }
  } else {
    console.warn("No hay datos para exportar");
  }
};
</script>

<style scoped>
/* =========================================================
   🎨 BOTONES Y BORDES
   ========================================================= */
.rounded-btn {
  border-radius: 10px;
  font-weight: bold;
  font-size: 14px;
  padding: 6px 12px;
  width: auto;
  border: 2px solid white;
  text-align: center !important;
}

.rounded-borders {
  border-radius: 12px;
}

/* =========================================================
   📊 TABLAS PIVOT Y SCROLL
   ========================================================= */

/* --- Contenedor con scroll horizontal --- */
.table-auto-scroll {
  width: 100%;
  display: block;
  overflow-x: auto;
}

/* Quasar Table: evitar overflow anormal */
.q-table__container {
  overflow-x: unset;
}

.q-table__container table {
  table-layout: auto;
  min-width: 100%;
}

/* Encabezados centrados */
.q-table th {
  text-align: center !important;
  white-space: nowrap;
}

/* --- Estructura base de la tabla pivot --- */
.pivot-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-collapse: collapse;
}

/* --- Filas principales --- */
.pivot-row {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  border-bottom: 1px solid #ccc;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

/* Primera fila de datos */
.pivot-row:not(.pivot-header):first-child > .pivot-cell {
  background-color: #fff3e0;
  color: #bf360c;
}

/* Filas alternas */
.pivot-row:nth-child(even):not(.pivot-header) > .pivot-cell {
  background-color: #fafafa;
}

/* Hover fila */
.pivot-row:hover:not(.pivot-header) > .pivot-cell {
  background-color: #e3f2fd;
  box-shadow: inset 0 0 0 9999px rgba(227, 242, 253, 0.2);
}

/* --- Celdas --- */
.pivot-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.6rem;
  border-right: 1px solid #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  flex: 1 1 0;
  box-sizing: border-box;
}

/* Primera columna: Tipo de Estación */
.pivot-cell:first-child {
  flex: 0 0 150px;
  justify-content: flex-start;
  font-weight: bold;
  padding-left: 0.8rem;
  border-left: 2px solid #a0a0a0 !important;
  border-right: 2px solid #bdbdbd !important;
}

/* Última columna: Total */
.pivot-cell:last-child {
  flex: 0 0 80px;
  font-weight: bold;
  border-right: 2px solid #a0a0a0 !important;
}

/* --- Cabecera --- */
.pivot-header {
  background-color: #003153;
  font-weight: bold;
  color: white;
  position: sticky;
  top: 0;
  z-index: 5;
}

.pivot-header .pivot-cell {
  border-top: 2px solid #a0a0a0 !important;
  border-bottom: 2px solid #a0a0a0 !important;
}

/* =========================================================
   📅 ESTILOS PARA SÁBADO Y DOMINGO
   ========================================================= */

/* Encabezado sábado/domingo */
.weekend-header {
  background-color: #e0e0e0 !important;
  color: #333333 !important;
  font-weight: bold;
  border-top: 2px solid #bdbdbd !important;
  border-bottom: 2px solid #bdbdbd !important;
  border-right: 1px solid #bdbdbd !important;
  border-left: 1px solid #bdbdbd !important;
}

/* Celdas de datos sábado/domingo */
.weekend-cell {
  background-color: #f5f5f5 !important;
  border-right: 1.5px solid #e0e0e0 !important;
  border-left: 1.5px solid #e0e0e0 !important;
}

/* Totales aplicados en sábados/domingos */
.pivot-row:last-child .weekend-cell {
  background-color: #e8e8e8 !important;
  font-weight: 600;
}

/* Fondo gris medio (Quasar grey-300) */
.bg-grey-300 {
  background-color: #e0e0e0 !important;
}

/* =========================================================
   🔢 TOTALES Y COLORES
   ========================================================= */

.bg-blue-1 {
  background-color: #d0e7ff !important;
  color: #0d47a1 !important;
  font-weight: bold;
}

.bg-teal-1 {
  background-color: #e0f2f1 !important;
  color: #00695c !important;
  font-weight: bold;
}

.text-bold {
  font-weight: bold;
}

.text-right {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Bordes especiales para total general */
.pivot-row:has(.text-bold.bg-blue-1),
.pivot-table .pivot-row:last-child .pivot-cell {
  border-top: 1px solid #666 !important;
  border-bottom: 1px solid #666 !important;
}

/* Fila de detalles */
.pivot-detail-row {
  background-color: #f5f5f5 !important;
}

.pivot-detail-row .pivot-cell:first-child {
  padding-left: 2.5rem !important;
}

/* =========================================================
   🧭 TABS Y CONTROLES
   ========================================================= */

.tabs-modern {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.tabs-modern .q-btn {
  flex: 1 1 auto;
  font-weight: 600;
  transition: all 0.3s ease;
  border-radius: 0;
}

.tabs-modern .q-btn-toggle__btn--active {
  background-color: #1976d2;
  color: white !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tabs-modern .q-btn:hover:not(.q-btn-toggle__btn--active) {
  background-color: #f5f5f5;
  cursor: pointer;
}

/* =========================================================
   ⚙️ CONFIGURACIÓN Y TARJETAS
   ========================================================= */

.config-card {
  transition: all 0.25s ease;
  border-radius: 12px;
  background: white;
}

.config-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-weight: 600;
  color: #546e7a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

/* =========================================================
   ✨ ANIMACIONES
   ========================================================= */

.animated-btn,
.animated-toggle,
.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 10px;
}

.animated-btn:hover,
.animated-toggle:hover,
.hover-scale:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.shadow-transition {
  transition: box-shadow 0.3s ease-in-out;
}

/* =========================================================
   📱 RESPONSIVE
   ========================================================= */
@media (max-width: 600px) {
  .tabs-modern {
    font-size: 0.9rem;
  }
}

/* =========================================================
   🧮 TOTALES EXTRA
   ========================================================= */

.total-general {
  background-color: #d0e7ff;
  color: #0d47a1;
  font-weight: bold;
  border-top: 2px solid #666;
  border-bottom: 2px solid #666;
}

.total-partial {
  background-color: #e0f2f1;
  color: #00695c;
  font-weight: bold;
}

.text-right.text-bold.text-primary {
  text-align: right;
  font-weight: bold;
  color: #1976d2;
  font-variant-numeric: tabular-nums;
}

/* =========================================================
   🧩 SCROLL FIXES
   ========================================================= */

.no-scroll-fix {
  overflow-y: auto !important;
  overflow-x: hidden;
}

/* QPage ajustes */
.q-page-container > .q-page:last-child {
  margin-bottom: 0 !important;
}

.q-page > .q-pa-sm:last-child {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

/* =========================================================
   ⏰ ESTILOS PARA EL RELOJ
   ========================================================= */

.contenedor-reloj {
  width: 100%;
  text-align: center;
  padding: 10px;
}

.tiempo {
  width: 100%;
}

.fecha-ajustada {
  font-size: 1em;
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
  font-size: 1.5em;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.reloj p {
  line-height: 1;
  margin: 0;
  padding: 0 2px;
}

.reloj .dos-puntos {
  font-size: 0.8em;
}

.reloj .caja {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 0.5em;
  margin-left: 5px;
}

.reloj .ampm {
  margin-bottom: 2px;
}

.fecha-ajustada .diaSemana {
  margin-right: 5px;
}

.tabs-3d .q-tab {
  margin: 0 6px;
  background: linear-gradient(#fafafa, #e0e0e0);
  border-radius: 12px;
  border: 1px solid #bdbdbd;

  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 3px 0 #9e9e9e;

  transition: all 0.18s cubic-bezier(0.25, 0.8, 0.25, 1);

  min-height: 40px !important;
  height: 40px !important;
  padding: 0 10px !important;
}

.tabs-3d .q-tab__content {
  gap: 4px; /* Mejor balance icono + texto */
}

.tabs-3d .q-tab:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 0 #757575, 0 0 6px rgba(0, 0, 0, 0.1);
}

.tabs-3d .q-tab.q-tab--active {
  background: linear-gradient(#e8f4ff, #d0e8ff);
  border-color: #2196f3;
  transform: translateY(-3px);
  box-shadow: 0 5px 0 #42a5f5, 0 0 8px rgba(66, 165, 245, 0.2);
  font-weight: bold;
  color: #1976d2;
}

.tabs-3d .q-tab:focus-visible {
  outline: 2px solid #42a5f5;
  outline-offset: 2px;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-underline:hover {
  text-decoration: underline;
}

.q-table td:nth-child(7),
.q-table td:nth-child(8) {
  min-width: 150px;
}
/* MODAL CARD - El secreto está en min-content */
.jobs-modal-card {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border: none;
  width: min-content !important; /* Fuerza al card a ajustarse al ancho de la tabla */
  max-width: 95vw; /* Seguridad para pantallas pequeñas */
  border-radius: 12px;
  overflow: hidden;
}

/* CONTENEDOR DE LA TABLA */
.jobs-table-wrapper {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  /* Eliminamos el min-width: 100% para que no fuerce expansión */
}

/* TABLA ESPECÍFICA */
.jobs-table {
  width: auto !important; /* La tabla solo mide lo que miden sus columnas */
}

/* HEADER */
.jobs-table-wrapper :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  color: white;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 14px; /* Un poco más de aire lateral */
  white-space: nowrap; /* Evita que los títulos se rompan */
}

/* CELDAS */
.jobs-table-wrapper :deep(tbody td) {
  padding: 10px 14px;
  color: #455a64;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap; /* Evita que los datos se amontonen o creen scroll */
  text-align: center;
}

/* EFECTO HOVER Y ZEBRA */
.jobs-table-wrapper :deep(tbody tr) {
  transition: all 0.2s ease;
}

.jobs-table-wrapper :deep(tbody tr:hover) {
  background-color: #f1f8ff !important;
}

.jobs-table-wrapper :deep(tbody tr:hover td:first-child) {
  box-shadow: inset 4px 0 0 #1976d2;
}

.jobs-table-wrapper :deep(tbody tr:nth-child(even)) {
  background-color: #fafbfc;
}

/* SCROLLBAR REFINADO */
.jobs-table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.jobs-table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.jobs-table-wrapper::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

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
