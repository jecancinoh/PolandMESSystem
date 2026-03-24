<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer
      side="left"
      show-if-above
      v-model="drawerOpen"
      bordered
      :width="260"
      class="bg-blue-grey-1 sidebar-minimal column"
    >
      <div class="q-pa-md">
        <div
          class="text-h6 text-weight-bold q-mb-md flex items-center text-grey-10"
        >
          <q-icon
            name="precision_manufacturing"
            color="primary"
            class="q-mr-sm"
            size="28px"
          />
          <!-- Sistema MES -->
          {{ $t("app.title") }}
        </div>
        <q-separator class="q-mb-md" />

        <div
          class="text-subtitle1 text-weight-bold q-mb-sm text-grey-9 flex items-center justify-center"
        >
          <q-icon name="info" color="primary" size="20px" class="q-mr-sm" />
          <!-- Información General -->
          {{ $t("sidebar.info") }}
        </div>
        <q-separator class="q-mb-md" />

        <q-list separator>
          <q-item class="q-py-sm station-item">
            <q-item-section avatar>
              <q-icon name="factory" color="blue-grey-6" size="24px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle2 text-weight-bold text-grey-9">
                <!-- Estación -->
                {{ $t("sidebar.station") }}
              </q-item-label>
              <q-item-label
                caption
                class="text-h2 text-weight-bold text-grey-10"
              >
                {{ stationStore.getStationName || "----" }}
              </q-item-label>
              {{ stationStore.stationDescription }}
            </q-item-section>
            <q-item-section side class="absolute-top-right q-pt-sm q-pr-sm">
              <!-- Lógica para el icono de la estación: palomita verde si no hay pendientes, círculo si hay -->
              <q-icon
                v-if="!productionStore.hasPendingScans"
                name="check_circle"
                color="green-6"
                size="14px"
              />
              <q-icon v-else name="circle" color="green-6" size="8px" />
            </q-item-section>
          </q-item>

          <!-- OPERADOR: Este elemento se mantiene con animación de parpadeo -->
          <q-item
            :clickable="!operatorStore.isLoggedIn"
            v-ripple
            class="q-py-sm operator-item"
            :class="{ 'operator-item-flash': !operatorStore.isLoggedIn }"
            @click="showOperatorWelcome"
          >
            <q-item-section avatar>
              <q-icon name="person" color="green-6" size="24px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle2 text-weight-bold text-grey-9">
                <!-- Operador -->
                {{ $t("sidebar.operator") }}
              </q-item-label>
              <q-item-label caption class="text-grey-7 text-caption">
                <template v-if="operatorStore.isLoggedIn">
                  <div
                    v-for="(op, index) in operatorStore.activeOperators"
                    :key="index"
                  >
                    {{ op.name }}
                  </div>
                  <q-btn
                    dense
                    size="sm"
                    :label="$t('sidebar.operatorChange')"
                    color="pink-9"
                    class="q-mt-md"
                    @click="showOperatorWelcome"
                  />
                </template>
                <template v-else> {{ $t("sidebar.unregistered") }}</template>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item class="q-py-sm">
            <q-item-section avatar>
              <q-icon name="access_time" color="amber-6" size="30px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle2 text-weight-bold text-grey-9">
                <!-- Fecha de Producción -->
                {{ $t("sidebar.prodDate") }}
              </q-item-label>
              <q-item-label caption class="text-grey-7 text-caption">
                <!-- Fecha: -->
                {{ $t("sidebar.date") }}:
                <span class="text-weight-bold">{{ currentDatePoland }}</span>
              </q-item-label>
              <q-item-label caption class="text-grey-7 text-caption">
                PL : {{ currentTimePoland }}
              </q-item-label>
              <q-item-label caption class="text-grey-7 text-caption">
                MX: {{ currentTime }}
              </q-item-label>
              <q-item-label caption class="text-grey-7 text-caption">
                <!-- Turno: -->
                {{ $t("sidebar.shift") }}:
                <span class="text-weight-bold">{{
                  productionStore.currentShift
                }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item class="q-py-sm">
            <q-item-section avatar>
              <q-icon name="apps" color="pink-9" size="24px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-subtitle2 text-weight-bold text-grey-9">
                <!-- Opciones Disponibles -->
                {{ $t("sidebar.options") }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator class="q-mb-md" />

        <!-- ALERTA DE TIEMPO DE INACTIVIDAD EN LA ESTACIÓN -->

        <div
          v-if="currentStation && currentStation.BanderaAlerta == 1"
          class="q-mt-sm q-pa-xs q-px-sm bg-orange-2 text-orange-10 text-center rounded-borders shadow-1 flex items-center justify-center"
          style="
            border-left: 3px solid #f57c00;
            transform: scale(0.9);
            font-size: 0.85rem;
          "
        >
          <q-icon name="warning" color="red-10" size="sm" class="q-mr-xs" />
          <div>
            <div class="text-bold">{{ $t("dt.Note0") }}</div>
            <div>
              {{ $t("dt.Note1") }}
              <strong>{{ currentStation.TiempoInactividad }}</strong>
            </div>
          </div>
        </div>

        <div
          class="q-gutter-sm q-px-md q-pb-md q-mt-md flex column items-start"
        >
          <div class="flex q-gutter-sm">
            <q-btn
              v-if="drawingRows.length > 0"
              round
              unelevated
              :class="[
                'station-item-flash',
                'q-mb-xs',
                {
                  'square-button-help': !stationStore.showEpoxyBtn,
                  'square-button': stationStore.showEpoxyBtn,
                },
              ]"
              @click="showAFLDrawings()"
              size="md"
            >
              <div class="flex flex-center column">
                <q-icon name="attachment" color="blue-grey-6" size="20px" />
                <div class="text-caption text-weight-bold text-grey-7 q-mt-xs">
                  <!-- Documentos -->
                  {{ $t("sidebar.documents") }}
                </div>
              </div>
            </q-btn>

            <q-btn
              v-if="stationStore.showEpoxyBtn && operatorStore.isLoggedIn"
              round
              unelevated
              :class="[
                {
                  'square-button-help': drawingRows.length == 0,
                  'square-button': stationStore.showEpoxyBtn,
                },
                { 'epoxy-alert-flash': timerSecondsLeft <= 0 },
              ]"
              @click="showEpoxy()"
              size="lg"
            >
              <div class="flex flex-center column">
                <q-icon
                  name="science"
                  :color="timerSecondsLeft <= 0 ? 'grey' : 'grey'"
                  size="20px"
                />
                <div
                  class="text-caption text-weight-bold"
                  :class="timerSecondsLeft <= 0 ? 'text-grey-7' : 'text-grey-7'"
                >
                  <!-- Epoxy -->
                  {{ $t("sidebar.epoxy") }}
                </div>
              </div>
            </q-btn>
          </div>
          <q-btn
            v-if="!shouldBlockMainContent"
            round
            unelevated
            class="square-button-help station-item-flash-help q-mb-xs q-ml-md"
            @click="showAFLHelp()"
            size="lg"
          >
            <div class="flex flex-center column">
              <q-icon name="support_agent" color="blue-grey-6" size="20px" />
              <div class="text-caption text-weight-bold text-grey-7 q-mt-xs">
                <!-- Ayuda -->
                {{ $t("sidebar.help") }}
              </div>
            </div>
          </q-btn>

          <!--Boton de Impresion-->
          <q-btn
            v-if="!shouldBlockMainContent && PrintStore.printerIP"
            round
            unelevated
            class="square-button-help station-item-flash-help q-mb-xs q-ml-md"
            @click="handlePrint()"
            size="lg"
          >
            <div class="flex flex-center column">
              <q-icon name="print" color="blue-grey-6" size="20px" />
              <div class="text-caption text-weight-bold text-grey-7 q-mt-xs">
                {{ $t("sidebar.print") }}
              </div>
            </div>
          </q-btn>

          <q-list class="q-mt-md"> </q-list>
        </div>

        <div class="q-mt-xl">
          <LanguageToggle />
        </div>
      </div>
      <q-list class="q-mt-md"> </q-list>
      <div class="q-mt-auto">
        <q-list separator>
          <q-item
            clickable
            v-ripple
            class="q-py-sm"
            :class="{ 'station-item-flash': !stationStore.isStationConfigured }"
            active-class="sidebar-active-item"
            @click="showConfigurationDrawer"
          >
            <q-item-section avatar>
              <q-icon name="settings" color="blue-grey-6" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium text-grey-9">
                <!--configuracion-->
                {{ $t("sidebar.config") }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pt-sm q-px-lg main-content-minimal">
        <!-- Overlay de Downtime Active  (visible si no hay operador logueado O estación no configurada) -->
        <div class="downtime-overlay-full" v-if="isDowntimeActive || showAlert">
          <div class="text-center">
            <img
              src="/img/clock2.gif"
              alt="Downtime activo"
              class="q-mb-md"
              style="width: 150px; height: 150px"
            />

            <div class="text-h4 text-weight-bold text-grey-8 q-mb-sm">
              {{ $t("overlay.downtimeActiveTitle") }} "{{
                showAlert ? $t("overlay.automatic") : downtimeReasonToShow
              }}" {{ $t("overlay.downtimeActiveTitle2") }}
            </div>

            <div class="text-h6 text-grey-7 q-mb-sm">
              <div>
                {{ $t("overlay.eventN") }} #{{ downtimeEventsLengthToShow }} -
                {{ $t("overlay.downtimeId")
                }}{{ showAlert ? autoDowntimeIdLS : downtimeIdToShow }}
              </div>
              <div class="text-h6 text-grey-7 q-mb-sm">
                {{ $t("overlay.start") }}
                <span class="text-weight-bold">
                  {{
                    showAlert
                      ? formatDowntimeStart(alertTimestamp)
                      : downtimeStartToShow
                  }}
                </span>
              </div>

              <div class="text-h6 text-grey-7 q-mb-sm">
                <span class="text-h4 text-weight-bold">{{
                  $t("overlay.inProgress")
                }}</span>
              </div>
            </div>

            <q-btn
              :label="$t('overlay.terminate')"
              color="red"
              size="lg"
              icon-right="touch_app"
              class="q-mt-md q-px-xl text-weight-bold"
              @click="handleTerminarDowntime"
            />
          </div>
        </div>

        <!-- Overlay de bienvenida (visible si no hay operador logueado O estación no configurada) -->
        <div class="welcome-overlay-full" v-if="shouldBlockMainContent">
          <div class="text-center">
            <div class="text-h3 text-weight-bold text-grey-8 q-mb-sm">
              <!-- ¡Bienvenido al Sistema MES! -->
              {{ $t("welcome.title") }}
            </div>

            <div
              class="text-h5 text-blue-grey-8 q-mb-lg q-mx-auto subtitle-width-adjusted"
            >
              <template v-if="!stationStore.isStationConfigured">
                <!-- Configura tu estación para comenzar. -->
                {{ $t("welcome.needConfig") }}
              </template>
              <template v-else-if="!operatorStore.isLoggedIn">
                {{ $t("welcome.needOperator") }}
              </template>
            </div>

            <img src="/img/Fiber_PNG.png" alt="Logo de Fibra" class="q-mt-lg" />
          </div>
        </div>

        <!-- CONTENIDO PRINCIPAL (solo visible si estación y operador están configurados) -->
        <div class="row q-col-gutter-lg q-mb-sm" v-if="!shouldBlockMainContent">
          <div class="col-12 col-lg-8 flex-column-container">
            <!--Seccion para Escaneo de un nuevo Cable -->
            <q-card
              id="scan-card-id"
              class="scan-card q-mb-lg shadow-2"
              :style="{ 'border-color': scanCardBorderColor }"
              :class="{ 'border-flash-active': flashAnimationActive }"
            >
              <q-card-section class="flex items-center q-pb-none">
                <q-icon
                  name="qr_code_scanner"
                  color="grey-8"
                  class="q-mr-sm"
                  size="28px"
                />
                <div class="text-subtitle text-weight-bold text-grey-8">
                  <!--Escanea un Nuevo Cable-->
                  {{ $t("scan.title") }}
                </div>
              </q-card-section>
              <q-card-section class="q-pt-md">
                <q-input
                  v-model="scanInput"
                  dense
                  @keyup.enter="onEnter"
                  color="grey"
                  bg-color="white"
                >
                  <template v-slot:append>
                    <q-btn
                      round
                      dense
                      flat
                      icon="send"
                      color="grey"
                      @click="onEnter"
                      :disable="!scanInput.trim()"
                    />
                  </template>
                </q-input>
              </q-card-section>
            </q-card>

            <!--Seccion para KPI's de la estación -->
            <div class="row q-col-gutter-lg q-mb-lg">
              <div
                v-for="metric in metrics"
                :key="metric.title"
                class="col-12 col-sm-6 col-md-3"
              >
                <q-card
                  class="kpi-card-compact shadow-1"
                  :class="[
                    metric.cardClass,
                    // 1. REEMPLAZO en :class
                    metric.title === $t('kpi.downtime') && alertDowntime
                      ? 'downtime-alert-flash'
                      : '',
                  ]"
                  @click="
                    // 2. REEMPLAZO en @click
                    metric.title === $t('kpi.downtime')
                      ? showDowntimeDetails()
                      : null
                  "
                  :clickable="metric.title === $t('kpi.downtime')"
                  v-ripple="metric.title === $t('kpi.downtime')"
                >
                  <q-card-section class="kpi-content-compact">
                    <div class="kpi-icon-wrapper-compact">
                      <q-icon
                        :name="metric.icon"
                        :color="metric.iconColor"
                        size="32px"
                      />
                    </div>

                    <div class="kpi-details-compact">
                      <div
                        class="text-caption text-blue-grey-6 q-mb-xs kpi-title-full"
                      >
                        {{ metric.title }}
                      </div>

                      <div
                        class="text-h6 text-weight-bold text-blue-grey-10 no-wrap ellipsis"
                      >
                        {{ metric.value }}
                      </div>

                      <!-- 👇 Mostrar cantidad de eventos solo si es Downtime -->
                      <div
                        v-if="metric.title === $t('kpi.downtime')"
                        class="text-caption text-weight-medium text-grey-7 q-mt-xs"
                        style="display: flex; gap: 0.25rem; align-items: center"
                      >
                        <q-badge rounded color="primary">
                          {{ downtimeEvents.length }}
                          {{
                            downtimeEvents.length === 1
                              ? $t("graph.event")
                              : $t("graph.events")
                          }}
                        </q-badge>

                        <q-badge
                          v-if="alertDowntime"
                          color="pink-5"
                          rounded
                          floating
                          style="right: -10px; top: 12px; font-size: 12px"
                        >
                          {{ unjustifiedCount }}
                          {{
                            unjustifiedCount === 1
                              ? $t("downtimepanel.pending")
                              : $t("downtimepanel.pendings")
                          }}
                        </q-badge>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!--Seccion para Historial de Producción reciente -->
            <q-card
              class="shadow-1 production-table-card full-height-card q-mb-md"
            >
              <q-card-section class="flex items-center justify-between">
                <div
                  class="production-history-title flex items-center q-my-none"
                >
                  <q-icon
                    name="list_alt"
                    color="grey-7"
                    class="q-mr-sm"
                    size="20px"
                  />
                  <!-- Historial de Producción Reciente-->
                  {{ $t("history.title") }}
                </div>
              </q-card-section>

              <q-table
                :rows="productionStore.productionRows"
                :columns="columns"
                row-key="id"
                flat
                :rows-per-page-options="[5]"
                :pagination="{
                  sortBy: 'scanEnd',
                  descending: false,
                  rowsPerPage: 4,
                }"
                :filter="filter"
                class="minimal-q-table"
              >
                <template v-slot:no-data>
                  <div class="no-data-container">
                    <q-icon
                      name="hourglass_empty"
                      size="34px"
                      color="orange-6"
                      class=""
                    />
                    <div
                      class="text-subtitle1 q-mt-sm text-weight-medium text-orange-10"
                    >
                      {{ $t("history.noData") }}
                    </div>
                    <div class="text-grey-7 text-weight-bold fade-in">
                      {{ $t("history.noResults") }}
                    </div>
                  </div>
                </template>

                <template v-slot:body-cell-jobId="props">
                  <q-td :props="props" class="text-center">
                    <span
                      class="text-weight-bold q-pa-xs"
                      :class="
                        props.row.ispausevar
                          ? 'bg-yellow-5 text-black rounded-borders'
                          : ''
                      "
                    >
                      {{ props.row.jobId }}
                    </span>
                  </q-td>
                </template>
                <template v-slot:body-cell-status="props">
                  <q-td :props="props" class="text-center">
                    <span
                      class="status-icon-container"
                      :class="getStatusContainerClass(props.row.status)"
                    >
                      <q-icon
                        :name="getStatusIcon(props.row.status)"
                        :color="getStatusColor(props.row.status)"
                        size="xs"
                      >
                        <q-tooltip>{{
                          getDisplayStatus(props.row.status)
                        }}</q-tooltip>
                      </q-icon>
                    </span>
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props" class="text-center">
                    <div class="flex q-gutter-sm justify-center">
                      <!-- Verde: Completar (ahora siempre aparece) -->
                      <q-btn
                        v-if="
                          props.row.status !== 3 &&
                          props.row.status !== 5 &&
                          props.row.status === 1
                        "
                        icon="check_circle"
                        color="green-6"
                        size="md"
                        round
                        flat
                        @click="showCompleteDialog(props.row)"
                      >
                        <q-tooltip>
                          <!-- Completar -->
                          {{ $t("actions.complete") }}</q-tooltip
                        >
                      </q-btn>

                      <!-- Amarillo: Marcar como retrabajo (status !== 2) -->
                      <q-btn
                        v-if="props.row.status !== 2 && props.row.status !== 4"
                        icon="undo"
                        color="orange-6"
                        size="md"
                        round
                        flat
                        @click="openMarkRework(props.row)"
                      >
                        <q-tooltip>
                          <!-- Completar -->
                          {{ $t("actions.markRework") }}
                        </q-tooltip>
                      </q-btn>

                      <!--  Marcar como pausa (status !== 2) -->
                      <q-btn
                        v-if="props.row.status !== 2"
                        :icon="
                          props.row.status === 4
                            ? 'play_circle'
                            : 'pause_circle'
                        "
                        :color="
                          props.row.status === 4 ? 'positive' : 'yellow-7'
                        "
                        size="md"
                        round
                        flat
                        @click="showpauseDialog(props.row)"
                      >
                        <q-tooltip>
                          <!-- Completar -->
                          {{ $t("actions.markpause") }}
                        </q-tooltip>
                      </q-btn>

                      <!-- Azul: Gestionar retrabajos (solo si tiene defectos) -->
                      <q-btn
                        v-if="props.row.hasDefects && props.row.status !== 1"
                        icon="build_circle"
                        color="blue-6"
                        size="md"
                        round
                        flat
                        @click="openReworkManagement(props.row)"
                      >
                        <q-tooltip>
                          <!-- Gestionar retrabajos -->
                          {{ $t("actions.manageReworks") }}
                        </q-tooltip>
                      </q-btn>

                      <!-- Detalles -->
                      <q-btn
                        v-if="props.row.status !== 1"
                        icon="info"
                        color="blue-grey-6"
                        size="sm"
                        round
                        flat
                        @click="showDetails(props.row)"
                      >
                        <q-tooltip>
                          <!-- Ver Detalles -->
                          {{ $t("actions.details") }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-scanStart="props">
                  <q-td :props="props" class="text-center">
                    <span
                      :class="
                        props.value.includes('/')
                          ? 'text-red-6 text-weight-bold'
                          : ''
                      "
                    >
                      {{ props.value }}
                    </span>
                  </q-td>
                </template>

                <template v-slot:body-cell-scanEnd="props">
                  <q-td :props="props" class="text-center">
                    <span
                      :class="
                        props.value.includes('/')
                          ? 'text-red-6 text-weight-bold'
                          : ''
                      "
                    >
                      {{ props.value }}
                    </span>
                  </q-td>
                </template>
              </q-table>
            </q-card>

            <q-card class="shadow-1 chart-card-aligned">
              <div
                ref="scannerStatusChartContainer"
                style="width: 100%; height: 150px"
              ></div>
            </q-card>
          </div>

          <!-- Overlay Grafica de Downtimes) -->
          <div class="row col-12 col-lg-4 flex-column-container">
            <q-card
              v-if="downtimeEvents.length > 0"
              class="shadow-1 q-pa-md chart-card-aligned"
            >
              <div id="downtime-chart" style="width: 100%; height: 235px"></div>
            </q-card>
          </div>

          <q-dialog v-model="completeConfirmDialog" persistent>
            <q-card class="dialog-card">
              <q-card-section class="row items-center q-pb-none">
                <q-avatar
                  icon="check_circle"
                  color="green-6"
                  text-color="white"
                  class="q-mr-sm"
                />
                <span class="text-h6 text-blue-grey-10">
                  <!-- Completar Elemento -->
                  {{ $t("dialog.completeTitle") }}
                </span>
              </q-card-section>
              <q-card-section class="q-pt-md">
                <span class="text-body1 text-blue-grey-8"
                  >{{ $t("dialog.completeConfirm") }}
                  <span class="text-weight-bold text-blue-grey-10"
                    >"{{ selectedRow?.jobId }}"</span
                  >
                </span>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  flat
                  :label="$t('common.cancel')"
                  color="blue-grey-6"
                  v-close-popup
                />
                <q-btn
                  :label="$t('common.confirm')"
                  color="green-6"
                  @click="confirmComplete"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <!--Pause Dialog-->

          <q-dialog v-model="pauseDialog" persistent>
            <q-card class="dialog-card">
              <q-card-section class="row items-center q-pb-none">
                <q-avatar
                  icon="pause_circle"
                  color="yellow-7"
                  text-color="white"
                  class="q-mr-sm"
                />
                <span class="text-h6 text-blue-grey-10">
                  <!-- Pausar Elemento -->
                  {{ $t("dialog.pauseTitle") }}
                </span>
              </q-card-section>
              <q-card-section class="q-pt-md">
                <span class="text-body1 text-blue-grey-8"
                  >{{ $t("dialog.pauseconfirm") }}
                  <span class="text-weight-bold text-blue-grey-10"
                    >"{{ selectedRow?.jobId }}"</span
                  >
                </span>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  flat
                  :label="$t('common.cancel')"
                  color="blue-grey-6"
                  v-close-popup
                />
                <q-btn
                  :label="$t('common.confirm')"
                  color="yellow-7"
                  @click="confirmpause"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="detailsDialog" persistent>
            <q-card class="dialog-card" style="min-width: 380px">
              <q-card-section class="row items-center q-pb-none">
                <q-icon name="info" color="primary" size="md" class="q-mr-sm" />
                <span class="text-h6 text-blue-grey-10">
                  <!--Detalles del elemento-->
                  {{ $t("details.title") }}</span
                >
              </q-card-section>

              <q-card-section class="q-pt-md">
                <q-tabs
                  v-model="detailsTab"
                  dense
                  class="text-grey-7"
                  active-color="primary"
                  indicator-color="primary"
                  align="justify"
                  narrow-indicator
                >
                  <q-tab name="general" :label="$t('details.tab.general')" />
                  <q-tab
                    name="defects"
                    :label="$t('details.tab.defects')"
                    :disable="
                      !selectedRow?.defects || selectedRow.defects.length === 0
                    "
                  />
                </q-tabs>

                <q-separator />

                <q-tab-panels v-model="detailsTab" animated>
                  <q-tab-panel name="general">
                    <q-list dense>
                      <q-item>
                        <q-item-section>
                          <q-item-label class="text-blue-grey-6 text-caption"
                            >JobID</q-item-label
                          >
                          <q-item-label
                            class="text-body1 text-weight-medium text-blue-grey-9"
                            >{{ selectedRow?.jobId }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item>
                        <q-item-section>
                          <q-item-label class="text-blue-grey-6 text-caption">{{
                            $t("details.status")
                          }}</q-item-label>
                          <q-item-label
                            class="text-body1 text-weight-medium text-blue-grey-9"
                            >{{
                              getDisplayStatus(selectedRow?.status)
                            }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item>
                        <q-item-section>
                          <q-item-label class="text-blue-grey-6 text-caption">{{
                            $t("details.scanStart")
                          }}</q-item-label>
                          <q-item-label
                            class="text-body1 text-weight-medium text-blue-grey-9"
                            >{{ selectedRow?.scanStart }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item>
                        <q-item-section>
                          <q-item-label class="text-blue-grey-6 text-caption">{{
                            $t("details.scanEnd")
                          }}</q-item-label>
                          <q-item-label
                            class="text-body1 text-weight-medium text-blue-grey-9"
                            >{{ selectedRow?.scanEnd }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item>
                        <q-item-section>
                          <q-item-label class="text-blue-grey-6 text-caption">{{
                            $t("details.duration")
                          }}</q-item-label>
                          <q-item-label
                            class="text-body1 text-weight-medium text-blue-grey-9"
                            >{{ selectedRow?.duration }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <!-- Muestra el motivo de retrabajo si existe -->
                      <template v-if="selectedRow?.reworkReason">
                        <q-separator />
                        <q-item>
                          <q-item-section>
                            <q-item-label
                              class="text-blue-grey-6 text-caption"
                              >{{ $t("details.reworkReason") }}</q-item-label
                            >
                            <q-item-label
                              class="text-body1 text-weight-medium text-blue-grey-9"
                              >{{ selectedRow?.reworkReason }}</q-item-label
                            >
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-tab-panel>

                  <q-tab-panel name="defects">
                    <!-- Muestra los defectos (puntas) si existen -->
                    <div
                      v-if="
                        selectedRow?.defects && selectedRow.defects.length > 0
                      "
                    >
                      <q-list dense>
                        <div
                          v-for="(defect, dIndex) in selectedRow.defects"
                          :key="dIndex"
                          class="q-mb-xs"
                        >
                          <q-item-label
                            class="text-body1 text-weight-medium text-blue-grey-9 flex items-center q-py-sm"
                          >
                            <!-- Icono de confirmación si el defecto está confirmado -->
                            <q-icon
                              v-if="defect.isConfirmed"
                              name="check_circle"
                              color="green-6"
                              size="sm"
                              class="q-mr-xs"
                            />
                            {{ defect.type }}
                            <span
                              v-if="
                                defect.selectedPuntasA &&
                                defect.selectedPuntasA.length > 0
                              "
                              class="q-ml-sm"
                            >
                              A: [{{ defect.selectedPuntasA.join(", ") }}]
                            </span>
                            <span
                              v-if="
                                defect.selectedPuntasB &&
                                defect.selectedPuntasB.length > 0
                              "
                              class="q-ml-sm"
                            >
                              B: [{{ defect.selectedPuntasB.join(", ") }}]
                            </span>
                          </q-item-label>
                          <q-separator
                            v-if="dIndex < selectedRow.defects.length - 1"
                          />
                        </div>
                      </q-list>
                    </div>
                    <div v-else class="text-center q-mt-lg text-grey-7">
                      <q-icon name="info" size="xl" class="q-mb-sm" />
                      <p>
                        <!--No hay defectos registrados para este elemento.-->
                        {{ $t("details.noDefects") }}.
                      </p>
                    </div>
                  </q-tab-panel>
                </q-tab-panels>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  flat
                  :label="$t('common.close')"
                  color="primary"
                  v-close-popup
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-page>
    </q-page-container>

    <!-- PANEL DERECHO: DOWNTIME / RETRABAJO / CONFIGURACIÓN / BIENVENIDA OPERADOR -->
    <q-drawer
      side="right"
      v-model="rightDrawerOpen"
      bordered
      :width="drawerWidth"
      overlay
      behavior="desktop"
      class="bg-grey-1 column"
      @hide="resetRightDrawerContent"
    >
      <div class="q-pa-md col">
        <!-- Contenido para Configuración -->
        <template v-if="rightDrawerContentType === 'configuration'">
          <div class="row items-center q-pb-md">
            <q-icon
              name="settings"
              color="primary"
              size="28px"
              class="q-mr-sm"
            />
            <span class="text-h6 text-weight-bold text-blue-grey-10">
              <!--Configuración de Estación-->
              {{ $t("config.title") }}</span
            >
          </div>
          <q-separator class="q-mb-md" />

          <p class="text-body1 text-blue-grey-8 q-mb-lg">
            {{ $t("config.instructions") }}
          </p>

          <!-- Sección de Contraseña (Condicional) -->
          <div v-if="!passwordEntered" class="q-mb-md">
            <q-input
              v-model="configPassword"
              :type="passwordVisible ? 'text' : 'password'"
              :label="$t('config.passwordLabel')"
              dense
              outlined
              color="primary"
              @keyup.enter="checkPassword"
            >
              <template v-slot:append>
                <q-icon
                  :name="passwordVisible ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="passwordVisible = !passwordVisible"
                />
              </template>
            </q-input>
            <div class="q-mt-md text-right">
              <q-btn
                :label="$t('config.enter')"
                color="primary"
                @click="checkPassword"
                :disable="!configPassword.trim()"
              />
            </div>
          </div>

          <!-- Dropdowns de Configuración (Condicional) -->
          <template v-else>
            <q-select
              v-model="stationStore.selectedArea"
              :options="stationStore.areaOptions"
              :label="$t('config.selectArea')"
              option-value="ID"
              option-label="Area"
              emit-value
              map-options
              dense
              outlined
              class="q-mb-md"
              color="primary"
              @update:model-value="onAreaSelected"
            />

            <q-select
              v-model="stationStore.selectedLine"
              :options="stationStore.lineOptions"
              :label="$t('config.selectLine')"
              option-value="ID"
              option-label="Line"
              emit-value
              map-options
              dense
              outlined
              class="q-mb-md"
              color="primary"
              :disable="!stationStore.selectedArea"
              @update:model-value="onLineSelected"
            />

            <q-select
              v-model="stationStore.selectedStation"
              :options="stationStore.stationOptions"
              :label="$t('config.selectStation')"
              option-value="ID"
              option-label="label"
              emit-value
              map-options
              dense
              outlined
              class="q-mb-md"
              color="primary"
              :disable="!stationStore.selectedLine"
              @update:model-value="onStationSelected"
            />

            <div class="q-mt-lg text-right">
              <q-btn
                flat
                :label="$t('common.cancel')"
                color="blue-grey-6"
                @click="hideRightDrawer"
                class="q-mr-sm"
              />
              <q-btn
                :label="$t('common.confirm')"
                color="primary"
                @click="saveConfiguration"
                :disable="!stationStore.selectedStation"
              />
            </div>

            <q-separator class="q-mt-lg q-mb-md" />

            <div
              class="text-subtitle1 text-weight-bold text-blue-grey-10 q-mb-md flex items-center"
            >
              <q-icon
                name="print"
                color="primary"
                size="24px"
                class="q-mr-sm"
              />

              {{ $t("config.printerConfig") }}
            </div>

            <div class="q-gutter-sm">
              <q-toggle
                v-model="printerConfigOption"
                true-value="custom"
                :false-value="null"
                :label="$t('config.customIP')"
                color="primary"
                icon="settings_ethernet"
                class="q-mb-md"
              />

              <q-input
                v-if="printerConfigOption === 'custom'"
                v-model="customPrinterIP"
                :label="$t('config.enterIP')"
                outlined
                dense
                class="q-mt-sm"
                placeholder="xx.xxx.xxx.xxx"
                color="primary"
              >
                <!-- Botón para Guardar en localStorage -->
                <template v-slot:append>
                  <q-btn
                    :label="$t('common.confirm')"
                    color="secondary"
                    @click="savePrinterConfiguration"
                    unelevated
                    dense
                  />
                </template>
              </q-input>
            </div>
          </template>
        </template>

        <!-- Seccion para Epoxy -->

        <template v-else-if="rightDrawerContentType === 'epoxy'">
          <!-- Título principal -->
          <div class="row items-center q-pb-md">
            <q-icon
              name="science"
              color="primary"
              size="28px"
              class="q-mr-sm"
            />
            <span class="text-h6 text-weight-bold text-blue-grey-10">
              {{ $t("epoxy.title") }}
            </span>
          </div>
          <q-separator class="q-mb-md" />

          <!-- SOLO MUESTRA EL INPUT SI EL TIMER ESTÁ EXPIRADO -->
          <div
            v-if="timerSecondsLeft <= 0"
            class="row items-center q-gutter-sm"
          >
            <q-input
              v-model="epoxyQR"
              :placeholder="$t('epoxy.scanPlaceholder')"
              dense
              outlined
              class="col"
              @keyup.enter="handleEpoxyQR()"
            />
            <q-btn
              dense
              icon="search"
              color="primary"
              @click="handleEpoxyQR()"
            />
          </div>

          <q-separator class="q-my-md" />

          <!-- Subtítulo tiempo de vida -->
          <div
            class="text-subtitle2 text-blue-grey-8 text-center q-mb-sm"
            v-if="timerSecondsLeft > 0"
          >
            {{ $t("epoxy.life") }}
          </div>

          <!-- Timer Epoxy -->
          <div v-if="timerSecondsLeft > 0" class="flex flex-center q-mb-lg">
            <span
              class="text-h5 text-grey-8"
              style="letter-spacing: 2px; min-width: 120px; text-align: center"
            >
              {{ timerFormatted }}
            </span>
          </div>

          <!-- Datos de Epoxy Registrados -->
          <q-card
            v-if="lotA || lotB || serialEpoxyNo || expirationDate"
            flat
            class="bg-grey-2 q-pa-md shadow-1"
            style="
              border-radius: 16px;
              min-width: 90%;
              max-width: 100%;
              margin: auto;
            "
          >
            <div class="text-caption text-blue-grey-8 q-mb-md text-left">
              <q-icon name="info" color="primary" size="16px" class="q-mr-xs" />
              {{ $t("epoxy.data") }}
            </div>
            <div v-if="newEpoxyId" class="q-mb-xs text-left text-caption">
              <q-icon
                name="confirmation_number"
                color="green-7"
                size="14px"
                class="q-mr-xs"
              />
              <b> {{ $t("epoxy.id") }}</b> {{ newEpoxyId }}
            </div>
            <div class="q-mb-xs text-left text-caption">
              <q-icon name="label" color="blue-7" size="14px" class="q-mr-xs" />
              <b>{{ $t("epoxy.lotA") }}</b> {{ lotA }}
            </div>
            <div class="q-mb-xs text-left text-caption">
              <q-icon
                name="label"
                color="deep-orange-7"
                size="14px"
                class="q-mr-xs"
              />
              <b>{{ $t("epoxy.lotB") }}</b> {{ lotB }}
            </div>
            <div class="q-mb-xs text-left text-caption">
              <q-icon
                name="qr_code_2"
                color="teal-7"
                size="14px"
                class="q-mr-xs"
              />
              <b>{{ $t("epoxy.serial") }}</b> {{ serialEpoxyNo }}
            </div>
            <div class="text-left text-caption">
              <q-icon
                name="event"
                color="yellow-7"
                size="14px"
                class="q-mr-xs"
              />
              <b>{{ $t("epoxy.expires") }}</b> {{ expirationDate }}
            </div>

            <!-- Botón para cambiar de Epoxy (solo si el timer sigue activo) -->
            <div v-if="timerSecondsLeft > 0" class="q-mt-md flex flex-center">
              <q-btn
                :label="$t('epoxy.change')"
                color="negative"
                flat
                dense
                @click="clearEpoxyStorage()"
                icon="autorenew"
                class="q-px-md"
                style="min-width: 220px"
              />
            </div>
          </q-card>
        </template>

        <!-- Contenido para Bienvenida de Operador -->
        <template v-else-if="rightDrawerContentType === 'operator-welcome'">
          <div class="row items-center q-pb-md">
            <q-icon
              name="fingerprint"
              color="green-6"
              size="28px"
              class="q-mr-sm"
            />
            <span class="text-h6 text-weight-bold text-blue-grey-10">{{
              $t("operator.regTitle")
            }}</span>
          </div>
          <q-separator class="q-mb-md" />

          <p class="text-body1 text-blue-grey-8 q-mb-lg">
            {{ $t("operator.welcome") }}
          </p>

          <q-input
            v-model="badgeScanInput"
            :label="$t('operator.badgeLabel')"
            dense
            outlined
            color="primary"
            @keyup.enter="handleOperatorBadgeScan"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="qr_code_scanner"
                color="grey"
                @click="handleOperatorBadgeScan"
                :disable="!badgeScanInput.trim()"
              />
            </template>
          </q-input>

          <!-- Tabla de badges escaneados -->
          <div class="q-mt-md" v-if="operatorStore.scannedOperators.length > 0">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">
              {{ $t("operator.scanned") }}
            </div>
            <q-table
              :rows="operatorStore.scannedOperators"
              :columns="badgeColumns"
              row-key="id"
              flat
              dense
              hide-bottom
              :rows-per-page-options="[0]"
            >
              <template v-slot:body-cell-id="props">
                <q-td :props="props" class="text-left">
                  <span
                    :class="{
                      'text-red-8':
                        props.row.status === 'unregistered' ||
                        props.row.status === 'error',
                    }"
                  >
                    {{ props.row.id }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-name="props">
                <q-td :props="props" class="text-left">
                  <span
                    :class="{
                      'text-red-8':
                        props.row.status === 'unregistered' ||
                        props.row.status === 'error',
                    }"
                  >
                    {{ props.row.name }}
                  </span>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    icon="delete"
                    color="negative"
                    size="sm"
                    round
                    flat
                    @click="operatorStore.removeScannedOperator(props.row.id)"
                  >
                    <q-tooltip>{{ $t("operator.remove") }}</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>

          <div class="q-mt-lg text-right">
            <q-btn
              flat
              :label="$t('common.close')"
              color="blue-grey-6"
              @click="hideRightDrawer"
              class="q-mr-sm"
            />
            <q-btn
              :label="$t('operator.startOp')"
              color="green-6"
              @click="confirmOperatorLogin"
              :disable="operatorStore.scannedOperators.length === 0"
            />
          </div>
        </template>

        <!-- Contenido existente de Downtime -->
        <template v-else-if="rightDrawerContentType === 'downtime'">
          <div class="row items-center q-pb-md">
            <q-icon
              name="timer_off"
              color="red-6"
              size="28px"
              class="q-mr-sm"
            />
            <span class="text-h6 text-weight-bold text-blue-grey-10"
              >{{ $t("downtimepanel.title") }} "{{ currentShift }}"
            </span>
          </div>
          <q-separator class="q-mb-md" />
          <q-btn
            :label="$t('downtimepanel.add')"
            color="primary"
            icon="add"
            class="q-mb-md"
            @click="agregarDowntime"
          />
          <div v-if="productionStore.downtimeEvents.length > 0">
            <q-list>
              <template
                v-for="(event, index) in paginatedDowntimeEvents"
                :key="index"
              >
                <div
                  class="q-mb-sm shadow-1 rounded-borders bg-white overflow-hidden"
                  style="border: 1px solid rgba(0, 0, 0, 0.05)"
                >
                  <q-item class="q-py-sm">
                    <q-item-section>
                      <q-item-label
                        class="text-subtitle2 text-weight-medium text-primary"
                      >
                        {{ $t("downtimepanel.eventN") }}
                        {{ (currentPage - 1) * itemsPerPage + index + 1 }}

                        <q-tooltip
                          anchor="bottom left"
                          self="top left"
                          :offset="[4, 8]"
                          class="bg-primary text-white"
                        >
                          ID: {{ event.DowntimeID }}
                        </q-tooltip>
                      </q-item-label>

                      <q-item-label
                        caption
                        v-if="activeIds"
                        class="single-line q-mt-xs"
                      >
                        {{ $t("downtimepanel.operator") }}
                        <span class="text-weight-bold text-grey-9">{{
                          event.FULL_NAME
                        }}</span>
                      </q-item-label>

                      <q-item-label caption v-if="activeIds" class="q-mt-xs">
                        <div class="row items-center q-gutter-xs">
                          <template v-if="event.DowntimeType === false">
                            <q-chip
                              color="red-1"
                              text-color="red-9"
                              size="sm"
                              square
                              icon="timer_off"
                              class="q-ma-none text-weight-bold"
                            >
                              {{ $t("downtimepanel.evento") }}
                            </q-chip>
                          </template>

                          <template v-else>
                            <span class="text-grey-7">
                              {{
                                event.JobIDs &&
                                event.JobIDs.split(",").length > 1
                                  ? "JobIDs:"
                                  : "JobID:"
                              }}
                            </span>

                            <span class="text-weight-bold text-grey-9">
                              {{ event.JobIDs || "---" }}
                              <q-tooltip>
                                {{ event.JobNumbers || "---" }}
                              </q-tooltip>
                            </span>
                          </template>

                          <span class="text-grey-7">
                            {{ $t("split.dtId") }}
                          </span>

                          <span class="text-weight-bold text-grey-9">
                            {{ event.DowntimeID }}
                          </span>
                        </div>
                      </q-item-label>

                      <div class="row q-gutter-x-md q-mt-sm">
                        <q-item-label caption>
                          {{ $t("downtimepanel.start") }}
                          <span class="text-weight-bold text-grey-9">
                            {{
                              new Date(event.start).toLocaleTimeString(
                                "es-MX",
                                { timeZone: "UTC" }
                              )
                            }}
                          </span>
                        </q-item-label>
                        <q-item-label caption>
                          {{ $t("downtimepanel.end") }}
                          <span class="text-weight-bold text-grey-9">
                            {{
                              event.end
                                ? new Date(event.end).toLocaleTimeString(
                                    "es-MX",
                                    { timeZone: "UTC" }
                                  )
                                : "---"
                            }}
                          </span>
                        </q-item-label>
                      </div>

                      <q-item-label caption class="q-mt-xs">
                        {{ $t("downtimepanel.lapso") }}
                        <q-badge
                          outline
                          color="blue-6"
                          class="text-weight-bold"
                        >
                          {{ event.duration }}
                        </q-badge>
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div
                        class="column items-stretch q-gutter-y-sm"
                        style="min-width: 130px"
                      >
                        <q-btn
                          v-if="
                            !event.justifiedBy ||
                            (!event.DownTimeReason && event.EndTime)
                          "
                          :label="$t('downtimepanel.just')"
                          color="amber"
                          text-color="black"
                          size="sm"
                          icon="gavel"
                          glossy
                          dense
                          @click="toggleJustifyOptions(event)"
                        />

                        <q-btn
                          v-else
                          :label="getJustifiedLabel(event)"
                          :color="
                            reasonColors[getJustifiedLabel(event)] || 'grey-5'
                          "
                          :disable="!reasonColors[getJustifiedLabel(event)]"
                          text-color="white"
                          size="sm"
                          glossy
                          dense
                          :icon="event.IsSplit ? 'swap_horiz' : 'check_circle'"
                          @click="toggleJustifyOptions(event)"
                        />
                        <q-btn
                          v-if="event.ReasonID"
                          :label="
                            !event.EndTime
                              ? $t('overlay.terminate')
                              : $t('downtimepanel.split')
                          "
                          :icon="!event.EndTime ? 'stop' : 'swap_horiz'"
                          :color="!event.EndTime ? 'negative' : 'amber'"
                          :text-color="!event.EndTime ? 'white' : 'black'"
                          size="sm"
                          glossy
                          dense
                          @click="
                            !event.EndTime
                              ? terminarDowntime(event.DowntimeID)
                              : openSplitDialog(event)
                          "
                        />
                      </div>
                    </q-item-section>
                  </q-item>

                  <q-slide-transition>
                    <div v-show="event.showJustifyOptions">
                      <q-separator />
                      <div class="bg-grey-2 q-pa-sm">
                        <q-card flat bordered class="justify-options-card">
                          <q-card-section
                            class="row q-gutter-sm justify-center"
                          >
                            <q-btn
                              v-for="(
                                reason, Index
                              ) in productionStore.downtimeReasons"
                              :key="reason.value"
                              :label="reason.label"
                              :color="reasonColors[reason.label] || 'grey-5'"
                              text-color="white"
                              dense
                              size="md"
                              class="col-5 justify-btn-small"
                              @click="handleDowntimeClick(event, reason, Index)"
                            />
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </q-slide-transition>
                </div>
              </template>
            </q-list>
            <!-- Controles de paginación -->
            <div class="row justify-between items-center q-mt-sm">
              <q-btn
                flat
                icon="chevron_left"
                :disable="currentPage === 1"
                @click="prevPage"
              />
              <span
                >{{ $t("downtimepanel.pag1") }} {{ currentPage }}
                {{ $t("downtimepanel.pag2") }} {{ totalPages }}</span
              >
              <q-btn
                flat
                icon="chevron_right"
                :disable="currentPage === totalPages"
                @click="nextPage"
              />
            </div>
          </div>
          <div v-else class="text-center q-mt-lg text-grey-7">
            <q-icon name="info" size="xl" class="q-mb-sm" />
            <p>{{ $t("downtimepanel.nodata") }}</p>
          </div>

          <!-- DIALOG DE SPLIT -->
          <q-dialog v-model="showSplitDialog">
            <q-card
              class="split-card"
              style="
                min-width: 420px;
                max-width: 90vw;
                overflow-x: hidden;
                width: fit-content;
                border-radius: 16px;
              "
            >
              <div class="row items-center q-pa-sm bg-primary text-white">
                <!-- Imagen en la esquina superior izquierda -->
                <img
                  src="/img/AFL.png"
                  style="width: 2.5em; height: 2.5em; margin-right: 0.5em"
                  class="q-mr-sm"
                />

                <div class="text-h6">{{ $t("split.title") }}</div>
                <q-space />
              </div>
              <q-card-section>
                <p>
                  <strong>{{ $t("split.dtId") }}</strong>
                  {{ selectedDowntimeFull?.DowntimeID }}<br />
                  <strong>{{ $t("split.totalDur") }}</strong>
                  {{ Math.floor(selectedDowntimeFull?.DurationSeconds / 60) }}
                  {{ $t("split.minutes") }}<br />
                  <strong> {{ $t("split.desc") }}</strong>
                  {{ downtimeReasonByLang || "Ninguno" }}<br />
                  <strong>{{ $t("split.type") }}</strong>
                  <span>
                    <q-chip
                      v-if="selectedDowntimeFull?.DowntimeType === false"
                      color="red"
                      text-color="white"
                      size="sm"
                      square
                      icon="timer_off"
                      class="q-ml-sm"
                    >
                      {{ $t("split.auto") }}
                    </q-chip>

                    <q-chip
                      v-else-if="selectedDowntimeFull?.DowntimeType === true"
                      color="primary"
                      text-color="white"
                      size="sm"
                      square
                      icon="handyman"
                      class="q-ml-sm"
                    >
                      {{ $t("split.manual") }}
                    </q-chip>

                    <q-chip
                      v-else
                      color="grey"
                      text-color="white"
                      size="sm"
                      square
                      icon="help"
                      class="q-ml-sm"
                    >
                      {{ $t("split.none") }}
                    </q-chip>
                  </span>
                </p>
              </q-card-section>
              <q-separator class="q-mb-md" />
              <q-card-section>
                <div class="q-mt-md">
                  <!-- Slider con marcas -->
                  <q-slider
                    v-model="selectedMinutes"
                    :min="0"
                    :max="totalMinutes"
                    :step="totalMinutes <= 2 ? 0.0833 : 1"
                    label-always
                    :markers="true"
                    :marker-labels="computedMarkerLabels"
                    style="max-width: 100%"
                    :label-value="formatLabelValue(selectedMinutes)"
                    color="primary"
                    track-color="grey-3"
                    thumb-color="blue-7"
                  />
                </div>

                <q-separator class="q-mt-md q-mb-md" />
                <div class="row justify-between q-mt-xl">
                  <div
                    class="text-center bg-blue-1 q-pa-sm rounded-borders border-blue"
                    style="min-width: 120px"
                  >
                    <div class="text-caption text-blue-9 text-weight-bold">
                      {{ $t("split.parent") }}
                    </div>
                    <div class="text-h6 text-blue-10 text-weight-bolder">
                      {{ selectedMinutes.toFixed(0) }} <small>min</small>
                    </div>
                  </div>

                  <q-icon
                    v-for="n in 3"
                    :key="n"
                    name="forward"
                    size="lg"
                    color="blue-9"
                    class="self-center"
                  />

                  <div
                    class="text-center bg-orange-1 q-pa-sm rounded-borders border-orange"
                    style="min-width: 120px"
                  >
                    <div class="text-caption text-orange-9 text-weight-bold">
                      {{ $t("split.child") }}
                    </div>
                    <div class="text-h6 text-orange-10 text-weight-bolder">
                      {{ (totalMinutes - selectedMinutes).toFixed(0) }}
                      <small>min</small>
                    </div>
                  </div>
                </div>
                <q-separator class="q-mt-md q-mb-md" />
                <!-- Selección de Reason para downtime hijo usando downtimeReasons -->
                <p style="font-weight: bold; margin-bottom: 0.5rem">
                  {{ $t("split.selectReasonChild") }}
                  <span
                    :class="`text-${
                      reasonColors[
                        productionStore.downtimeReasons.find(
                          (r) => r.value === newReasonID
                        )?.label
                      ] || 'grey-5'
                    }`"
                    style="
                      font-weight: bold;
                      font-size: 1.1rem;
                      background-color: rgba(0, 0, 0, 0.05); /* fondo suave */
                      padding: 0.2rem 0.5rem; /* un poco de espacio interno */
                      border-radius: 4px; /* bordes redondeados */
                    "
                  >
                    {{
                      productionStore.downtimeReasons.find(
                        (r) => r.value === newReasonID
                      )?.label || $t("split.none")
                    }}
                  </span>
                </p>

                <q-card-section class="row q-gutter-sm justify-center q-mt-md">
                  <q-btn
                    v-for="reason in productionStore.downtimeReasons"
                    :key="reason.value"
                    :label="reason.label"
                    :color="
                      newReasonID === reason.value
                        ? 'primary'
                        : reasonColors[reason.label] || 'grey-5'
                    "
                    text-color="white"
                    dense
                    unelevated
                    class="col-5 justify-btn-small"
                    style="
                      min-width: auto;
                      padding-left: 0.5rem;
                      padding-right: 0.5rem;
                    "
                    @click="() => (newReasonID = reason.value)"
                  />
                </q-card-section>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn
                  flat
                  :label="$t('common.cancel')"
                  color="negative"
                  v-close-popup
                  class="rounded-btn"
                />

                <q-btn
                  flat
                  :label="$t('downtimepanel.split')"
                  color="primary"
                  :disable="!newReasonID"
                  class="rounded-btn"
                  @click="
                    handleSplitClick(
                      selectedDowntime,
                      selectedMinutes,
                      newReasonID
                    )
                  "
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </template>

        <!-- 1) Ingreso de número de conectores -->
        <template v-else-if="rightDrawerContentType === 'number-connectors'">
          <!-- Título -->
          <div class="row items-center q-pb-md">
            <q-icon
              name="settings_input_component"
              color="primary"
              size="28px"
              class="q-mr-sm"
            />
            <span class="text-h6 text-weight-bold text-blue-grey-10">
              {{ $t("numberConn.title") }}
            </span>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Descripción -->
          <p class="text-body1 text-blue-grey-8">
            {{ $t("numberConn.prompt") }}
            <span class="text-weight-bold text-blue-grey-10">
              "{{ selectedRow?.jobId }}" </span
            >.
          </p>

          <!-- TABS -->
          <q-tabs
            v-model="activeTerminalTab"
            dense
            active-color="primary"
            indicator-color="primary"
            class="q-mb-md"
          >
            <q-tab name="A" label="Terminal A" />
            <q-tab name="B" label="Terminal B" />
          </q-tabs>

          <q-separator class="q-mb-md" />

          <!-- TAB PANELS -->
          <q-tab-panels v-model="activeTerminalTab" animated>
            <!-- ================= TERMINAL A ================= -->
            <q-tab-panel name="A">
              <q-input
                v-model.number="connectorCountA"
                type="tel"
                inputmode="numeric"
                pattern="[0-9]*"
                :label="$t('numberConn.label') + ' (A)'"
                dense
                outlined
                class="q-mb-md"
                :min="1"
                @keyup.enter="confirmConnectorCount"
              >
                <template #append>
                  <q-btn
                    icon="backspace"
                    flat
                    round
                    color="grey-7"
                    @click="backspaceDigit('A')"
                  />
                </template>
              </q-input>

              <!-- NUMPAD -->
              <div class="numpad-wrapper q-pa-sm q-mb-md">
                <div class="numpad-grid">
                  <q-btn
                    v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                    :key="`A-${n}`"
                    :label="n"
                    class="numpad-key"
                    outline
                    color="grey-7"
                    @click="appendDigit(n, 'A')"
                  />
                  <div class="numpad-spacer"></div>
                  <q-btn
                    label="0"
                    class="numpad-key"
                    outline
                    color="grey-7"
                    @click="appendDigit('0', 'A')"
                  />
                  <div class="numpad-spacer"></div>
                </div>
              </div>
            </q-tab-panel>

            <!-- ================= TERMINAL B ================= -->
            <q-tab-panel name="B">
              <q-input
                v-model.number="connectorCountB"
                type="tel"
                inputmode="numeric"
                pattern="[0-9]*"
                :label="$t('numberConn.label') + ' (B)'"
                dense
                outlined
                class="q-mb-md"
                :min="1"
                @keyup.enter="confirmConnectorCount"
              >
                <template #append>
                  <q-btn
                    icon="backspace"
                    flat
                    round
                    color="grey-7"
                    @click="backspaceDigit('B')"
                  />
                </template>
              </q-input>

              <!-- NUMPAD -->
              <div class="numpad-wrapper q-pa-sm q-mb-md">
                <div class="numpad-grid">
                  <q-btn
                    v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                    :key="`B-${n}`"
                    :label="n"
                    class="numpad-key"
                    outline
                    color="grey-7"
                    @click="appendDigit(n, 'B')"
                  />
                  <div class="numpad-spacer"></div>
                  <q-btn
                    label="0"
                    class="numpad-key"
                    outline
                    color="grey-7"
                    @click="appendDigit('0', 'B')"
                  />
                  <div class="numpad-spacer"></div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>

          <!-- BOTÓN CONFIRMAR -->
          <div class="row justify-end">
            <q-btn
              :label="$t('numberConn.confirm')"
              color="primary"
              @click="confirmConnectorCount"
            />
          </div>
        </template>

        <!-- 2) Panel de Marcar como Retrabajo (ya con numberOfConnectors definido) -->
        <template v-else-if="rightDrawerContentType === 'rework'">
          <div class="row items-center q-pb-md">
            <q-icon name="undo" color="orange-6" size="28px" class="q-mr-sm" />
            <span class="text-h6 text-weight-bold text-blue-grey-10">
              <!--Marcar como Retrabajo-->
              {{ $t("rework.title") }}
            </span>
          </div>
          <q-separator class="q-mb-md" />

          <p class="text-body1 text-blue-grey-8">
            {{ $t("rework.prompt") }}<br />
            <span class="text-weight-bold text-blue-grey-10">
              {{ $t("history.jobid") }}: "{{ selectedRow.jobId }}" </span
            >.
          </p>

          <q-list
            bordered
            separator
            class="rounded-borders q-mt-md scrollable-list"
          >
            <template v-for="reason in reworkReasons" :key="reason.value">
              <q-item
                :clickable="reason.value === 'Otro'"
                :v-ripple="reason.value === 'Otro'"
                @click="
                  reason.value === 'Otro'
                    ? selectReworkReason(reason.value)
                    : null
                "
              >
                <q-item-section>
                  <q-item-label class="flex items-center">
                    <q-icon
                      v-if="reason.puntasConfirmed"
                      name="check_circle"
                      color="green-6"
                      size="xs"
                      class="q-mr-sm confirmed-icon-glow"
                    />
                    {{ getDefectLabel(reason) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    v-if="reason.value !== 'Otro'"
                    :label="$t('rework.tips')"
                    color="amber"
                    text-color="dark"
                    size="sm"
                    @click.stop="toggleReworkReasonPuntas(reason.value)"
                    class="q-ml-sm"
                  />
                </q-item-section>
              </q-item>

              <q-expansion-item
                v-if="reason.showPuntasExpansion"
                v-model="reason.showPuntasExpansion"
                dense
                class="bg-grey-2"
                header-class="hidden"
              >
                <q-card class="q-ml-lg q-mr-md q-mb-sm defect-details-card">
                  <q-card-section>
                    <q-tabs
                      v-model="terminalTab"
                      dense
                      class="text-grey-7"
                      active-color="primary"
                      indicator-color="primary"
                      align="justify"
                      narrow-indicator
                    >
                      <q-tab
                        name="terminalA"
                        :label="$t('rework.connectorA')"
                      />
                      <q-tab
                        name="terminalB"
                        :label="$t('rework.connectorB')"
                      />
                    </q-tabs>
                    <q-separator />

                    <q-tab-panels v-model="terminalTab" animated>
                      <!-- TERMINAL A -->
                      <q-tab-panel name="terminalA">
                        <div class="scrollable-cards-container">
                          <div class="row q-gutter-sm justify-center">
                            <q-card
                              v-for="n in selectedRow.numberOfConnectors"
                              :key="`A-${n}`"
                              class="circular-card col-3 q-hoverable"
                              v-ripple
                              :class="{
                                'selected-card':
                                  reason.selectedPuntasA.includes(n),
                              }"
                              @click="
                                toggleTerminalSelectionForReason(
                                  reason.value,
                                  'A',
                                  n
                                )
                              "
                            >
                              <q-card-section
                                class="flex flex-center q-pa-none"
                              >
                                <div class="text-caption text-weight-bold">
                                  {{ n }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>
                      </q-tab-panel>

                      <!-- TERMINAL B -->
                      <q-tab-panel name="terminalB">
                        <div class="scrollable-cards-container">
                          <div class="row q-gutter-sm justify-center">
                            <q-card
                              v-for="n in selectedRow.numberOfConnectorsB"
                              :key="`B-${n}`"
                              class="circular-card col-3 q-hoverable"
                              v-ripple
                              :class="{
                                'selected-card':
                                  reason.selectedPuntasB.includes(n),
                              }"
                              @click="
                                toggleTerminalSelectionForReason(
                                  reason.value,
                                  'B',
                                  n
                                )
                              "
                            >
                              <q-card-section
                                class="flex flex-center q-pa-none"
                              >
                                <div class="text-caption text-weight-bold">
                                  {{ n }}
                                </div>
                              </q-card-section>
                            </q-card>
                          </div>
                        </div>
                      </q-tab-panel>
                    </q-tab-panels>

                    <div class="q-mt-md text-center">
                      <q-btn
                        :label="$t('rework.confirmTips')"
                        color="green-6"
                        @click="confirmReworkReasonPuntas(reason.value)"
                        :disable="
                          reason.selectedPuntasA.length === 0 &&
                          reason.selectedPuntasB.length === 0
                        "
                        class="full-width"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </template>
          </q-list>

          <q-input
            v-if="selectedReworkReason === 'Otro'"
            v-model="otherReworkReason"
            :label="$t('rework.other')"
            dense
            outlined
            class="q-mt-md"
            color="orange-6"
          />

          <div class="q-mt-lg text-right">
            <q-btn
              flat
              :label="$t('common.cancel')"
              color="blue-grey-6"
              @click="hideRightDrawer"
              class="q-mr-sm"
            />
            <q-btn
              :label="$t('rework.confirm')"
              color="orange-6"
              @click="confirmAllReworks"
              :disable="!isReworkConfirmButtonEnabled"
            />
          </div>
        </template>

        <!-- Nuevo: sección Dibujos disponibles -->
        <template v-else-if="rightDrawerContentType === 'drawing'">
          <div class="drawing-container">
            <!-- Título principal -->
            <div class="row items-center q-pb-md">
              <q-icon
                name="attachment"
                color="primary"
                size="28px"
                class="q-mr-sm"
              />
              <span class="text-h6 text-weight-bold text-blue-grey-10">
                <!--Documentos disponibles-->
                {{ $t("drawing.title") }}
              </span>
            </div>
            <q-separator class="q-mb-md" />
            <!-- Sección de búsqueda -->
            <div class="row items-center q-gutter-sm q-mb-md">
              <q-input
                v-model="drawingSearch"
                :placeholder="$t('drawing.searchPh')"
                dense
                outlined
                class="col"
                @keyup.enter="handleSearch"
              />
              <q-btn
                dense
                icon="search"
                color="primary"
                @click="handleSearch"
              />
            </div>
            <!-- Subtítulo: Dibujos técnicos -->
            <div class="row items-center q-mb-sm">
              <q-icon
                name="engineering"
                color="green"
                size="20px"
                class="q-mr-sm"
              />
              <span class="text-subtitle2 text-weight-medium text-blue-grey-8">
                {{ $t("drawing.techDrawings") }}
              </span>
            </div>

            <!-- Tabla de dibujos técnicos -->
            <q-table
              :rows="drawingRows"
              :columns="drawingColumns"
              row-key="AFL_Drawing_NUMBER"
              flat
              dense
              row-hover
              bordered
              no-data-label="No hay registros para mostrar."
              no-results-label="La búsqueda no encontró resultados."
              @row-click="onDrawingRowClick"
            />

            <!-- Separador entre secciones -->
            <q-separator class="q-my-md" />

            <!-- Subtítulo: Documentos ETQ -->
            <div class="row items-center q-mb-sm">
              <q-icon
                name="article"
                color="green"
                size="20px"
                class="q-mr-sm"
              />
              <span class="text-subtitle2 text-weight-medium text-blue-grey-8">
                {{ $t("drawing.etqDocs") }}
              </span>
            </div>

            <!-- Aquí iría tu lista o tabla de documentos ETQ -->
            <q-table
              :rows="etqRows"
              :columns="etqColumns"
              row-key="ETQ_Document"
              flat
              dense
              row-hover
              bordered
              :loading="etqLoading"
              :no-data-label="$t('drawing.noDataLabel')"
              no-results-label="La búsqueda no encontró resultados."
              @row-click="onEtqRowClick"
            >
              <template v-slot:body-cell-Title="props">
                <q-td :props="props" class="wrap-text">
                  {{ props.row.Title }}
                </q-td>
              </template>
            </q-table>
          </div>
        </template>

        <template v-else-if="rightDrawerContentType === 'helpRequest'">
          <div class="row items-center q-pb-md">
            <q-icon
              name="accessibility"
              color="purple"
              size="28px"
              class="q-mr-sm"
            />
            <span class="text-h6 text-weight-bold text-blue-grey-10">
              {{ $t("helprequest.title") }}
            </span>
          </div>
          <q-separator class="q-mb-md" />

          <div class="q-gutter-md">
            <q-select
              v-model="helpType"
              :options="productionStore.HelpRequestGet"
              :label="$t('helprequest.type')"
              option-value="Id"
              option-label="Description"
              emit-value
              map-options
              dense
              outlined
              class="q-mb-md"
            />

            <q-input
              ref="helpInput"
              v-model="helpDescription"
              outlined
              type="textarea"
              :label="$t('helprequest.detailed')"
              rows="7"
              dense
              :disable="!helpType"
              @click="toggleKeyboard"
            />

            <div
              v-show="showKeyboard"
              ref="keyboardContainer"
              class="simple-keyboard"
            ></div>

            <q-btn
              :label="$t('helprequest.send')"
              color="positive"
              class="q-mt-md"
              @click="sendHelpRequest"
            />

            <q-separator class="q-mt-lg q-mb-md" />

            <div class="q-pa-none">
              <div
                class="text-subtitle2 text-weight-medium text-grey-8 q-mb-sm"
              >
                {{ $t("helprequest.reported") }}
              </div>

              <!-- Tabla de Estatus de Incidentes -->
              <div style="max-height: 250px; overflow-y: auto">
                <q-table
                  :rows="incidentStatuses"
                  :columns="incidentColumns"
                  row-key="number"
                  hide-pagination
                  :rows-per-page-options="[0]"
                  :loading="incidentLoading"
                  separator="cell"
                  :visible-columns="['number', 'status']"
                  dense
                  flat
                  bordered
                  class="q-mb-sm"
                >
                  <template v-slot:top-left>
                    <span class="text-caption text-weight-medium text-grey-7">
                      {{ $t("helprequest.total") }}:
                      {{ incidentStatuses.length }}
                    </span>
                  </template>

                  <template v-slot:body-cell-status="props">
                    <q-td :props="props" class="text-center">
                      <q-badge
                        :color="getSnStatusColor(props.row.status)"
                        text-color="white"
                        :label="props.row.status"
                        class="q-px-sm text-caption"
                      />
                    </q-td>
                  </template>

                  <template v-slot:no-data>
                    <div
                      class="full-width row flex-center text-grey-6 q-pa-md text-caption"
                    >
                      <q-icon
                        name="assignment_turned_in"
                        size="20px"
                        class="q-mr-sm"
                      />
                      {{ $t("helprequest.noIncidents") }}
                    </div>
                  </template>
                </q-table>
              </div>

              <div class="flex justify-end q-mt-sm">
                <q-btn
                  color="blue"
                  :label="$t('helprequest.check')"
                  icon="refresh"
                  :loading="incidentLoading"
                  @click="handleFetchStatus"
                  size="sm"
                  dense
                  :disable="incidentLoading"
                  class="text-caption"
                />
              </div>

              <div
                v-if="incidentStatuses.length > 0"
                class="text-caption text-grey-6 q-mt-sm"
              >
                <q-icon name="info" size="14px" class="q-mr-xs" />
                {{ $t("helprequest.SNOW") }}
              </div>
            </div>
          </div>
        </template>

        <!-- Contenido existente de Gestión de Retrabajo -->
        <template v-else-if="rightDrawerContentType === 'rework-management'">
          <div class="row items-center q-pb-md">
            <q-icon
              name="build_circle"
              color="blue-6"
              size="28px"
              class="q-mr-sm"
            />
            <span class="text-h6 text-weight-bold text-blue-grey-10">
              <!--Gestionar Retrabajo-->
              {{ $t("rework.mgmt") }}
            </span>
          </div>
          <q-separator class="q-mb-md" />

          <p class="text-body1 text-blue-grey-8">
            {{ $t("rework.registered") }}<br />

            <span class="text-weight-bold text-blue-grey-10">
              {{ $t("history.jobid") }}: "{{ selectedRow?.jobId }}"<br />
              {{ $t("history.connectorsx") }}:
              {{ reworkStore.reworkEntries.length }}
            </span>
          </p>

          <q-list bordered separator class="rounded-borders q-mt-md">
            <!-- ENCABEZADO -->
            <q-item class="header-row text-center">
              <q-item-section>
                <q-item-label>{{ $t("common.defect") }}</q-item-label>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ $t("common.connector") }}</q-item-label>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ $t("common.action") }}</q-item-label>
              </q-item-section>
            </q-item>

            <template v-if="reworkStore.reworkEntries.length">
              <q-item
                v-for="entry in paginatedReworks"
                :key="entry.id ?? entry.Id"
                clickable
              >
                <q-item-section>
                  <q-item-label class="text-subtitle2 text-weight-medium">
                    {{ entry.defect_current }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ entry.regDate }}
                  </q-item-label>
                </q-item-section>

                <q-item-section class="row items-center fixed-punta-section">
                  <q-card
                    class="circular-card q-ma-xs flex flex-center q-hoverable"
                    v-ripple
                  >
                    <q-card-section class="q-pa-none text-center">
                      {{ entry.terminalNumber }}{{ entry.terminalSide }}
                    </q-card-section>
                  </q-card>
                </q-item-section>

                <q-item-section
                  side
                  class="row items-center fixed-action-section"
                >
                  <q-btn
                    v-if="confirmingId !== (entry.id ?? entry.Id)"
                    :label="$t('rework.process')"
                    color="green-6"
                    size="sm"
                    class="rounded-btn primary-action"
                    @click="confirmingId = entry.id ?? entry.Id"
                  />

                  <div v-else class="row q-gutter-sm justify-center">
                    <q-btn
                      icon="check_circle"
                      :label="$t('common.confirm')"
                      color="green-6"
                      size="sm"
                      class="rounded-btn primary-action"
                      @click="handleConfirm(entry)"
                    />

                    <q-btn
                      icon="cancel"
                      color="red-6"
                      flat
                      size="sm"
                      class="rounded-btn"
                      @click="confirmingId = null"
                    />
                  </div>
                </q-item-section>
              </q-item>

              <div class="row justify-center q-my-md">
                <q-pagination
                  v-model="reworkPage"
                  :max="reworkTotalPages"
                  direction-links
                  boundary-links
                  size="sm"
                  color="primary"
                />
              </div>
            </template>

            <template v-else>
              <q-item>
                <q-item-section class="text-center text-grey-7">
                  {{ $t("rework.none") }}
                </q-item-section>
              </q-item>
            </template>
          </q-list>

          <q-separator spaced />

          <div class="q-pa-md">
            <q-btn
              v-if="selectedRow && selectedRow.status == 1"
              icon="warning_amber"
              :label="$t('rework.continueNoRework')"
              color="amber-14"
              text-color="white"
              class="full-width"
              size="md"
              unelevated
              @click="confirmComplete"
            />
          </div>
        </template>

        <!--Print Section-->
        <template v-else-if="rightDrawerContentType === 'printOptions'">
          <div class="row items-center q-pb-md">
            <q-icon
              name="print"
              color="blue-grey-6"
              size="28px"
              class="q-mr-sm"
            />
            <span class="text-h6 text-weight-bold text-blue-grey-10">
              <!-- Opciones de Impresión -->
              {{ $t("print.title") }}
            </span>
          </div>
          <q-separator class="q-mb-md" />

          <div class="q-gutter-md">
            <!-- Botón de Mandar a Imprimir -->
            <q-btn
              :label="$t('print.send')"
              color="primary"
              icon="send"
              class="q-mt-md full-width"
              @click="sendPrintJob"
            />
          </div>
        </template>
      </div>
      <!-- Botones "Continuar sin retrabajar" y "Cerrar Panel"  -->
      <div class="q-pa-md q-mt-auto text-center">
        <q-btn
          v-if="
            rightDrawerContentType === 'downtime' ||
            rightDrawerContentType === 'rework' ||
            rightDrawerContentType === 'rework-management' ||
            rightDrawerContentType === 'configuration' ||
            rightDrawerContentType === 'operator-welcome' ||
            rightDrawerContentType === 'drawing' ||
            rightDrawerContentType === 'epoxy' ||
            rightDrawerContentType === 'number-connectors' ||
            rightDrawerContentType === 'helpRequest' ||
            rightDrawerContentType === 'printOptions'
          "
          :label="$t('panel.close')"
          color="primary"
          icon="arrow_forward"
          @click="hideRightDrawer"
          class="full-width"
        />
      </div>
    </q-drawer>
  </q-layout>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  watch,
  computed,
  nextTick,
  watchEffect,
} from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
// ⭐️ IMPORTAR TODOS LOS LOCALES NECESARIOS
import "dayjs/locale/es";
import "dayjs/locale/en";
import "dayjs/locale/pl";
import timezone from "dayjs/plugin/timezone";
import { Notify } from "quasar";
import LanguageToggle from "src/components/LanguageToggle.vue";
import { useI18n } from "vue-i18n";
import "dayjs/locale/es"; // Para idioma español
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useQuasar } from "quasar";
import { useOperatorStore } from "src/stores/operatorStore";
import { useStationStore } from "src/stores/Station";
import { useProductionStore } from "src/stores/productionStore";
import { usedowntimeStore } from "src/stores/downtimeStore";
import { useReworkStore } from "src/stores/reworkStore";
import { useReportStore } from "src/stores/ReportStore";
import { usePrintStore } from "src/stores/printStore";

import { storeToRefs } from "pinia";
// Importar Highcharts
import Highcharts from "highcharts";

//TECLADO VIRTUAL
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

const stationStores = useStationStore();
if (import.meta.env.DEV) {
  window.stationStores = stationStores; //debug only
}

const isDowntimeActive = ref(false);
const printerConfigOption = ref(null);
const customPrinterIP = ref("");
const LS_KEY = "MES_PRINTER_IP";

// Inicializar de inmediato antes de montar
const storedDowntime = localStorage.getItem("isDowntimeActive");
if (storedDowntime === "true") {
  isDowntimeActive.value = true;
}

Highcharts.setOptions({
  time: {
    timezone: "America/Mexico_City", // <-- Zona horaria local
  },
});

// Extiende dayjs con plugins necesarios

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale("es"); // Establece idioma español
dayjs.extend(advancedFormat);

//Paginacion

const $q = useQuasar();
const operatorStore = useOperatorStore();
const stationStore = useStationStore();
const productionStore = useProductionStore(); // Inicializa el store de producción
const downtimeStore = usedowntimeStore();
const reworkStore = useReworkStore();
const reportStore = useReportStore();
const PrintStore = usePrintStore();
const stationData = ref([]);
const currentStation = ref(null);
//const jobSerialRegex = /^[A-Za-z0-9]{1,10}(?:-[A-Za-z0-9]+){1,2}$/;
const jobSerialRegex = /^.+$/;
const nextAction = ref(null);
const { t, locale } = useI18n();
// Flag que controla la visibilidad del botón de continuar sin retrabajar
const showContinueWithoutRework = ref(false);

// En tu script setup, donde tienes las desestructuraciones de stores:
const { lang } = storeToRefs(productionStore);

// ░░ DATOS REACTIVOS ░░
const drawerOpen = ref(true);
const rightDrawerOpen = ref(false); // Controla la visibilidad del panel derecho
const rightDrawerContentType = ref(null); // 'downtime', 'rework', 'rework-management', 'configuration', 'operator-welcome'
const incidentLoading = ref(false);

// ---------- Paginación ----------
const reworkRowsPerPage = 6;
const reworkPage = ref(1);

const reworkTotalPages = computed(() => {
  return Math.ceil(reworkStore.reworkEntries.length / reworkRowsPerPage);
});

// ---------- Registros visibles con defect_current reactivo ----------
const paginatedReworks = computed(() => {
  const start = (reworkPage.value - 1) * reworkRowsPerPage;
  const end = start + reworkRowsPerPage;

  return reworkStore.reworkEntries.slice(start, end).map((e) => ({
    ...e,
    defect_current: computed(() => {
      return locale.value === "pl"
        ? e.defect
        : locale.value === "en"
        ? e.defect_EN
        : e.defect_ES;
    }),
  }));
});

// ---------- ID del ítem en modo confirmación ----------
const confirmingId = ref(null);

// ---------- Función de confirmación ----------
const handleConfirm = async (entry) => {
  await confirmReworkEntry(entry);
  confirmingId.value = null;
};

const incidentStatuses = computed(() => productionStore.helpRequestsStatus);

const downtimeReasonByLang = computed(() => {
  if (!selectedDowntimeFull.value) return t("split.none");

  if (locale.value === "en") {
    return (
      selectedDowntimeFull.value.DownTimeReasonEN ||
      selectedDowntimeFull.value.DownTimeReason ||
      t("split.none")
    );
  }
  if (locale.value === "es") {
    return (
      selectedDowntimeFull.value.DownTimeReasonES ||
      selectedDowntimeFull.value.DownTimeReasonES ||
      selectedDowntimeFull.value.DownTimeReason ||
      t("split.none")
    );
  }

  // es (default)
  return selectedDowntimeFull.value.DownTimeReason || t("split.none");
});

// Definición de las columnas de la tabla de incidentes
const incidentColumns = computed(() => [
  {
    name: "number",
    required: true,
    label: t("helprequest.incident"),
    align: "left",
    field: "number",
    sortable: true,
  },
  {
    name: "status",
    label: t("helprequest.status"),
    align: "center",
    field: "status",
    sortable: true,
    // Define el formato para usar el Badge de estatus
    format: (val) => val,
  },
]);

const drawerWidth = computed(() => {
  const type = rightDrawerContentType.value;
  return [
    "drawing",
    "configuration",
    "helpRequest",
    "rework-management",
  ].includes(type)
    ? 565
    : 480;
});

const scanInput = ref("");
const helpType = ref(null);
const helpDescription = ref("");
const helpInput = ref(null);

const getJustifiedLabel = (event) => {
  // Si no hay ninguna razón, fallback inmediato
  if (
    !event.DownTimeReason &&
    !event.DownTimeReasonEN &&
    !event.DownTimeReasonES
  ) {
    return t("downtimepanel.Nojust");
  }

  // Misma lógica de ternarios que en el store
  return lang.value === "en"
    ? event.DownTimeReasonEN || event.DownTimeReason // Fallback al original si EN es null
    : lang.value === "es"
    ? event.DownTimeReasonES || event.DownTimeReason // Fallback al original si PL es null
    : event.DownTimeReason;
};

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║                    Variables para el Teclado Virtual                    ║
// ╚═════════════════════════════════════════════════════════════════════════╝
const showKeyboard = ref(false);
const keyboardContainer = ref(null);
let keyboard = null;

const toggleKeyboard = () => {
  showKeyboard.value = !showKeyboard.value;
};

// Función de teclado virtual
// --- Callback para sincronizar teclado virtual con la variable ---
const onChange = (input) => {
  helpDescription.value = input;
};

// 🔹 Bandera para saber si estamos escribiendo desde teclado virtual
let updatingFromVirtualKeyboard = false;

// 🔹 Función del teclado virtual
const onKeyPress = (button) => {
  if (!keyboard) return;

  const inputEl =
    helpInput.value?.$el?.querySelector("textarea") || helpInput.value?.$el;
  if (!inputEl) return;

  const cursorPos = inputEl.selectionStart || 0;

  // 🚩 señalamos que viene del teclado virtual
  updatingFromVirtualKeyboard = true;

  if (button === "{shift}" || button === "{lock}") {
    handleShift();
  } else if (button === "{enter}") {
    const newValue =
      helpDescription.value.slice(0, cursorPos) +
      "\n" +
      helpDescription.value.slice(cursorPos);
    helpDescription.value = newValue;
    keyboard.setInput(newValue);

    nextTick(() => {
      const newCursorPos = cursorPos + 1;
      inputEl.selectionStart = inputEl.selectionEnd = newCursorPos;
      inputEl.scrollTop = inputEl.scrollHeight;
      keyboard.setCaretPosition(newCursorPos);
      helpInput.value?.focus();
      updatingFromVirtualKeyboard = false;
    });
  } else if (button === "{bksp}") {
    if (cursorPos === 0) {
      updatingFromVirtualKeyboard = false;
      return; // nada que borrar
    }
    const newValue =
      helpDescription.value.slice(0, cursorPos - 1) +
      helpDescription.value.slice(cursorPos);
    helpDescription.value = newValue;
    keyboard.setInput(newValue);

    nextTick(() => {
      const newCursorPos = cursorPos - 1;
      inputEl.selectionStart = inputEl.selectionEnd = newCursorPos;
      inputEl.scrollTop = inputEl.scrollHeight;
      keyboard.setCaretPosition(newCursorPos);
      helpInput.value?.focus();
      updatingFromVirtualKeyboard = false;
    });
  } else if (button === "{space}") {
    // 🟦 CORRECCIÓN: insertar un espacio real
    const newValue =
      helpDescription.value.slice(0, cursorPos) +
      " " +
      helpDescription.value.slice(cursorPos);
    helpDescription.value = newValue;
    keyboard.setInput(newValue);

    nextTick(() => {
      const newCursorPos = cursorPos + 1;
      inputEl.selectionStart = inputEl.selectionEnd = newCursorPos;
      inputEl.scrollTop = inputEl.scrollHeight;
      keyboard.setCaretPosition(newCursorPos);
      helpInput.value?.focus();
      updatingFromVirtualKeyboard = false;
    });
  } else {
    // letras normales
    const newValue =
      helpDescription.value.slice(0, cursorPos) +
      button +
      helpDescription.value.slice(cursorPos);
    helpDescription.value = newValue;
    keyboard.setInput(newValue);

    nextTick(() => {
      const newCursorPos = cursorPos + button.length;
      inputEl.selectionStart = inputEl.selectionEnd = newCursorPos;
      inputEl.scrollTop = inputEl.scrollHeight;
      keyboard.setCaretPosition(newCursorPos);
      helpInput.value?.focus();
      updatingFromVirtualKeyboard = false;
    });
  }
};

const handleShift = () => {
  if (!keyboard) return; // Seguridad
  const currentLayout = keyboard.options.layoutName;
  const shiftToggle = currentLayout === "default" ? "shift" : "default";
  keyboard.setOptions({ layoutName: shiftToggle });
};

//Timer Epoxy
// ╔═════════════════════════════════════════════════════════════════════════╗
// ║                      Variables para el Timer Epoxy                      ║
// ╚═════════════════════════════════════════════════════════════════════════╝
const epoxyTimerStart = ref(null); // timestamp inicio (en ms o string)
const timerSecondsLeft = ref(0); // segundos restantes
let timerInterval = null;
const newEpoxyId = ref(null); //almacenar el ID recién creado
const { showEpoxyBtn } = storeToRefs(stationStore);

const currentShift = localStorage.getItem("MES_CurrentShift") || "---";
const autoDowntimeIdLS = ref(localStorage.getItem("MES_AutoDowntimeID"));

// VARIABLES DEL DIALOG
const showSplitDialog = ref(false);
const selectedDowntime = ref(null);
const selectedMinutes = ref(0);
const newReasonID = ref(null);

const selectedDowntimeFull = ref(null);

// Cambiamos Math.floor por un cálculo con decimales
const totalMinutes = computed(() => {
  if (!selectedDowntime.value) return 0;
  // Devolvemos el total con decimales (ej. 1.5 para 1min 30s)
  return selectedDowntime.value.DurationSeconds / 60;
});

const computedMarkerLabels = computed(() => {
  const labels = {};

  // Si el downtime es de 2 minutos o menos, mostramos marcas de segundos
  if (totalMinutes.value <= 2) {
    const totalSeconds = Math.round(totalMinutes.value * 60);
    // Ponemos marcas cada 15 o 30 segundos según convenga
    const stepSecs = totalSeconds <= 60 ? 15 : 30;

    for (let s = 0; s <= totalSeconds; s += stepSecs) {
      const m = s / 60;
      labels[m] = `${s}s`;
    }
    return labels;
  }

  // Lógica original para tiempos largos
  let step = 1;
  const total = Math.floor(totalMinutes.value);
  if (total > 20) step = Math.ceil(total / 10);
  if (total > 50) step = Math.ceil(total / 8);
  if (total > 100) step = Math.ceil(total / 5);

  for (let i = 0; i <= total; i += step) {
    labels[i] = i.toString();
  }
  return labels;
});

// Función para el texto del globo (label-value)
const formatLabelValue = (val) => {
  if (totalMinutes.value <= 2) {
    const mins = Math.floor(val);
    const secs = Math.round((val - mins) * 60);
    return `${mins}m ${secs}s`;
  }
  return `${t("split.parent1")} ${Math.round(val)} min`;
};

// ABRIR DIALOG desde el botón Split en el listado
const openSplitDialog = (event) => {
  selectedDowntime.value = event;
  selectedMinutes.value = Math.floor(event.DurationSeconds / 60 / 2);
  newReasonID.value = null;

  // 👇 usar directamente el evento recibido
  selectedDowntimeFull.value = event;

  showSplitDialog.value = true;
};

const handleSplitClick = async (
  selectedDowntime,
  selectedMinutes,
  newReasonID
) => {
  try {
    await downtimeStore.handleSplit(
      selectedDowntime,
      selectedMinutes,
      newReasonID
    );

    // Cerrar el dialog de Split
    showSplitDialog.value = false;

    // Ocultar drawer
    hideRightDrawer();

    // Refrescar datos
    await cargarDowntimes(true);
    await loadDowntimeEventsFromLS();
    await renderDowntimeChart();
  } catch (error) {
    console.error(t("console.handleSplitClick"), error);
    console.error(t("console.handleSplitClick"), error);
  }
};

const showAlert = ref(false);
const alertDowntime = ref(false); // Solo para la clase visual

const alertTimestamp = ref(
  localStorage.getItem("MES_AutoDowntimeStart") || null
);

const unjustifiedCount = ref(
  parseInt(localStorage.getItem("MES_UnjustifiedCount") || "0", 10)
);

const syncUnjustifiedCount = () => {
  unjustifiedCount.value = parseInt(
    localStorage.getItem("MES_UnjustifiedCount") || "0",
    10
  );
};

const handleTerminarDowntime = () => {
  if (showAlert.value) {
    showAlert.value = false; // solo apaga la alerta
    syncUnjustifiedCount();
  } else {
    terminarDowntime(downtimeIdToShow.value); // ejecuta normalmente
  }

  // Inicia el temporizador de 1 minuto (60,000 ms)
  setTimeout(() => {
    const autoDowntimeId = localStorage.getItem("MES_AutoDowntimeID");

    if (autoDowntimeId) {
      // Si todavía existe, vuelve a activar la pantalla de bloqueo
      showAlert.value = true;
    }
  }, 60000);
};

// Formato visual HH:mm:ss para epoxy
const timerFormatted = computed(() => {
  const h = Math.floor(timerSecondsLeft.value / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((timerSecondsLeft.value % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (timerSecondsLeft.value % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
});

/**
 * Carga los datos del Epoxy y el inicio del timer desde localStorage.
 */
const loadEpoxyFromStorage = () => {
  lotA.value = localStorage.getItem("EpoxylotA") || "";
  lotB.value = localStorage.getItem("EpoxylotB") || "";
  serialEpoxyNo.value = localStorage.getItem("serialEpoxyNo") || "";
  expirationDate.value = localStorage.getItem("EpoxyexpirationDate") || "";

  const stored = localStorage.getItem("MES_EpoxyId");
  if (stored !== null) {
    // si guardaste como string, lo conviertes a número
    newEpoxyId.value = Number(stored);
  }
  const timerStart = localStorage.getItem("EpoxyTimerStart");
  if (timerStart) {
    epoxyTimerStart.value = dayjs(timerStart);
    updateEpoxyTimer(); // Calcula segundos restantes y arranca intervalo si hay tiempo
  }
};

/**
 * Calcula el tiempo restante del timer Epoxy y arranca el intervalo de cuenta regresiva.
 */
const updateEpoxyTimer = () => {
  if (timerInterval) clearInterval(timerInterval);

  //const threeHoursInSeconds = 3 * 60 * 60;
  const threeHoursInSeconds = 3 * 60 * 60;
  const now = dayjs();
  const start = epoxyTimerStart.value ? dayjs(epoxyTimerStart.value) : null;

  if (start && start.isValid()) {
    const elapsed = now.diff(start, "second");
    timerSecondsLeft.value = Math.max(threeHoursInSeconds - elapsed, 0);

    if (timerSecondsLeft.value > 0) {
      timerInterval = setInterval(() => {
        const elapsedNow = dayjs().diff(start, "second");
        timerSecondsLeft.value = Math.max(threeHoursInSeconds - elapsedNow, 0);

        // Cuando expire, limpiar todo y mostrar input
        if (timerSecondsLeft.value <= 0) {
          clearInterval(timerInterval);
          clearEpoxyStorage();
        }
      }, 1000);
    } else {
      // Ya expiró desde el inicio
      clearEpoxyStorage();
    }
  } else {
    timerSecondsLeft.value = 0;
    clearEpoxyStorage();
  }
};

//variables de Epoxy
const epoxyQR = ref("");
const lotA = ref("");
const lotB = ref("");
const serialEpoxyNo = ref("");
const expirationDate = ref("");

const clearEpoxyStorage = () => {
  localStorage.removeItem("EpoxylotA");
  localStorage.removeItem("EpoxylotB");
  localStorage.removeItem("serialEpoxyNo");
  localStorage.removeItem("EpoxyexpirationDate");
  localStorage.removeItem("EpoxyTimerStart");
  localStorage.removeItem("MES_EpoxyId");

  lotA.value = "";
  lotB.value = "";
  serialEpoxyNo.value = "";
  expirationDate.value = "";
  epoxyTimerStart.value = null;
  timerSecondsLeft.value = 0;

  // Limpia el intervalo del timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};
const selectedDowntimeReason = ref("");
const drawingSearch = ref("");

const downtimeEvents = ref([]);

const currentDowntimeId = computed(() => productionStore.currentDowntimeId);
const currentDowntimeReason = ref("");

const activeIds = ref(
  localStorage.getItem("Active_id")
    ? localStorage.getItem("Active_id").split(",")
    : []
);

// --- Nuevas variables computadas para el overlay ---
const handleDowntimeClick = async (event, reasonObj, index) => {
  // 🔹 VALIDACIÓN DE EMERGENCIA: Si el array de eventos está vacío o no existe
  // Esto evita que el index intente acceder a algo que ya no está ahí
  if (!downtimeEvents.value || downtimeEvents.value.length === 0) {
    console.warn(
      "⚠️ MES_DowntimeEvents no existe o está vacío. Reiniciando lógica de index."
    );
    // Aquí podrías decidir si quieres forzar un index 0 o simplemente salir
    // Si tu intención es crear uno nuevo desde cero, podrías manejarlo aquí.
    // Pero para evitar el error de "índice no válido", lo mejor es retornar:
    return;
  }

  // 🔹 Validamos que el objeto de razón exista
  if (!reasonObj || !reasonObj.value) {
    console.warn(t("console.rason"), "Objeto de razón no válido o indefinido");
    return;
  }

  const reasonID = reasonObj.value;
  const reason = reasonObj.label;

  console.log(
    `Procesando Downtime - ID Razón: ${reasonID}, Etiqueta: ${reason}`
  );

  // ✅ 1. Si el downtime ya existe en la base de datos (Actualización)
  if (event && event.DowntimeID && reasonID) {
    console.log(t("console.change"), event);
    await downtimeStore.changeDowntimeReasonID(event.DowntimeID, reasonID);

    hideRightDrawer();
    await cargarDowntimes(true);
    await loadDowntimeEventsFromLS();
    await renderDowntimeChart();
    return;
  }

  // 🟠 2. Si el downtime es automático y no tiene razón (Cerrar/Terminar)
  if (event && event.DowntimeType === false && !event.ReasonID) {
    console.log(t("console.undefinedw"), event);
    await downtimeStore.terminarDowntime(event.DowntimeID, reasonID);
    hideRightDrawer();
    await cargarDowntimes(true);
    await loadDowntimeEventsFromLS();
    await renderDowntimeChart();
    return;
  }

  // 🟡 3. Si el downtime es manual (Type null/undefined)
  if (
    !event ||
    event.DowntimeType === null ||
    event.DowntimeType === undefined
  ) {
    console.log(t("console.definedw"), event);

    const safeIndex =
      !Number.isInteger(index) ||
      index < 0 ||
      index >= downtimeEvents.value.length
        ? 0
        : index;

    // 🔥 Debug extra (cuando detecta index legado)
    if (safeIndex === 0 && index !== 0) {
      console.warn("⚠️ Index inválido detectado:", {
        indexRecibido: index,
        lengthActual: downtimeEvents.value.length,
        event,
      });
    }

    justifyDowntime(safeIndex, reason, reasonID);

    hideRightDrawer();
    await renderDowntimeChart();
  }
};

// Función para obtener los datos de 'activeDowntime' de localStorage
const getActiveDowntimeFromStorage = () => {
  const savedData = localStorage.getItem("activeDowntime");
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error(t("console.parsing"), e);
      return null;
    }
  }
  return null;
};

// Variable computada para la razón del downtime
const downtimeReasonToShow = computed(() => {
  return (
    currentDowntimeReason.value ||
    getActiveDowntimeFromStorage()?.ReasonLabel ||
    t("graph.nodefine")
  );
});

// Variable computada para el ID del downtime
const downtimeIdToShow = computed(() => {
  return (
    currentDowntimeId.value ||
    getActiveDowntimeFromStorage()?.DowntimeID ||
    "No definido"
  );
});

// Variable computada para la hora de inicio
const downtimeStartToShow = computed(() => {
  const startFromMemory = currentDowntime.value?.start;
  if (startFromMemory) {
    return formatDowntimeStart(startFromMemory);
  }

  const startFromStorage = getActiveDowntimeFromStorage()?.StartTime;
  if (startFromStorage) {
    return formatDowntimeStart(startFromStorage);
  }

  return t("overlay.nodata");
});

// Variable computada para el número de evento
const downtimeEventsLengthToShow = computed(() => {
  const eventsFromMemory = downtimeEvents.value.length;
  if (eventsFromMemory > 0) {
    return eventsFromMemory;
  }

  // Si no hay eventos en memoria, busca los de localStorage
  const savedEvents = localStorage.getItem("MES_DowntimeEvents");
  if (savedEvents) {
    try {
      const parsedEvents = JSON.parse(savedEvents);
      return parsedEvents.length + 1; // Sumamos 1 para el evento actual
    } catch (e) {
      console.error(t("console.parsing2"), e);
    }
  }

  return "N/A"; // Si no se encuentra nada
});

// downtimeEvents lo recibes de tu store, así que no lo redefinimos aquí
const itemsPerPage = 4;
const currentPage = ref(1);

const totalPages = computed(() => {
  return Math.ceil(productionStore.downtimeEvents.length / itemsPerPage);
});

const paginatedDowntimeEvents = computed(() => {
  // Copiamos y ordenamos
  const sorted = [...downtimeEvents.value].sort((a, b) => {
    // 1️⃣ Prioridad Máxima: Si falta ReasonID "Downtimes sin Definir" O falta EndTime "Downtimes Abiertos"
    const priorityA = a.ReasonID === null || a.EndTime === null;
    const priorityB = b.ReasonID === null || b.EndTime === null;

    if (priorityA && !priorityB) return -1;
    if (!priorityA && priorityB) return 1;

    // 2️⃣ Si ambos están en la misma categoría de prioridad,
    // ordenamos por StartTime (del más viejo al más nuevo)
    const timeA = new Date(a.start).getTime();
    const timeB = new Date(b.start).getTime();

    return timeA - timeB;
  });

  // 3️⃣ Aplicamos la paginación
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sorted.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

//Condicionales con DOWNTIME ACTIVO

const handleConfigurationClick = () => {
  if (isDowntimeActive.value || localStorage.getItem("MES_AutoDowntimeID")) {
    $q.notify({
      type: "warning",
      message: t("notify.handleConfigurationClick"),
      position: "top",
      timeout: 3000,
    });
    return;
  }

  showConfigurationDrawer();
};

const reasonColors = {
  Mantenimiento: "blue-8", // Más oscuro y vibrante
  Descanso: "green-8", // Más oscuro y vibrante
  Material: "cyan-9", // Más oscuro y vibrante
  Almuerzo: "orange-8", // Más oscuro y vibrante
  Reunión: "amber-8", // Más oscuro y vibrante
  Entrenamiento: "indigo-8", // Más oscuro y vibrante
  Break: "green-8",
  Lunch: "orange-8",
  Meeting: "amber-8",
  Maintenance: "blue-8",
  Training: "indigo-8",
  Przerwa: "green-8",
  Obiad: "orange-8",
  Spotkanie: "amber-8",
  Konserwacja: "blue-8",
  Szkolenie: "indigo-8",
  Materialy: "cyan-9",

  // Puedes agregar más según tus razones
};

const etqRows = ref([]); // Aquí se cargarán las filas de documentos ETQ
const etqLoading = ref(false); // Estado de carga para documentos ETQ
const etqColumns = computed(() => [
  {
    name: "ETQ_Document",
    label: t("drawing.etqDocs"),
    field: "ETQ_Document",
    align: "center",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
  {
    name: "Title",
    label: t("drawing.description"),
    field: "Title",
    align: "left",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
]);
const stationPrefix = computed(() =>
  (stationStore.getStationName || "").slice(0, 3)
);

async function loadEtqDocs() {
  if (!stationPrefix.value) {
    etqRows.value = [];
    return;
  }
  etqLoading.value = true;
  try {
    const raw = await stationStore.fetchEtqDocsByPrefix();
    console.log(t("console.rawdata"), raw); // Debug raw data
    etqRows.value = raw
      .map((r) => {
        const mappedRow = {
          jobId: stationPrefix.value,
          ETQ_Document:
            r.ETQ_Document ?? r.document_number ?? r.DocNumber ?? "",
          url: r.attachment_url ?? r.AttachmentUrl ?? r.Url ?? null,
          Title: r.Title ?? "",
        };
        console.log(t("console.mapped"), mappedRow); // Debug each mapped row
        return mappedRow;
      })
      .filter((x) => x.ETQ_Document);
    console.log(t("console.etqfilter"), etqRows.value); // Debug final rows
  } catch (e) {
    $q.notify({ type: "negative", message: t("notify.etq") });
    etqRows.value = [];
  } finally {
    etqLoading.value = false;
  }
}

const onEtqRowClick = (_evt, row) => {
  row?.url
    ? window.open(row.url, "blank")
    : $q.notify({
        type: "warning",
        message: t("notify.etqdocument"),
      });
};

watch([rightDrawerContentType, stationPrefix], ([type]) => {
  if (type === "drawing") loadEtqDocs();
});

// Columnas para el drawer de dibujos
const drawingColumns = computed(() => [
  {
    name: "jobId",
    label: "AFL",
    field: "jobId",
    align: "center",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
    classes: "text-h6",
  },
  {
    name: "AFL_Drawing_NUMBER",
    label: t("drawing.techDocs"),
    field: "AFL_Drawing_NUMBER",
    align: "center",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
]);

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║                  CARGAR DATOS DE DOWNTIMES DESDE SQL                    ║
// ╚═════════════════════════════════════════════════════════════════════════╝
const cargarDowntimes = async (forceUpdate = false) => {
  console.log(t("console.updatedw"));

  const areaId = localStorage.getItem("MES_SelectedArea");
  const lineId = localStorage.getItem("MES_SelectedLine");
  const stationId = localStorage.getItem("MES_SelectedStation");
  const fecha = dayjs().format("YYYY-MM-DD");
  const shift = productionStore.currentShift;

  if (!areaId || !lineId || !stationId || !fecha || !shift) {
    console.warn(t("console.pendingdw"));
    downtimeEvents.value = [];
    localStorage.setItem("MES_UnjustifiedCount", "0");
    return;
  }

  // Cargar desde localStorage si no es forzado y existen datos
  if (!forceUpdate) {
    const localData = localStorage.getItem("MES_DowntimeEvents");
    if (localData) {
      downtimeEvents.value = JSON.parse(localData);
      console.log(t("console.localdw"));
    }
  }

  // Si es forzado o no se encontró data en localStorage, pedir datos al store
  if (forceUpdate || downtimeEvents.value.length === 0) {
    if (forceUpdate) {
      localStorage.removeItem("MES_DowntimeEvents");
      console.log(t("console.deletedw"));
    }
    await productionStore.fetchDowntimeEvents();
    downtimeEvents.value = productionStore.downtimeEvents;
  }

  // Calcular y guardar el contador y la alerta DESPUÉS de actualizar la lista de eventos
  const count = downtimeEvents.value.filter((d) => d?.ReasonID == null).length;

  localStorage.setItem("MES_UnjustifiedCount", count.toString());
  console.log(t("console.mesalert1"), count);

  // Validar si no hay pendientes
  if (count === 0) {
    alertDowntime.value = false;
    syncUnjustifiedCount();
  } else {
    alertDowntime.value = true;
    syncUnjustifiedCount();
  }

  // Guardar en localStorage solo si hay datos para evitar guardados vacíos
  if (downtimeEvents.value && downtimeEvents.value.length > 0) {
    localStorage.setItem(
      "MES_DowntimeEvents",
      JSON.stringify(downtimeEvents.value)
    );
    console.log(t("console.localdw2"));
  } else {
    console.log(t("console.unlocatedw"));
  }
};
//Agregar Downntime
const agregarDowntime = () => {
  if (!activeIds.value.length) {
    $q.notify({
      type: "warning",
      message: t("notify.startjobdowntime"),
      position: "top",
      timeout: 2500,
    });
    return;
  }

  const now = new Date();

  downtimeEvents.value.push({
    start: now,
    end: null,
    duration: null,
    justifiedBy: null,
    showJustifyOptions: true,
    jobIds: [...activeIds.value], // 👈 guardamos el arreglo completo
  });

  // Actualizar paginación
  const totalPages = Math.ceil(downtimeEvents.value.length / itemsPerPage);
  currentPage.value = totalPages;
};

// Función modificada para llamar al store
const terminarDowntime = async (downtimeId) => {
  if (!downtimeId || downtimeId <= 0) return;

  const success = await downtimeStore.terminarDowntime(downtimeId);
  await cargarDowntimes(true);
  await loadDowntimeEventsFromLS();
  await renderDowntimeChart();

  if (success) {
    isDowntimeActive.value = false;
    //  🔄 Actualizar los datos y guardar en LocalStorage
    await cargarDowntimes(true);
    await loadDowntimeEventsFromLS();
    await renderDowntimeChart();
  }
};

// totalDowntimeFormatted ahora depende de downtimeEvents.value
// 1️⃣ Crear un ref que contenga los eventos del localStorage
const downtimeEventsLS = ref([]);

// 2️⃣ Función para sincronizar desde localStorage
const loadDowntimeEventsFromLS = () => {
  const localData = localStorage.getItem("MES_DowntimeEvents");
  if (!localData) {
    downtimeEventsLS.value = [];
    return;
  }

  try {
    downtimeEventsLS.value = JSON.parse(localData);
  } catch (e) {
    console.error(t("console.errorparsing"), e);
    downtimeEventsLS.value = [];
  }
};

// 3️⃣ Inicializamos al montar el componente
loadDowntimeEventsFromLS();

// 4️⃣ Computed que depende del ref reactivo
const totalDowntimeFormatted = computed(() => {
  if (!downtimeEventsLS.value || downtimeEventsLS.value.length === 0)
    return "00:00:00";

  let totalSeconds = 0;
  for (const event of downtimeEventsLS.value) {
    if (!event.DurationSeconds) continue;
    totalSeconds += Number(event.DurationSeconds);
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

const currentDowntimeIndex = computed(() => {
  return downtimeEvents.value.findIndex(
    (e) => e.end === null && e.duration === null
  );
});

const currentDowntime = computed(() => {
  return downtimeEvents.value[currentDowntimeIndex.value] || null;
});

const formatDowntimeStart = (date) => {
  if (!date) return "---";

  // 1. Obtener el idioma de localStorage o usar 'es' como predeterminado
  const currentLang = localStorage.getItem("lang") || "es";

  // 2. Usar .locale(currentLang) para aplicar el idioma antes de formatear
  return dayjs(date)
    .locale(currentLang) // Aplica el locale
    .format("hh:mm:ss A - DD/MMMM/YYYY");
};

// Computed que filtra y deduplica por dibujo
const drawingRows = computed(() => {
  // 1) filtro sólo los que tienen AFL_Drawing_NUMBER no vacío
  const withDrawing = productionStore.productionRows.filter(
    (r) => r.AFL_Drawing_NUMBER && r.AFL_Drawing_NUMBER.trim() !== ""
  );

  // 2) uso un Map para quedarme con uno por cada AFL_Drawing_NUMBER
  const uniq = new Map();
  withDrawing.forEach((r) => {
    if (!uniq.has(r.AFL_Drawing_NUMBER)) {
      // recorto jobId al prefijo antes del '-'
      const prefix = r.jobId.split("-")[0];

      uniq.set(r.AFL_Drawing_NUMBER, {
        jobId: prefix,
        AFL_Drawing_NUMBER: r.AFL_Drawing_NUMBER,
      });
    }
  });

  return Array.from(uniq.values());
});

const filter = ref("");

// Información de la estación y operador
const badgeScanInput = ref("");

// Columnas para la tabla de badges escaneados
const badgeColumns = computed(() => [
  {
    name: "id",
    label: t("operator.badgeid"),
    field: "id",
    align: "left",
    sortable: true,
  },
  {
    name: "name",
    label: t("operator.fullName"),
    field: "name",
    align: "left",
    sortable: true,
  },
  {
    name: "actions",
    label: t("operator.actions"),
    field: "actions",
    align: "center",
  },
]);

// Hora actual en el sidebar

const currentTime = ref(dayjs().tz("America/Mexico_City").format("hh:mm:ss A"));
const currentDate = ref(dayjs().tz("America/Mexico_City").format("DD-MM-YYYY"));

let timeInterval = null; // Para actualizar la hora y el gráfico de estado

// Ref para hora y fecha en Polonia
const currentTimePoland = ref(dayjs().tz("Europe/Warsaw").format("hh:mm:ss A"));
const currentDatePoland = ref(dayjs().tz("Europe/Warsaw").format("DD-MM-YYYY"));

let polandInterval = null;

// Control de diálogos
const completeConfirmDialog = ref(false);
const pauseDialog = ref(false);
const detailsDialog = ref(false);
const selectedRow = ref(null); // Fila seleccionada para acciones/detalles
const detailsTab = ref("general"); // Nueva variable para controlar la pestaña activa en el diálogo de detalles

// Computed reactivo para el número de conectores
const connectorCount = computed(() => {
  const a = selectedRow.value?.numberOfConnectors || 0;
  const b = selectedRow.value?.numberOfConnectorsB || 0;
  return a + b;
});

const newConnectorCount = ref(null);
const activeTerminalTab = ref("A");
const connectorCountA = ref(null);
const connectorCountB = ref(null);

const ensureConnectorsDefined = () => {
  if (selectedRow.value.numberOfConnectors == null) {
    // Abrimos panel de captura
    rightDrawerContentType.value = "number-connectors";
    rightDrawerOpen.value = true;
    $q.notify({
      message: t("notify.insertconnectors"),
      color: "warning",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
    return false;
  }
  return true;
};

watch(selectedRow, (newRow) => {
  if (!newRow) return;

  reworkReasons.value.forEach((r) => {
    r.showPuntasExpansion = false;
    r.selectedPuntasA = [];
    r.selectedPuntasB = [];
    r.puntasConfirmed = false;
    r.isFixed = false;
  });

  // (Opcional) notificación
  $q.notify({
    message: `${t("notify.fila")} ${newRow.jobId} ${t("notify.cargada")}: ${
      connectorCount.value
    } ${t("notify.conectores")}`,
    color: "info",
    position: "top",
  });
});

// Función para confirmar el conteo de conectores
const confirmConnectorCount = () => {
  const id = selectedRow.value.id;

  // ===== VALIDACIONES =====
  if (!connectorCountA.value || connectorCountA.value < 1) {
    activeTerminalTab.value = "A";
    return $q.notify({
      message: "Debe ingresar el número de conectores en Terminal A",
      color: "warning",
      icon: "warning",
      position: "top",
      timeout: 1500,
    });
  }

  if (!connectorCountB.value || connectorCountB.value < 1) {
    activeTerminalTab.value = "B";
    return $q.notify({
      message: "Debe ingresar el número de conectores en Terminal B",
      color: "warning",
      icon: "warning",
      position: "top",
      timeout: 1500,
    });
  }

  // mantenemos compatibilidad total con reworks
  selectedRow.value.numberOfConnectors = connectorCountA.value;
  selectedRow.value.numberOfConnectorsB = connectorCountB.value;

  // ===== NOTIFICACIÓN =====
  $q.notify({
    message: `${t("notify.numconnectors")} ${
      selectedRow.value.numberOfConnectors
    }`,
    color: "positive",
    icon: "check",
    position: "top",
    timeout: 1500,
  });

  // ===== FLUJO ORIGINAL =====
  if (nextAction.value === "rework") {
    rightDrawerContentType.value = "rework";
    rightDrawerOpen.value = true;
  } else if (nextAction.value === "complete") {
    rightDrawerOpen.value = false;
    setTimeout(() => confirmComplete(), 0);
    activeTerminalTab.value = "A";
  }

  nextAction.value = null;
};

// Nuevas variables para la lógica de retrabajo
const reworkReasons = ref([]);
const selectedReworkReason = ref(null);

// Nuevas variables para la gestión de defectos (Puntas)
const terminalTab = ref("terminalA"); // Tab activa en el panel de terminales
const currentEditingDefectId = ref(null); // ID del defecto cuyas puntas se están editando

// KPIs (Indicadores Clave de Rendimiento)
const metrics = ref([
  {
    title: computed(() => t("kpi.Connectors")),
    value: computed(() => productionStore.sumConnectorsOk),
    icon: "layers",
    iconColor: "primary",
    cardClass: "kpi-bg-primary",
  },
  {
    title: computed(() => t("kpi.average")),
    value: computed(() => productionStore.averageCycleTime),
    icon: "speed",
    iconColor: "green-6",
    cardClass: "kpi-bg-green",
  },
  {
    title: computed(() => t("kpi.rework")),
    value: computed(() => productionStore.sumConnectorsNg),
    icon: "sync_problem",
    iconColor: "orange-6",
    cardClass: "kpi-bg-orange",
  },
  {
    title: computed(() => t("kpi.downtime")),
    value: totalDowntimeFormatted,
    subtitle: computed(() =>
      isDowntimeActive.value ? "Downtime activo" : "Acumulado"
    ),
    icon: computed(() =>
      isDowntimeActive.value ? "hourglass_top" : "timer_off"
    ),
    iconSpin: computed(() => isDowntimeActive.value),
    iconColor: "red-6",
    valueColor: "white",
    cardClass: "kpi-bg-red",
  },
]);

// Localizacion de la función formatSmartDate en MESSystem.vue
const formatSmartDate = (start, end = null, isStartTime = false) => {
  if (!start) return "-";

  // Usamos dayjs.utc() para FORZAR a que mantenga la hora exacta de SQL (12:01)
  // sin importar en qué país se abra el navegador.
  const startDate = dayjs.utc(start);
  if (!startDate.isValid()) return "-";

  const endDate = end ? dayjs.utc(end) : null;

  // Lógica para START TIME
  if (isStartTime) {
    // Si no hay fecha de fin (el trabajo sigue abierto)...
    if (!endDate || !endDate.isValid()) {
      // Usamos dayjs.utc() para el día de hoy también, para comparar manzanas con manzanas
      const hoy = dayjs.utc();

      // Comparamos si el inicio fue hoy o en un día anterior
      return startDate.isSame(hoy, "day")
        ? startDate.format("hh:mm A")
        : startDate.format("DD/MM/YYYY hh:mm A");
    }

    // Si sí hay fecha de fin, comparamos el inicio contra el fin
    return startDate.isSame(endDate, "day")
      ? startDate.format("hh:mm A")
      : startDate.format("DD/MM/YYYY hh:mm A");
  }

  // Lógica para END TIME
  if (!endDate || !endDate.isValid()) return "-";

  return startDate.isSame(endDate, "day")
    ? endDate.format("hh:mm A")
    : endDate.format("DD/MM/YYYY hh:mm A");
};

// Definición de columnas para q-table
const columns = computed(() => [
  {
    name: "id",
    label: "#",
    field: "index",
    align: "center",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
  {
    name: "jobId",
    label: t("history.jobid"),
    field: "jobId",
    align: "center",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
  {
    name: "status",
    label: t("history.status"),
    field: "status",
    align: "center",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
  {
    name: "productionDate",
    label: t("history.pdate"),
    field: "productionDate",
    align: "center",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
  {
    name: "scanStart",
    label: t("history.start"),
    // Usamos una función en field para buscar con mayúscula o minúscula
    field: (row) => row.ScanStart || row.scanStart,
    align: "center",
    sortable: true,
    // Ahora 'val' siempre tendrá el dato correcto
    format: (val, row) =>
      formatSmartDate(val, row.ScanEnd || row.scanEnd, true),
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
  {
    name: "scanEnd",
    label: t("history.end"),
    // Usamos una función en field para buscar con mayúscula o minúscula
    field: (row) => row.ScanEnd || row.scanEnd,
    align: "center",
    sortable: true,
    sortMethod: (a, b, rowA, rowB) => {
      const aNull = !a;
      const bNull = !b;

      if (aNull && !bNull) return -1;
      if (!aNull && bNull) return 1;

      if (aNull && bNull) {
        return new Date(rowB.productionDate) - new Date(rowA.productionDate);
      }

      return new Date(b) - new Date(a);
    },
    // Pasamos los datos asegurando que no vayan vacíos
    format: (val, row) =>
      formatSmartDate(row.ScanStart || row.scanStart, val, false),
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
  {
    name: "duration",
    label: t("history.duration"),
    field: "duration",
    align: "center",
    sortable: true,
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
  {
    name: "actions",
    label: t("history.actions"),
    field: "actions",
    align: "center",
    headerClasses: "text-blue-grey-10",
    headerStyle: "text-align: center; background-color: #e0f2f7;",
  },
]);

// --- Highcharts ---
const kpiChartContainer = ref(null); // Ref para el div del gráfico de KPIs
let kpiChartInstance = null; // Para almacenar la instancia del gráfico Highcharts

const scannerStatusChartContainer = ref(null); // Ref para el div del nuevo gráfico de estado del escáner
let scannerStatusChartInstance = null; // Para almacenar la instancia del nuevo gráfico

// Opciones de Highcharts para KPIs (se mantiene por si se quiere añadir de nuevo)
const kpiChartOptions = computed(() => {
  const categories = [];
  const data = [];

  metrics.value.forEach((metric) => {
    categories.push(metric.title);
    let value = 0;
    // Accede al valor del computed property
    const metricValue =
      typeof metric.value === "function" ? metric.value.value : metric.value;

    if (metric.title === "Tiempo Promedio") {
      value = parseFloat(String(metricValue).replace(" s", ""));
    } else if (metric.title === "Downtime") {
      value = parseFloat(String(metricValue).replace("m", "")) || 0;
    } else {
      value = metricValue;
    }
    data.push(value);
  });

  return {
    chart: {
      type: "column",
      height: 250,
      renderTo: kpiChartContainer.value, // Indica a Highcharts dónde renderizar
      style: {
        fontFamily: "Roboto, sans-serif",
      },
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: categories,
      labels: {
        style: {
          color: "#616161",
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Cantidad / Tiempo (segundos)",
        style: {
          color: "#616161",
        },
      },
      labels: {
        style: {
          color: "#616161",
        },
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: "Valor",
        data: data,
        color: "#3498db",
      },
    ],
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      enabled: false,
    },
  };
});

// Función para convertir segundos a HH:MM:SS
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
};

// Función para contar eventos por tipo de downtime
const contarEventosDowntime = () => {
  const storedDowntimeEvents = localStorage.getItem("MES_DowntimeEvents");
  if (!storedDowntimeEvents) return;

  const downtimeEvents = JSON.parse(storedDowntimeEvents);

  // Agrupar por razón y contar
  const conteoPorRazon = downtimeEvents.reduce((acc, event) => {
    const reason = event.DownTimeReason;
    if (!acc[reason]) {
      acc[reason] = 0;
    }
    acc[reason] += 1;
    return acc;
  }, {});

  console.log(t("console.countev"), conteoPorRazon);

  // Si quieres un array con { name, count }
  const conteoArray = Object.keys(conteoPorRazon).map((reason) => ({
    name: reason,
    count: conteoPorRazon[reason],
  }));

  return conteoArray;
};

// Función para obtener el color hexadecimal basado en el motivo del downtime
const getReasonColor = (reason) => {
  switch (reason) {
    case "Mantenimiento":
      return "#1976D2"; // blue-8
    case "Descanso":
      return "#388E3C"; // green-8
    case "Material":
      return "#006064"; // cyan-9
    case "Almuerzo":
      return "#EF6C00"; // orange-8
    case "Reunión":
      return "#FF8F00"; // amber-8
    case "Entrenamiento":
      return "#283593"; // indigo-8
    //--------------------------------------
    case "Konserwacja":
      return "#1976D2"; // blue-8
    case "Przerwa":
      return "#388E3C"; // green-8
    case "Materialy":
      return "#006064"; // cyan-9
    case "Obiad":
      return "#EF6C00"; // orange-8
    case "Spotkanie":
      return "#FF8F00"; // amber-8
    case "Szkolenie":
      return "#283593"; // indigo-8
    //-------------------------------------------
    case "Maintenance":
      return "#1976D2"; // blue-8
    case "Break":
      return "#388E3C"; // green-8
    case "Lunch":
      return "#EF6C00"; // orange-8
    case "Meeting":
      return "#FF8F00"; // amber-8
    case "Training":
      return "#283593"; // indigo-8
    default:
      return "#9E9E9E"; // grey-5 o color por defecto
  }
};

// Función para crear la gráfica
let blinkIntervalId = null;

const getReasonByLang = (event) => {
  if (locale.value === "en") return event.DownTimeReasonEN;
  if (locale.value === "es") return event.DownTimeReasonES;
  return event.DownTimeReason; // es
};

const renderDowntimeChart = () => {
  const savedData = localStorage.getItem("MES_DowntimeEvents");
  if (!savedData) return;

  const downtimeEvents = JSON.parse(savedData);

  console.log(t("console.chartup"), downtimeEvents);

  let currentShift = "No disponible";
  if (downtimeEvents && downtimeEvents.length > 0) {
    currentShift = downtimeEvents[0].Shift;
  }

  const groupedData = downtimeEvents.reduce((acc, event) => {
    // 🔴 CAMBIO DE IDIOMA PARA DOWNTIMEREASON
    const reason = getReasonByLang(event) || t("graph.nodefine");

    const duration = event.DurationSeconds;
    if (!acc[reason]) {
      acc[reason] = { totalSeconds: 0, count: 0 };
    }
    acc[reason].totalSeconds += duration;
    acc[reason].count += 1;
    return acc;
  }, {});

  const chartData = Object.keys(groupedData)
    .map((reason) => ({
      name: reason,
      y: groupedData[reason].totalSeconds,
      eventsCount: groupedData[reason].count,
      color: getReasonColor(reason),
    }))
    .sort((a, b) => b.y - a.y);

  const totalSeconds = chartData.reduce((sum, item) => sum + item.y, 0);
  chartData.forEach((item) => {
    item.percentage = totalSeconds
      ? ((item.y / totalSeconds) * 100).toFixed(1)
      : 0;
  });

  const chart = Highcharts.chart("downtime-chart", {
    chart: {
      type: "column",
      animation: { duration: 800 },
      backgroundColor: "transparent",
      borderWidth: 0,
      events: {
        click: function () {
          if (typeof showDowntimeDetails === "function") {
            showDowntimeDetails();
          }
        },
      },
    },
    title: {
      useHTML: true,
      text: `
        <div style="display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 1rem; color: #333;">
          <img src="/img/AFL.png" alt="Logo" style="height: 28px; border-radius: 4px;" />
          <span>${t("graph.title")}${currentShift}</span>
        </div>
      `,
    },
    subtitle: {
      text: `${t("Reporte.total1")}: <b>${formatTime(totalSeconds)}</b> (${
        downtimeEvents.length
      } ${downtimeEvents.length === 1 ? t("graph.event") : t("graph.events")})`,
      style: { fontSize: "12px", color: "#555" },
    },

    accessibility: { enabled: false },
    xAxis: {
      categories: chartData.map((item) => item.name),
      labels: {
        style: { fontSize: chartData.length > 6 ? "10px" : "12px" },
        rotation: chartData.length > 8 ? -45 : 0,
      },
    },
    yAxis: {
      min: 0,
      tickInterval: 1800,
      minorTickInterval: 300,
      minorGridLineWidth: 0.5,
      minorGridLineColor: "#e0e0e0",
      title: { text: "" },
      labels: {
        formatter: function () {
          if (this.value < 3600) {
            const minutes = this.value / 60;
            return `${minutes}m`;
          } else {
            const hours = this.value / 3600;
            return `${hours % 1 === 0 ? hours : hours.toFixed(1)}h`;
          }
        },
      },
    },
    legend: {
      enabled: false,
      layout: "horizontal",
      align: "center",
      verticalAlign: "top",
      y: 10,
      backgroundColor: "transparent",
      itemStyle: { fontWeight: "normal", fontSize: "12px" },
    },
    tooltip: {
      formatter: function () {
        // Usamos la variable t que ya tienes definida en el setup
        return `
      ${t("downtimepanel.lapso")}: <b>${formatTime(this.y)}</b><br/>
      ${t("downtimepanel.ev")}: <b>${this.point.eventsCount}</b><br/>
      ${t("downtimepanel.average")}: <b>${this.point.percentage}%</b>`;
      },
      useHTML: true,
      positioner: function (labelWidth, labelHeight, point) {
        return {
          x: this.chart.plotWidth - labelWidth,
          y: (this.chart.plotHeight - labelHeight) / 2,
        };
      },
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          crop: false,
          overflow: "none",
          useHTML: true,
          formatter: function () {
            // Usamos t() para obtener la traducción de 'Ev'
            const labelEv = t("downtimepanel.ev");

            return `${formatTime(this.y)}<br>
              <span style="font-size:9px; color:#555;">${
                this.point.percentage
              }%</span> /
              <span style="font-size:9px; color:#555;">${labelEv} = ${
              this.point.eventsCount
            }</span>`;
          },
          style: {
            fontSize: "10px",
            fontWeight: "bold",
            textOutline: "none",
          },
        },
      },
    },
    series: [
      {
        name: "Duración",
        data: chartData,
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              if (typeof showDowntimeDetails === "function") {
                showDowntimeDetails();
              }
            },
          },
        },
      },
    ],
    credits: { enabled: false },
  });

  if (blinkIntervalId) {
    clearInterval(blinkIntervalId);
  }

  const sinJustificarPoint = chart?.series?.[0]?.data?.find(
    (p) => p.name === t("graph.nodefine")
  );

  if (sinJustificarPoint) {
    let toggle = false;
    blinkIntervalId = setInterval(() => {
      toggle = !toggle;
      sinJustificarPoint.update({
        color: toggle ? "#ff0000" : "#ffaaaa",
      });
    }, 500);
  }
};

watch(locale, () => {
  renderDowntimeChart();
});

// Watcher para actualizar el gráfico de KPIs cuando las opciones cambien
watch(
  kpiChartOptions,
  (newOptions) => {
    if (kpiChartInstance) {
      kpiChartInstance.update(newOptions);
    }
  },
  { deep: true }
);

// Opciones de Highcharts para el nuevo gráfico de estado del escáner (barras por segundo)
const scannerStatusChartOptions = computed(() => {
  const today = dayjs();

  const startOfPeriod = today
    .hour(7)
    .minute(0)
    .second(0)
    .millisecond(0)
    .valueOf();
  const endOfPeriod = today
    .hour(20)
    .minute(0)
    .second(0)
    .millisecond(0)
    .valueOf();

  return {
    chart: {
      type: "column",
      height: 150,
      renderTo: scannerStatusChartContainer.value,
      style: {
        fontFamily: "Roboto, sans-serif",
      },
      animation: false,
      zoomType: "x",

      events: {},
    },
    title: {
      text: null,
      style: {
        fontSize: "10px",
      },
    },
    xAxis: {
      type: "datetime",
      min: startOfPeriod,
      max: endOfPeriod,
      tickPositioner: function () {
        const ticks = [];
        const start = dayjs()
          .tz("America/Mexico_City")
          .hour(7)
          .minute(0)
          .valueOf();
        const end = dayjs()
          .tz("America/Mexico_City")
          .hour(20)
          .minute(0)
          .valueOf();
        for (let t = start; t <= end; t += 2 * 3600 * 1000) {
          ticks.push(t);
        }
        return ticks;
      },
      labels: {
        format: "{value:%H:%M}",
        autoRotation: false,
        step: 1,
        style: {
          color: "#616161",
          fontSize: "11px",
        },
      },
      crosshair: true,
    },
    yAxis: {
      title: {
        text: null,
      },
      labels: {
        enabled: false,
      },
      min: 0,
      max: 1,
      gridLineWidth: 0,
      plotBands: [
        // Band for inactive status
        {
          from: 0.5,
          to: 1,
          color: "rgba(231, 76, 60, 0.1)",
          label: {
            text: t("graph.inactive"),
            style: {
              color: "#e74c3c",
              fontWeight: "bold",
              fontSize: "10px",
            },
            align: "right",
            x: -10,
            verticalAlign: "top",
            y: -5,
          },
        },
        // Band for active status
        {
          from: 0.1,
          to: 0.5,
          color: "rgba(46, 204, 113, 0.1)",
          label: {
            text: t("graph.active"),
            style: {
              color: "#2ecc71",
              fontWeight: "bold",
              fontSize: "10px",
            },
            align: "right",
            x: -10,
            verticalAlign: "bottom",
            y: 5,
          },
        },
      ],
    },
    tooltip: {
      formatter: function () {
        const time = Highcharts.dateFormat("%H:%M:%S", this.x);

        const isCurrentlyActive = productionStore.hasPendingScans;
        const status = isCurrentlyActive
          ? t("graph.active")
          : t("graph.inactive");

        return `
      <b>${t("history.hour")}:</b> ${time}<br/>
      <b>${t("history.status")}:</b> ${status}
    `;
      },
      shared: false,
      useHTML: true,
    },

    plotOptions: {
      column: {
        pointPadding: 0,
        groupPadding: 0,
        borderWidth: 0,
        shadow: false,
        pointWidth: 5,
        crisp: false,
      },
    },
    series: [
      {
        name: "Scanner Status",
        data: [],
      },
    ],
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      enabled: false,
    },
  };
});

// Watcher para actualizar el gráfico de KPIs cuando las opciones cambien
watch(
  kpiChartOptions,
  (newOptions) => {
    if (kpiChartInstance) {
      kpiChartInstance.update(newOptions);
    }
  },
  { deep: true }
);

// ░░ Lógica para el borde animado del "Scan Card"  ░░
const scanCardBorderColors = ref(["#ffc719", "#ff6908", "#ed3b21"]); // Colores para la animación (amarillo, naranja, rojo)
const currentBorderColorIndex = ref(0);
const scanCardBorderColor = ref("#bdbdbd"); // Color inicial cuando no hay pendientes (gris)
let borderAnimationInterval = null;
const flashAnimationActive = ref(false); // Para activar/desactivar la clase de animación

// Computed property para saber si hay escaneos pendientes
const hasPendingScans = computed(() => {
  return productionStore.hasPendingScans;
});

// Lógica para iniciar la animación del borde (cuando NO hay pendientes)
const startBorderAnimation = () => {
  if (borderAnimationInterval) {
    clearInterval(borderAnimationInterval);
  }
  borderAnimationInterval = setInterval(() => {
    currentBorderColorIndex.value =
      (currentBorderColorIndex.value + 1) % scanCardBorderColors.value.length;
    scanCardBorderColor.value =
      scanCardBorderColors.value[currentBorderColorIndex.value];
    triggerFlashAnimation(); // Dispara la animación de destello en cada cambio de color
  }, 1000); // Cambia de color cada 1 segundo
};

// Lógica para detener la animación del borde
const stopBorderAnimation = () => {
  if (borderAnimationInterval) {
    clearInterval(borderAnimationInterval);
    borderAnimationInterval = null;
  }
  flashAnimationActive.value = false;
};

// Función para activar y desactivar la animación de destello
const triggerFlashAnimation = () => {
  flashAnimationActive.value = false;
  // Truco para forzar el reflow/repaint y que la animación se reinicie
  void document.getElementById("scan-card-id")?.offsetWidth;
  flashAnimationActive.value = true;
};

// Observa si hay escaneos pendientes para iniciar/detener la animación y cambiar el color
watch(
  hasPendingScans,
  (newVal) => {
    if (newVal) {
      // Si hay pendientes, detener la animación de alerta y poner el borde en verde fijo.
      stopBorderAnimation();
      scanCardBorderColor.value = "#2ecc71"; // Verde fijo cuando hay elementos pendientes
    } else {
      // Si NO hay pendientes, iniciar la animación de alerta de colores (indicando inactividad)
      startBorderAnimation();
    }
  },
  { immediate: true }
); // Ejecutar inmediatamente al montar para establecer el estado inicial

// Función para actualizar el gráfico de estado del escáner cada segundo
const updateScannerStatusChart = () => {
  if (!scannerStatusChartInstance) return;
  const now = dayjs().tz("America/Mexico_City");
  //Para timestamp en milisegundos
  const currentTimestamp = now.valueOf();

  const startOfPeriod = now
    .hour(7)
    .minute(0)
    .second(0)
    .millisecond(0)
    .valueOf();
  const endOfPeriod = now.hour(20).minute(0).second(0).millisecond(0).valueOf();

  // Solo agrega puntos si estamos dentro del rango de 7 AM a 11 PM
  if (
    currentTimestamp >= startOfPeriod &&
    currentTimestamp <= endOfPeriod &&
    scannerStatusChartInstance &&
    scannerStatusChartInstance.series &&
    scannerStatusChartInstance.series[0]
  ) {
    const isStationActive = hasPendingScans.value;
    const barColor = isStationActive ? "#2ecc71" : "#e74c3c"; // Verde para activo, Rojo para inactivo

    // Añade un nuevo punto al gráfico
    // x: timestamp (segundo actual), y: 1 (valor fijo para altura de barra)
    scannerStatusChartInstance.series[0].addPoint(
      {
        x: currentTimestamp,
        y: 1,
        color: barColor,
      },
      true, // redraw: true para que el gráfico se actualice inmediatamente
      false, // shift: false para NO eliminar puntos antiguos (mantiene el historial del día)
      false // animation: false para que la adición sea instantánea
    );
  }
};

// ░░ FUNCIONES DE LÓGICA Y ESTADO ░░

// Helper function para convertir a numerical el status para mostrarlo en string
const getDisplayStatus = computed(() => {
  return (statusCode) => {
    switch (statusCode) {
      case 1:
        return t("helper.pending");
      case 2:
        return t("helper.done");
      case 3:
        return t("helper.rw");
      default:
        return t("helper.unknow");
    }
  };
});

// Nuevas variables para la contraseña de configuración
const configPassword = ref("");
const passwordVisible = ref(false);
const passwordEntered = ref(false); // Controla si la contraseña ha sido ingresada correctamente

// Computed property para controlar la visibilidad del overlay de bienvenida de la estación
const shouldBlockMainContent = computed(() => {
  return !stationStore.isStationConfigured || !operatorStore.isLoggedIn;
});

// Función para verificar la contraseña
const checkPassword = () => {
  if (configPassword.value === "Admin") {
    passwordEntered.value = true;
    $q.notify({
      message: t("notify.password1"),
      color: "positive",
      icon: "lock_open",
      position: "top",
      timeout: 2000,
    });
    // Carga las áreas al ingresar la contraseña
    stationStore.fetchAreasFromDb($q);
  } else {
    $q.notify({
      message: t("notify.password2"),
      color: "negative",
      icon: "lock",
      position: "top",
      timeout: 2000,
    });
    configPassword.value = ""; // Limpia el campo de contraseña
  }
};

//Muestra el panel de bienvenida del operador
const showOperatorWelcome = () => {
  if (isDowntimeActive.value || localStorage.getItem("MES_AutoDowntimeID")) {
    $q.notify({
      type: "warning",
      message: t("notify.handleOperatorClick"),
      position: "top",
      timeout: 3000,
    });
    return;
  }

  // 🔹 Borrar variable de operadores activos en localStorage
  localStorage.removeItem("MES_ActiveOperators");

  // 🔹 Limpiar la lista de operadores activos en el store
  operatorStore.activeOperators = [];

  rightDrawerContentType.value = "operator-welcome";
  rightDrawerOpen.value = true;
  badgeScanInput.value = ""; // Limpia el input del badge al abrir
  // scannedBadges.value = []; // This is now managed by operatorStore.scannedOperators
};

const showAFLDrawings = () => {
  rightDrawerContentType.value = "drawing";

  rightDrawerOpen.value = !rightDrawerOpen.value;
};

const showAFLHelp = () => {
  if (isDowntimeActive.value || localStorage.getItem("MES_AutoDowntimeID")) {
    $q.notify({
      type: "warning",
      message: t("notify.handleConfigurationClick"),
      position: "top",
      timeout: 3000,
    });
    return; // No dejar continuar
  }
  rightDrawerContentType.value = "helpRequest";

  rightDrawerOpen.value = !rightDrawerOpen.value;
};

const showEpoxy = () => {
  if (isDowntimeActive.value) {
    $q.notify({
      type: "warning",
      message: t("notify.handleepoxyclick"),
      position: "top",
      timeout: 3000,
    });
    return;
  }

  rightDrawerContentType.value = "epoxy";
  // 👇 Alternar en lugar de forzar siempre true
  rightDrawerOpen.value = !rightDrawerOpen.value;
};

//Maneja el escaneo del badge de operador (simulado)
const handleOperatorBadgeScan = async () => {
  const badgeId = badgeScanInput.value.trim();
  if (!badgeId) {
    $q.notify({
      message: t("notify.operator_badge_invalid"),
      color: "negative",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  // Restricción: No permitir más de 2 operadores registrados en scannedOperators
  const registeredOperatorsCount = operatorStore.scannedOperators.filter(
    (op) => op.status === "registered"
  ).length;

  const isAlreadyScanned = operatorStore.scannedOperators.some(
    (op) => op.id === badgeId
  );

  if (!isAlreadyScanned && registeredOperatorsCount >= 2) {
    $q.notify({
      message: t("notify.operator_limit_reached"),
      color: "negative",
      icon: "block",
      position: "top",
      timeout: 3000,
    });
    badgeScanInput.value = "";
    return;
  }

  // Use the store action to scan the operator badge
  const { status, fullName } = await operatorStore.scanOperatorBadge(badgeId);

  if (status === "unregistered") {
    $q.notify({
      message: `${t("notify.badgeid")} "${badgeId}"${t("notify.regmes")} `,
      color: "negative",
      icon: "warning",
      position: "top",
      timeout: 3000,
    });
  } else if (status === "registered") {
    $q.notify({
      message: `${t("notify.badge1")} "${badgeId}" (${fullName}) ${t(
        "notify.scan"
      )}`,
      color: "info",
      icon: "person",
      position: "top",
      timeout: 1000,
    });
  } else if (status === "error") {
    $q.notify({
      message: `${t("notify.errorbadge")} "${badgeId}". ${t(
        "notify.insertnew"
      )}`,
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 3000,
    });
  }

  badgeScanInput.value = ""; // Limpia el input
};

//Confirma el inicio de sesión del operador y cierra el drawer
const confirmOperatorLogin = () => {
  const operatorsToLogin = operatorStore.scannedOperators.filter(
    (op) => op.status === "registered"
  );

  if (operatorsToLogin.length > 0) {
    operatorStore.confirmOperatorsLogin(operatorsToLogin);

    $q.notify({
      message: t("notify.confirm1"),
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });
    hideRightDrawer(); // Cierra el panel
  } else {
    $q.notify({
      message: t("notify.confirm2"),
      color: "negative",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
  }
};

// Muestra el panel de configuración y carga las áreas
const showConfigurationDrawer = async () => {
  rightDrawerContentType.value = "configuration";

  // 👇 Alternar en lugar de forzar siempre true
  rightDrawerOpen.value = !rightDrawerOpen.value;

  // Si la contraseña ya fue ingresada, carga las áreas. Si no, espera a que se ingrese.
  if (passwordEntered.value) {
    await stationStore.fetchAreasFromDb($q);
  }
};

//Maneja la selección de Área
const onAreaSelected = async (areaId) => {
  stationStore.setSelectedArea(areaId);
  stationStore.setSelectedLine(null);
  stationStore.setSelectedStation(null);
  stationStore.lineOptions = [];
  stationStore.stationOptions = [];

  if (areaId) {
    await stationStore.fetchLinesFromDb(areaId, $q);
  }
};

//Maneja la selección de Línea
const onLineSelected = async (lineId) => {
  stationStore.setSelectedLine(lineId);
  stationStore.setSelectedStation(null);
  stationStore.stationOptions = [];

  if (lineId) {
    await stationStore.fetchStationsFromDb(lineId, $q);
  }
};

//Maneja la selección de Estación
// Maneja la selección de Estación
const onStationSelected = async (stationId) => {
  stationStore.setSelectedStation(stationId);

  const selectedStationObj = stationStore.stationOptions.find(
    (s) => s.ID === stationId
  );

  if (!selectedStationObj) {
    $q.notify({
      message: t("notify.selectstation"),
      color: "negative",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  try {
    // 🔴 1. Cerrar downtime automático si existe
    if (localStorage.getItem("MES_AutoDowntimeID")) {
      console.log(t("console.alertcadt"));

      await downtimeStore.closeAutoDowntime();

      localStorage.removeItem("MES_AutoDowntimeStart");
      showAlert.value = false;
    } else {
      await downtimeStore.cancelAutoDowntimeTimer();
    }

    // 🟡 2. Cargar nueva data de estación
    await productionStore.loadProductionData($q, stationStore);
    await cargarDowntimes(true);
    await loadDowntimeEventsFromLS();
    await renderDowntimeChart();

    // 🟢 3. Notificación
    $q.notify({
      message: `${t("notify.station")} ${selectedStationObj.Station} ${t(
        "notify.stationselect"
      )}`,
      color: "positive",
      icon: "check",
      position: "top",
      timeout: 2000,
    });
  } catch (error) {
    console.error(t("console.stationerr"), error);
    $q.notify({
      message: t("notify.errorstation"),
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2000,
    });
  }
};

// Guarda la configuración seleccionada (Estación)
const saveConfiguration = async () => {
  if (stationStore.selectedStation) {
    const selectedStationObj = stationStore.stationOptions.find(
      (s) => s.ID === stationStore.selectedStation
    );
    if (selectedStationObj) {
      const stationNameToSave = selectedStationObj.Station;

      stationStore.isStationConfigured = true;
      localStorage.setItem("MES_IsStationConfigured", true);

      localStorage.setItem(
        "MES_MultipleScanAllowed",
        stationStore.MultipleScanAllowed
      );

      $q.notify({
        message: `${t("notify.stationconfig")} ${stationNameToSave}. ${t(
          "notify.savestation"
        )}`,
        color: "positive",
        icon: "check",
        position: "top",
        timeout: 2000,
      });

      try {
        await productionStore.fetchDowntimeReasons($q);
      } catch (error) {
        console.error(t("console.errordw"), error);
      }

      // Carga los datos de producciondespues de configurar la estacion
      await hideRightDrawer();
      await productionStore.loadProductionData($q, stationStore);
      await cargarDowntimes(true);
      await loadDowntimeEventsFromLS();
      await renderDowntimeChart();
    }
  } else {
    $q.notify({
      message: t("notify.selectstation"),
      color: "negative",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
  }
};

// Abre el panel lateral derecho para detalles de downtime
const showDowntimeDetails = () => {
  currentPage.value = 1;
  rightDrawerContentType.value = "downtime";

  // 👇 Alternar en lugar de forzar siempre true
  rightDrawerOpen.value = !rightDrawerOpen.value;
};

/**
 * Maneja apertura del drawer de retrabajo,
 * ya sea para crear uno nuevo (status 1)
 * o para gestionar existentes (status 3).
 */
const handleRework = (row) => {
  selectedRow.value = row;
  nextAction.value = "rework";

  // Caso 1: status 1 → siempre abrir "Marcar como retrabajo"
  if (row.status === 1) {
    if (!ensureConnectorsDefined()) return; // validación conectores
    rightDrawerContentType.value = "rework"; // formulario nuevo retrabajo
    rightDrawerOpen.value = true;
    return;
  }

  // Caso 2: status 3 → abrir gestión
  if (row.status === 3) {
    rightDrawerContentType.value = "rework-management";
    rightDrawerOpen.value = true;
    openReworkManagement(row);
    return;
  }
};

// función para abrir el panel de gestión de retrabajo (para elementos ya en estado 'Retrabajo')
const openMarkRework = (row) => {
  selectedRow.value = row;
  nextAction.value = "rework";
  // reset razonamientos
  reworkReasons.value.forEach((r) => {
    r.showPuntasExpansion = false;
    r.selectedPuntasA = [];
    r.selectedPuntasB = [];
    r.puntasConfirmed = false;
    r.isFixed = false;
  });

  // si está en status 1 y necesitas validar conectores antes de marcar:
  if (row.status === 1 && !ensureConnectorsDefined()) return;

  rightDrawerContentType.value = "rework"; // vista de "Marcar como retrabajo"
  rightDrawerOpen.value = !rightDrawerOpen.value;

  $q.notify({
    message: `${t("notify.marcrw")} "${row.jobId}".`,
    color: "warning",
    icon: "build_circle",
    position: "top",
    timeout: 1200,
  });
};

const openReworkManagement = async (row) => {
  selectedRow.value = row;

  // limpia flags previos en UI local si aplican
  reworkReasons.value.forEach((r) => {
    r.showPuntasExpansion = false;
    r.selectedPuntasA = [];
    r.selectedPuntasB = [];
    r.puntasConfirmed = false;
    r.isFixed = false;
  });

  try {
    // carga desde API; preferir JobNumberId si viene del SP
    await reworkStore.loadReworkEntries({
      jobNumberId: row.jobNumberId ?? null,
      prodPartId: row.id ?? null, // fallback
    });
  } catch (err) {
    $q.notify({
      message: `${t("notify.noloadrw")} "${row.jobId}".`,
      caption: err?.message || t("notify.noloadrw2"),
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2500,
    });
    return;
  }

  rightDrawerContentType.value = "rework-management"; // vista de "Gestionar"
  rightDrawerOpen.value = !rightDrawerOpen.value;
  reworkPage.value = 1;

  $q.notify({
    message: `${t("notify.manrw")} "${row.jobId}".`,
    color: "info",
    icon: "manage_search",
    position: "top",
    timeout: 1200,
  });
};

// Cierra el panel lateral derecho
const hideRightDrawer = async () => {
  rightDrawerOpen.value = false;

  showKeyboard.value = false;

  confirmingId.value = null;

  if (rightDrawerContentType.value === "reworkManagement") {
    await productionStore.loadProductionData();
  } else if (rightDrawerContentType.value === "downtime") {
    await cargarDowntimes(true);
    await loadDowntimeEventsFromLS();
  } else if (rightDrawerContentType.value === "configuration") {
    // ⭐️ NUEVO BLOQUE: Ejecutar fetchDowntimeReasons solo al cerrar la configuración
    try {
      await productionStore.fetchDowntimeReasons($q);
      console.log(t("console.reloadw"));
    } catch (error) {
      console.error(t("console.errorreload"), error);
    }
  }
};

// handler para obtener el dibujo seleccionado
const onDrawingRowClick = (_evt, row) => {
  const drawing = row.AFL_Drawing_NUMBER; // e.g. "907-2707_0"
  const prefix = drawing.split("-")[0]; // toma "907" antes del primer "-"

  const url = `http://intranet.naa.fujikurausa.com/OFS_Photonics/Manufacturing/Documents/doc_draw/${prefix}/${drawing}.pdf`;

  console.log(t("console.openurl"), url);
  window.open(url, "_blank");
};

// este wrapper toma el dibujo escrito
const handleSearch = () => {
  const val = drawingSearch.value.trim();
  if (!val) return;

  // recortamos jobNumber antes del guión, igual que antes
  const jobId = val.split("-")[0];

  // disparamos tu lógica tal cual con ese jobId y AFL_Drawing_NUMBER arbitrario
  onDrawingRowClick(null, { jobId, AFL_Drawing_NUMBER: val });

  // limpiamos el input
  drawingSearch.value = "";
};

//Funcion para procesar el codigo del epoxy
const handleEpoxyQR = async () => {
  const dataParts = epoxyQR.value.split(",");
  if (dataParts.length < 4) {
    $q.notify({
      message: t("notify.epoxy_format_invalid"),
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2500,
    });
    epoxyQR.value = "";
    return;
  }

  const payload = {
    lotA: dataParts[0],
    lotB: dataParts[1],
    serialEpoxyNo: dataParts[2],
    expirationDate: dataParts[3],
    stationId: localStorage.getItem("MES_SelectedStation"),
  };

  const {
    success,
    message,
    newEpoxyId: id,
  } = await productionStore.registerEpoxyData(payload);

  if (success) {
    newEpoxyId.value = id;
    localStorage.setItem("EpoxyTimerStart", dayjs().toISOString());
    epoxyTimerStart.value = dayjs(); // actualiza variable reactiva
    updateEpoxyTimer(); // reinicia el timer
    // Guardar en localStorage SOLO si fue exitoso
    localStorage.setItem("EpoxylotA", payload.lotA);
    localStorage.setItem("EpoxylotB", payload.lotB);
    localStorage.setItem("serialEpoxyNo", payload.serialEpoxyNo);
    localStorage.setItem("EpoxyexpirationDate", payload.expirationDate);
    localStorage.setItem("MES_EpoxyId", id.toString());

    loadEpoxyFromStorage();

    $q.notify({
      message: message || t("notify.regepoxy"),
      color: "positive",
      icon: "check_circle",
      position: "top",
      timeout: 2000,
    });
  } else {
    $q.notify({
      message: message || t("notify.errorregepoxy"),
      color: "negative",
      icon: "error",
      position: "top",
      timeout: 2500,
    });
  }

  epoxyQR.value = "";
};

// Resetea el contenido del drawer derecho cuando se cierra
const resetRightDrawerContent = () => {
  rightDrawerContentType.value = null;
  selectedRow.value = null;
  selectedReworkReason.value = null;
  badgeScanInput.value = "";
  operatorStore.scannedOperators = [];
  terminalTab.value = "terminalA";

  productionStore.productionRows.forEach((row) => {
    if (row.defects) {
      row.defects.forEach((defect) => {
        defect.showPuntasExpansion = false;
      });
    }
  });

  // Resetea el estado de la contraseña al cerrar el drawer
  configPassword.value = "";
  passwordEntered.value = false;
};

// Toggle para mostrar/ocultar las opciones de justificación de un evento
const toggleJustifyOptions = (targetEvent) => {
  // Cierra todos menos el clicado
  downtimeEvents.value.forEach((e) => {
    if (e !== targetEvent) e.showJustifyOptions = false;
  });

  // Alterna el clicado
  targetEvent.showJustifyOptions = !targetEvent.showJustifyOptions;
};

// Función para justificar un evento de downtime
const justifyDowntime = (index, reason, reasonID) => {
  // 🔍 LOG DE ENTRADA
  console.log("--- Debug justifyDowntime ---");
  console.log("Índice recibido:", index);
  console.log("Razón recibida:", reason);
  console.log("RazónID recibida:", reasonID);
  console.log("Evento en esa posición:", downtimeEvents.value[index]);

  if (downtimeEvents.value[index]) {
    // Obtenemos los IDs activos desde localStorage directamente
    const activeIdsString = localStorage.getItem("Active_id") || "";

    // 🔍 LOG DE CONTEXTO
    console.log("Active_id desde localStorage:", activeIdsString);

    if (!activeIdsString) {
      console.warn("⚠️ No se encontró Active_id en localStorage");
      $q.notify({
        type: "negative",
        message: t("notify.nojobdowntime"),
        position: "top",
      });
      return;
    }

    // Mandamos el string tal cual
    console.log("🚀 Llamando a productionStore.startDowntime...");
    productionStore.startDowntime(reason, activeIdsString);

    downtimeEvents.value[index].justifiedBy = reason;
    downtimeEvents.value[index].showJustifyOptions = false;

    currentDowntimeReason.value = reason;
    isDowntimeActive.value = true;

    $q.notify({
      message: `${t("notify.justdowntime")}  ${reason}.`,
      color: "info",
      icon: "check",
      position: "top",
      timeout: 2000,
    });
  } else {
    // 🔍 LOG DE ERROR DE ÍNDICE
    console.error(
      `❌ Error: No existe un evento de downtime en el índice [${index}]`
    );
  }
};

// Asigna color de chip según el estado
const getStatusColor = (status) => {
  switch (status) {
    case 2: // Completado
      return "green-6";
    case 3: // Retrabajo
      return "orange-6";
    case 1: // Pendiente
      return "light-blue-6";
    case 5: // Pendiente
      return "light-blue-6";
    case 4: //pausa
      return "yellow-7";
    default:
      return "grey-6";
  }
};

const getSnStatusColor = (status) => {
  // Reglas de color solicitadas
  if (status === "Resuelto") return "green";
  if (status === "Pendiente") return "grey-6";
  if (status === "Nuevo") return "blue";
  if (status === "pausa") return "yellow-7";
  // Por defecto, usa naranja para En Curso/Desconocido
  return "orange";
};

// Asigna la clase para el fondo del contenedor del icono de estado
const getStatusContainerClass = (status) => {
  switch (status) {
    case 2: // Completado
      return "completado";
    case 3: // Retrabajo
      return "retrabajo";
    case 1: // Pendiente
      return "pendiente";
    case 4: //pausa
      return "pausa";
    default:
      return "default";
  }
};

// Asigna icono de chip según el estado
const getStatusIcon = (status) => {
  switch (status) {
    case 2: // Completado
      return "check_circle";
    case 3: // Retrabajo
      return "error";
    case 1: // Pendiente
      return "hourglass_empty";
    case 5: //Retrabajado
      return "plumbing";
    case 4: //pause
      return "pause_circle";
    default:
      return "help";
  }
};

const isProcessing = ref(false);

// Maneja el evento de escaneo/entrada del JobID
const onEnter = async () => {
  if (isProcessing.value) return; // ⛔ Ignora si ya se está procesando
  isProcessing.value = true;
  try {
    const jobID = scanInput.value.trim();

    // Validar si el JobSerial concuerda con el formato esperado
    if (!jobSerialRegex.test(jobID)) {
      scanInput.value = "";
      $q.notify({
        type: "negative",
        message: t("notify.job_scan_error"),
        position: "top",
        timeout: 2000,
      });
      return;
    }

    // Validar si la estación está configurada
    if (!stationStore.isStationConfigured) {
      $q.notify({
        message: t("notify.confstation"),
        color: "negative",
        icon: "settings",
        position: "top",
        timeout: 3000,
      });
      scanInput.value = "";
      return;
    }

    // Validar si hay operadores logueados
    if (!operatorStore.isLoggedIn) {
      $q.notify({
        message: t("notify.regoperator"),
        color: "negative",
        icon: "person",
        position: "top",
        timeout: 3000,
      });
      scanInput.value = "";
      return;
    }

    // Valida si existe un Epoxy vivo
    if (showEpoxyBtn.value && timerSecondsLeft.value <= 0) {
      $q.notify({
        type: "negative",
        message: t("notify.resepoxy2"),
        position: "top",
        timeout: 2500,
      });
      scanInput.value = "";
      showEpoxy();
      return;
    }

    // Lógica para MultipleScan
    if (!stationStore.MultipleScanAllowed && productionStore.hasPendingScans) {
      $q.notify({
        message: t("notify.scan_multiple_not_allowe"),
        color: "negative",
        icon: "block",
        position: "top",
        timeout: 5000,
      });
      scanInput.value = "";
      return;
    }

    //Verifica operadores activos
    if (
      !operatorStore ||
      !operatorStore.activeOperators ||
      !Array.isArray(operatorStore.activeOperators)
    ) {
      $q.notify({
        message: t("notify.error_active_operators"),
        color: "negative",
        icon: "error",
        position: "top",
        timeout: 5000,
      });
      scanInput.value = "";
      return;
    }

    //Logica para seriales ya procesados (Local y SQL)
    const wasHandled = await handleScanNewCable(jobID);

    if (wasHandled) {
      scanInput.value = "";
      await productionStore.loadProductionData();

      return;
    }

    const operatorId1 = operatorStore.activeOperators[0]?.employeeId || null;
    const operatorId2 = operatorStore.activeOperators[1]?.employeeId || null;

    const now = dayjs();
    const regDate = now.format("YYYY-MM-DD HH:mm:ss");

    const lineCodeId = stationStore.selectedLine;
    const stationId = stationStore.selectedStation;
    const status = 1;
    const stored = localStorage.getItem("MES_EpoxyId");
    const epoxyId = stored !== null ? Number(stored) : null;

    const recordData = {
      LineCodeId: lineCodeId,
      JobNumber: jobID,
      PackBarCode: null,
      StationId: stationId,
      OperatorId1: operatorId1,
      OperatorId2: operatorId2,
      Status: status,
      RegDate: regDate,
      EpoxyId: epoxyId,
    };

    // Llama a la acción del productionStore para añadir el registro
    const { success } = await productionStore.addProductionRecord(
      recordData,
      $q,
      {
        lineId: lineCodeId,
        stationId: stationId,
      }
    );

    // Si el insert fue exitoso, recarga el historial y limpia el input
    if (success) {
      scanInput.value = "";
      // *Ya no es necesario agregar registro local, fetchRecentProductionHistory lo hace*
      if (localStorage.getItem("MES_AutoDowntimeID")) {
        // Existe un downtime activo → cerrarlo y refrescar datos
        await downtimeStore.closeAutoDowntime();
        await cargarDowntimes(true);
        await loadDowntimeEventsFromLS();
        await renderDowntimeChart();
        showAlert.value = false;
        localStorage.removeItem("MES_AutoDowntimeStart");
      } else {
        // No hay downtime activo → cancelar temporizador
        await downtimeStore.cancelAutoDowntimeTimer();
      }
    }

    scanInput.value = "";
  } finally {
    isProcessing.value = false; // 🔓 Libera bloqueo al terminar
  }
};

const handleScanNewCable = async (jobID) => {
  if (!jobID) return;

  // 1) Revisar en memoria
  const existingLocal = productionStore.productionRows.find(
    (r) => r.jobId === jobID
  );
  if (existingLocal) {
    // 2) Si existe, delegar en el helper
    await handleExistingRow(existingLocal);
    return true;
  }

  // 3) Si no está en memoria, preguntar al backend
  //const serverRecord = await productionStore.checkJobInServer(jobID);

  //if (serverRecord) {
  //await handleExistingRow(serverRecord);
  //return true;
  //}

  return false;
};

const handleExistingRow = (row) => {
  if (row.productionOrder === true) {
    $q.notify({
      message: `${t("notify.jobid1")}  "${row.JobNumber}" ${t(
        "notify.jobid2"
      )}`,
      color: "warning",
      icon: "warning",
      position: "top",
      timeout: 2500,
    });
    return;
  }

  // 2) Comportamiento existente
  if (row.status === 1) {
    $q.notify({
      message: `${t("notify.jobid1")} "${row.jobId}" ${t("notify.jobid3")}`,
      color: "warning",
      icon: "info",
      position: "top",
      timeout: 2500,
    });
  } else if (row.status === 3) {
    openReworkManagement(row);
  } else if (row.status === 2) {
    $q.notify({
      message: `${t("notify.jobid1")} "${row.jobId}" ${t("notify.jobid4")}`,
      color: "info",
      icon: "info",
      position: "top",
      timeout: 2500,
    });
  }
};

// Muestra el diálogo para completar un elemento
const showCompleteDialog = (row) => {
  if (row.hasDefects) {
    // Ir directo a gestionar retrabajos
    selectedRow.value = row; // por si tu drawer usa selectedRow
    // (opcional) si quieres volver a completar al terminar rework:
    // nextAction.value = "complete";
    openReworkManagement(row);

    // (opcional) feedback visual
    // $q.notify({ message: 'Este elemento tiene retrabajos abiertos. Gestiona antes de completar.', color: 'warning', icon: 'build_circle', position: 'top' });
    return;
  }

  // Sin defectos → flujo normal de completar
  selectedRow.value = row;
  completeConfirmDialog.value = true;
};

// Muestra el diálogo para completar un elemento
const showpauseDialog = (row) => {
  selectedRow.value = row;
  pauseDialog.value = true;
};

const confirmpause = async () => {
  if (selectedRow.value) {
    const { success } = await productionStore.PauseConfirm(
      selectedRow.value.id
    );

    if (success) {
      connectorCountA.value = null;
      connectorCountB.value = null;
      selectedRow.value = null;

      if (
        !localStorage.getItem("MES_AutoDowntimeID") &&
        !localStorage.getItem("Active_id")
      ) {
        downtimeStore.startAutoDowntimeTimer();
      }
    }

    pauseDialog.value = false;
  }
};

// Confirma y completa el elemento seleccionado
const confirmComplete = async () => {
  nextAction.value = "complete";

  // 1. Validar que ambos terminales tengan datos
  if (!ensureConnectorsDefined()) {
    completeConfirmDialog.value = false;

    return;
  }

  if (rightDrawerOpen.value) {
    await Promise.resolve(hideRightDrawer());
    await nextTick();
  }

  if (selectedRow.value) {
    // 2. ENVIAR LOS VALORES A Y B AL STORE
    const { success } = await productionStore.updateProductionRecordStatus(
      selectedRow.value.id,
      connectorCountA.value,
      connectorCountB.value
    );

    if (success) {
      connectorCountA.value = null;
      connectorCountB.value = null;
      selectedRow.value = null;

      if (
        !localStorage.getItem("MES_AutoDowntimeID") &&
        !localStorage.getItem("Active_id")
      ) {
        downtimeStore.startAutoDowntimeTimer();
      }
    }
  }

  completeConfirmDialog.value = false;
};

// Función para seleccionar un motivo de retrabajo
const selectReworkReason = (reasonValue) => {
  selectedReworkReason.value = reasonValue;

  // Cierra todas las expansiones de puntas de otros motivos
  reworkReasons.value.forEach((reason) => {
    if (reason.value !== reasonValue) {
      reason.showPuntasExpansion = false;
    }
  });

  // Alterna la expansión del motivo actual
  const targetReason = reworkReasons.value.find((r) => r.value === reasonValue);
  if (targetReason) {
    targetReason.showPuntasExpansion = !targetReason.showPuntasExpansion;
  }

  // Asegura que la pestaña de terminales A esté seleccionada al abrir
  if (targetReason && targetReason.showPuntasExpansion) {
    terminalTab.value = "terminalA";
  }
};

// Computed property para determinar si el botón de Confirmar Retrabajo debe estar deshabilitado
const isReworkConfirmButtonEnabled = computed(() => {
  // Habilitado si al menos un motivo predefinido tiene puntas confirmadas
  const anyPuntasConfirmed = reworkReasons.value.some(
    (reason) =>
      reason.puntasConfirmed &&
      (reason.selectedPuntasA.length > 0 || reason.selectedPuntasB.length > 0)
  );

  return anyPuntasConfirmed;
});

// Función para confirmar y marcar el elemento como retrabajo (se llama al final del proceso)
const confirmAllReworks = async () => {
  // 1) Verifica que haya fila
  if (!selectedRow.value) {
    return $q.notify({
      message: t("notify.confirmall"),
      color: "negative",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
  }
  nextAction.value = "rework";
  if (!ensureConnectorsDefined()) {
    return;
  }

  // 2) Arma la lista de defectos con sus puntas seleccionadas
  const defectsToApply = [];
  let hasValidReworkReason = false;

  reworkReasons.value.forEach((reason) => {
    if (
      reason.puntasConfirmed &&
      (reason.selectedPuntasA.length > 0 || reason.selectedPuntasB.length > 0)
    ) {
      defectsToApply.push({
        id: reason.value,
        type: reason.label,
        selectedPuntasA: [...reason.selectedPuntasA],
        selectedPuntasB: [...reason.selectedPuntasB],
        isConfirmed: true,
        isFixed: false,
      });
      hasValidReworkReason = true;
    }
  });

  if (!hasValidReworkReason) {
    return $q.notify({
      message: t("notify.confirmall2"),
      color: "negative",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
  }

  // 3) Marca retrabajo en backend
  const payload = {
    prodPartId: selectedRow.value.id,
    MES_SelectedStation: parseInt(localStorage.getItem("MES_SelectedStation")),
    entries: defectsToApply.flatMap((def) => [
      // una fila por cada punta A
      ...def.selectedPuntasA.map((n) => ({
        defectId: def.id,
        terminalNumber: n,
        terminalSide: "A",
      })),
      // una fila por cada punta B
      ...def.selectedPuntasB.map((n) => ({
        defectId: def.id,
        terminalNumber: n,
        terminalSide: "B",
      })),
    ]),
  };

  const { success, message } = await reworkStore.createReworkEntries(payload);

  await productionStore.loadProductionData();
  if (!success) {
    return $q.notify({
      message: message || t("notify.errorrw"),
      color: "negative",
      position: "top",
    });
  }

  // 4) Sustituye temporalmente los defectos de la fila (para el cálculo)
  selectedRow.value.defects = defectsToApply;

  // 👇 Arrancar conteo de downtime automático solo si no existen ambos: MES_AutoDowntimeID y Active_id
  if (
    !localStorage.getItem("MES_AutoDowntimeID") &&
    !localStorage.getItem("Active_id")
  ) {
    downtimeStore.startAutoDowntimeTimer();
  }

  connectorCountA.value = null;
  connectorCountB.value = null;
  selectedRow.value = null;

  hideRightDrawer();
};

// Muestra el diálogo de detalles del elemento
const showDetails = (row) => {
  selectedRow.value = row;
  detailsTab.value = "general"; // Establece la pestaña por defecto a "Información General"
  detailsDialog.value = true;
};

// Lógica para el toggle de detalles de defecto (Puntas) para los motivos de retrabajo
const toggleReworkReasonPuntas = (reasonValue) => {
  const targetReason = reworkReasons.value.find((r) => r.value === reasonValue);
  if (!targetReason) return;

  // Selecciona este motivo
  selectedReworkReason.value = reasonValue;

  // Cierra cualquier otra expansión de puntas abierta
  reworkReasons.value.forEach((reason) => {
    if (reason.value !== reasonValue) {
      reason.showPuntasExpansion = false;
    }
  });

  // Alterna la expansión del motivo actual
  targetReason.showPuntasExpansion = !targetReason.showPuntasExpansion;

  // Asegura que la pestaña de terminales A esté seleccionada al abrir
  if (targetReason.showPuntasExpansion) {
    terminalTab.value = "terminalA";
  }
};

// Lógica para seleccionar/deseleccionar terminales para un motivo de retrabajo específico
const toggleTerminalSelectionForReason = (
  reasonValue,
  terminalType,
  number
) => {
  const targetReason = reworkReasons.value.find((r) => r.value === reasonValue);
  if (!targetReason) return;

  const targetArray =
    terminalType === "A"
      ? targetReason.selectedPuntasA
      : targetReason.selectedPuntasB;
  const index = targetArray.indexOf(number);

  if (index > -1) {
    targetArray.splice(index, 1); // Deseleccionar
  } else {
    targetArray.push(number); // Seleccionar
  }

  // Si todas las puntas se deseleccionan, restablece puntasConfirmed para este motivo
  if (
    targetReason.selectedPuntasA.length === 0 &&
    targetReason.selectedPuntasB.length === 0
  ) {
    targetReason.puntasConfirmed = false;
    console.log(
      `${t("console.selectreason1")} ${reasonValue}. ` +
        `${t("console.selectreason2")} ${targetReason.puntasConfirmed}`
    );
    // Debugging
  }
};

// Lógica para confirmar las puntas seleccionadas para un motivo de retrabajo específico
const confirmReworkReasonPuntas = (reasonValue) => {
  const targetReason = reworkReasons.value.find((r) => r.value === reasonValue);
  if (!targetReason) return;

  if (
    targetReason.selectedPuntasA.length === 0 &&
    targetReason.selectedPuntasB.length === 0
  ) {
    $q.notify({
      message: `${t("notify.confirmrw")}  "${targetReason.label}".`,
      color: "negative",
      icon: "warning",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  const selectedA = targetReason.selectedPuntasA
    .sort((a, b) => a - b)
    .join(", ");
  const selectedB = targetReason.selectedPuntasB
    .sort((a, b) => a - b)
    .join(", ");

  let message = `Puntas confirmadas para "${targetReason.label}": `;
  if (selectedA) {
    message += `Terminales A: [${selectedA}]`;
  }
  if (selectedB) {
    if (selectedA) message += "; ";
    message += `Terminales B: [${selectedB}]`;
  }

  $q.notify({
    message: message,
    color: "green",
    icon: "check_circle",
    position: "top",
    timeout: 2000,
  });

  // Marca las puntas como confirmadas para este motivo
  targetReason.puntasConfirmed = true;

  // Cierra la expansión de las puntas después de confirmar
  targetReason.showPuntasExpansion = false;
};

//función para limpiar las puntas confirmadas de un motivo de retrabajo
const clearReworkReasonPuntas = (reasonValue) => {
  const targetReason = reworkReasons.value.find((r) => r.value === reasonValue);
  if (!targetReason) return;

  targetReason.selectedPuntasA = [];
  targetReason.selectedPuntasB = [];
  targetReason.puntasConfirmed = false;
  targetReason.showPuntasExpansion = false;

  $q.notify({
    message: `${t("notify.cleanconnect")}  "${targetReason.label}".`,
    color: "info",
    icon: "info",
    position: "top",
    timeout: 1500,
  });
};

// computed property to enable/disable "Confirmar Reparación" button in rework-management
const hasAnyDefectFixed = computed(() => {
  return selectedRow.value?.defects?.some((defect) => defect.isFixed) || false;
});

// function for toggling defect puntas edit in rework-management
const toggleDefectPuntasEdit = (defect) => {
  // Close any other open defect puntas expansions
  selectedRow.value.defects.forEach((d) => {
    if (d !== defect) {
      d.showPuntasExpansion = false;
    }
  });
  defect.showPuntasExpansion = !defect.showPuntasExpansion;

  if (defect.showPuntasExpansion) {
    terminalTab.value = "terminalA";
  }
};

//ConfirmReworks
const confirmReworkEntry = async (entry) => {
  try {
    const id = entry.id ?? entry.Id;

    await reworkStore.setReworkEntryStatus({
      id,
      MES_SelectedStation: parseInt(
        localStorage.getItem("MES_SelectedStation")
      ),
    });

    // Eliminar de la lista
    reworkStore.reworkEntries = reworkStore.reworkEntries.filter(
      (e) => (e.id ?? e.Id) !== id
    );

    await productionStore.loadProductionData();

    Notify.create({
      message: t("notify.rwcreate"),
      color: "positive",
      icon: "done_all",
      position: "top",
      timeout: 1500,
    });
  } catch (err) {
    console.error(t("console.errorrw"), err);
    Notify.create({
      message: t("notify.rwhide"),
      caption: err?.response?.data?.message || err.message,
      color: "negative",
      icon: "error",
      position: "top",
    });
  }
};

//Funcion para alerta de Inactividad de la estacion
const getStationOptions = async () => {
  console.log(t("console.getstation"));
  try {
    const data = await reportStore.StationOptions();
    stationData.value = data;
    console.log(t("console.component"), stationData.value);

    // 🔹 Validar si la estación actual existe en los resultados
    const currentStationName = stationStore.getStationName;
    if (currentStationName) {
      const found = stationData.value.find(
        (item) => item.value === currentStationName
      );
      if (found) {
        console.log(t("console.stationlook"), found);
        localStorage.setItem("currentStation", JSON.stringify(found));

        // 🔹 Leer y asignar currentStation si existe
        const storedStation = localStorage.getItem("currentStation");
        if (storedStation) {
          currentStation.value = JSON.parse(storedStation);
          console.log(t("console.currentstation"), currentStation.value);
        }
      } else {
        console.log(t("console.stationoptions"));
        currentStation.value = null;
        localStorage.removeItem("currentStation");
      }
    }
  } catch (err) {
    console.error(t("console.errorcomponent"), err);
  }
};

const handleStorageChange = (event) => {
  // Verifica si la clave cambiada es 'lang'
  if (event.key === "lang") {
    console.log(`${t("console.idiomadetect")} ` + event.newValue);

    // ⭐️ Ejecutar la acción del store
    try {
      productionStore.fetchDowntimeReasons($q);
    } catch (error) {
      console.error(t("console.erroridioma"), error);
    }
  }
};
// 🕒 Intervalo automático
let stationInterval = null;
let cleanUpInterval = null;
let SNOWTIME = null;

const renderScannerStatusChart = () => {
  if (!scannerStatusChartContainer.value) return;

  // Si ya existe, la destruimos
  if (scannerStatusChartInstance) {
    scannerStatusChartInstance.destroy();
    scannerStatusChartInstance = null;
  }

  // Creamos el chart
  scannerStatusChartInstance = Highcharts.chart(
    scannerStatusChartOptions.value
  );
};

// ░░ Componentes ░░
onMounted(async () => {
  console.log(t("console.componentmount"));
  console.log(
    "¿fetchDowntimeReasons existe?",
    typeof productionStore.fetchDowntimeReasons
  );

  //  Verificar que el store esté completamente inicializado antes de usarlo
  let retries = 0;
  while (
    (!productionStore.fetchDowntimeReasons ||
      typeof productionStore.fetchDowntimeReasons !== "function") &&
    retries < 10
  ) {
    console.warn(`${t("console.waitprodstore")} ${retries + 1}`);
    await new Promise((resolve) => setTimeout(resolve, 200)); // espera 200ms
    retries++;
  }

  if (!productionStore.fetchDowntimeReasons) {
    console.error(t("console.errorfetchdw1"));
    return;
  }

  if (unjustifiedCount.value > 0) {
    alertDowntime.value = true;
  }

  try {
    //extraer datos de manejo de Downtimes
    await productionStore.fetchDowntimeReasons($q);
  } catch (error) {
    console.error(t("console.errorfetchdw2"), error);
  }

  try {
    // Esta acción ahora carga y revalida todo lo relacionado con la estación y MultipleScanAllowed
    await stationStore.initializeStationState($q);
  } catch (error) {
    console.error(t("console.errorinitial"), error);
  }

  loadEpoxyFromStorage();

  try {
    // Carga los datos de producción iniciales
    await productionStore.loadProductionData($q, stationStore);
  } catch (error) {
    console.error(t("console.errorload"), error);
  }

  // 🔹 Pequeño delay para dar tiempo a actualizaciones internas antes del setTimeout
  await new Promise((resolve) => setTimeout(resolve, 50));

  setTimeout(() => {
    if (productionStore.currentShift) {
      localStorage.setItem("MES_CurrentShift", productionStore.currentShift);
      console.log(t("console.saveshift"), productionStore.currentShift);
    } else {
      console.warn(t("console.shiftlate"));
    }
  }, 100);

  await cargarDowntimes(true);
  await loadDowntimeEventsFromLS();
  await renderDowntimeChart();

  // Inicializa la hora actual y actualízala cada segundo
  timeInterval = setInterval(() => {
    const nowMX = dayjs().tz("America/Mexico_City");
    currentTime.value = nowMX.format("hh:mm:ss A");
    currentDate.value = nowMX.format("DD-MM-YYYY");
    updateScannerStatusChart();
  }, 1000);

  // Inicializa la hora actual y actualízala cada segundo para POLONIA
  polandInterval = setInterval(() => {
    const nowPoland = dayjs().tz("Europe/Warsaw");
    currentTimePoland.value = nowPoland.format("hh:mm:ss A");
    currentDatePoland.value = nowPoland.format("DD-MM-YYYY");
  }, 1000);

  if (kpiChartContainer.value) {
    kpiChartInstance = Highcharts.chart(
      kpiChartContainer.value,
      kpiChartOptions.value
    );
  }

  if (scannerStatusChartContainer.value && !scannerStatusChartInstance) {
    scannerStatusChartInstance = Highcharts.chart(
      scannerStatusChartOptions.value
    );
  }

  const stored = localStorage.getItem("isDowntimeActive");
  isDowntimeActive.value = stored === "true";

  console.log(t("console.verifydw"));

  if (!localStorage.getItem("MES_AutoDowntimeID")) {
    const triggerAt = localStorage.getItem("MES_AutoDowntimeTriggerAt");

    if (triggerAt) {
      const triggerTime = parseInt(triggerAt, 10);
      const now = Date.now();
      const remaining = Math.floor((triggerTime - now) / 1000);

      if (remaining <= 0) {
        console.log(t("console.timeexpired"));
        downtimeStore.startAutoDowntimeTimer();
      } else {
        console.log(
          `${t("console.restartcount1")} ${remaining} ${t(
            "console.restartcount2"
          )}`
        );
        downtimeStore.resumeAutoDowntimeCountdown(remaining);
      }
    }
  } else {
    console.log(t("console.activedw"));
  }

  localStorage.removeItem("currentStation");
  console.log(t("console.deletelocalst"));

  await getStationOptions();

  await productionStore.loadHelpRequest();

  await productionStore.loadHelpRequest();

  handleFetchStatus();
  loadPrinterConfig();

  const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;
  cleanUpInterval = setInterval(cleanUpResolvedIncidents, THIRTY_MINUTES_IN_MS);
  SNOWTIME = setInterval(handleFetchStatus, THIRTY_MINUTES_IN_MS);

  // 🔹 Repetir cada 30 minutos
  stationInterval = setInterval(getStationOptions, 1800000);

  // ⭐️ Agregar el oyente de eventos de storage
  window.addEventListener("storage", handleStorageChange);
});

onUnmounted(() => {
  console.log(t("console.unmount"));
  if (stationInterval) clearInterval(stationInterval);

  if (cleanUpInterval) {
    clearInterval(cleanUpInterval);
  }

  // ⭐️ Limpiar el oyente cuando el componente se destruye
  window.removeEventListener("storage", handleStorageChange);
});

onBeforeUnmount(() => {
  // Limpia los intervalos de la hora y la animación para evitar fugas de memoria
  if (timeInterval) {
    clearInterval(timeInterval);
  }

  // Limpia el intervalo de la hora en Polonia
  if (polandInterval) {
    clearInterval(polandInterval);
  }

  stopBorderAnimation(); // Detiene la animación del borde si está activa

  // Destruye las instancias de los gráficos Highcharts para evitar fugas de memoria
  if (kpiChartInstance) {
    kpiChartInstance.destroy();
    kpiChartInstance = null;
  }
  if (scannerStatusChartInstance) {
    scannerStatusChartInstance.destroy();
    scannerStatusChartInstance = null;
  }
});

// 🔹 Watch para stationStore.getStationName
watch(
  () => stationStore.getStationName,
  async (newVal, oldVal) => {
    if (newVal) {
      // Limpiar currentStation antes de actualizar
      localStorage.removeItem("currentStation");
      console.log(t("console.watchstore"));

      // Cargar opciones y guardar estación
      await getStationOptions();
    }
  },
  { immediate: true } // Para que se ejecute también al montar el componente
);

// Watcher para actualizar los KPIs cuando productionRows cambie (ahora es del store)
// Ya no es necesario un watcher aquí porque los KPIs son computados del store
// y se actualizan automáticamente.

//  Watcher para cargar líneas cuando se selecciona un área
watch(
  () => stationStore.selectedArea,
  async (newAreaId) => {
    if (newAreaId) {
      await stationStore.fetchLinesFromDb(newAreaId, $q);
    } else {
      stationStore.lineOptions = [];
      stationStore.stationOptions = [];
      stationStore.setSelectedLine(null);
      stationStore.setSelectedStation(null);
    }
  }
);

//Watcher para identificar el ID del trabajo activo.

watch(
  () => productionStore.productionRows,
  (newRows) => {
    const activeRows = newRows.filter((row) => row.status === 1);
    const activeIdsArray = activeRows.map((row) => row.id);

    if (activeIdsArray.length > 0) {
      localStorage.setItem("Active_id", activeIdsArray.join(",")); // ejemplo: "1,2,3"
      activeIds.value = activeIdsArray;
    } else {
      localStorage.removeItem("Active_id");
      activeIds.value = [];
    }
  },
  { deep: true, immediate: true }
);

// Watcher para cargar estaciones cuando se selecciona una línea
watch(
  () => stationStore.selectedLine,
  async (newLineId) => {
    if (newLineId) {
      await stationStore.fetchStationsFromDb(newLineId, $q);
    } else {
      stationStore.stationOptions = [];
      stationStore.setSelectedStation(null);
    }
  }
);

watch(locale, () => {
  renderScannerStatusChart();
});

// Ajuste para seleccion de idioma en los defectos de Rework
const getDefectLabel = (reason) => {
  const lang = locale.value;
  if (lang === "en") return reason.Defect_EN || reason.Defecto;
  if (lang === "es") return reason.Defect_ES || reason.Defecto;
  return reason.Defecto; // Por defecto español
};

/**
 * Watch modificado: solo carga y estructura los datos.
 */
watch(
  () => rightDrawerContentType.value,
  async (type) => {
    if (type === "rework") {
      // 1. Limpiamos para dar feedback visual de carga
      reworkReasons.value = [];

      // 2. Cargamos los defectos del store
      await reworkStore.loadDefects();

      // 3. Mapeamos los datos base
      // Guardamos el objeto original (...d) para que getDefectLabel
      // tenga acceso a Defect_EN y Defect_PL
      reworkReasons.value = reworkStore.defects.map((d) => ({
        ...d,
        value: d.Id,
        showPuntasExpansion: false,
        selectedPuntasA: [],
        selectedPuntasB: [],
        puntasConfirmed: false,
      }));

      console.log("Datos de defectos cargados y listos para traducir.");
    }
  },
  { immediate: false }
);

// Funciones para el teclado numerico
const appendDigit = (d, terminal) => {
  const target = terminal === "A" ? connectorCountA : connectorCountB;

  const s = (target.value ?? "").toString();
  const next = (s === "0" ? "" : s) + d;
  const cleaned = next.replace(/^0+(?=\d)/, "").slice(0, 4);

  if (cleaned === "") {
    target.value = null;
  } else {
    const n = Number(cleaned);
    if (!Number.isNaN(n)) target.value = n;
  }
};

const backspaceDigit = (terminal) => {
  const target = terminal === "A" ? connectorCountA : connectorCountB;

  const s = (target.value ?? "").toString();
  if (!s) return;

  const next = s.slice(0, -1);
  target.value = next ? Number(next) : null;
};

//WATCHER CARGAR DOWNTIMES DESDE SQL
watch(rightDrawerContentType, (newVal) => {
  if (newVal === "downtime") {
    cargarDowntimes(false);
    loadDowntimeEventsFromLS();
  }
});

// Cada vez que cambie, actualizamos localStorage
watch(isDowntimeActive, (newVal) => {
  localStorage.setItem("isDowntimeActive", newVal ? "true" : "false");
});

watch(
  () => productionStore.currentShift,
  (newShift) => {
    if (newShift) {
      localStorage.setItem("MES_CurrentShift", newShift);
      console.log(t("console.shiftstore"), newShift);
    }
  }
);

//Si isDowntimeActive o showAlert cambian a true, ejecutas hideRightDrawer().
watch(
  () => [isDowntimeActive.value, showAlert.value],
  ([newDowntime, newAlert]) => {
    if (newDowntime || newAlert) {
      hideRightDrawer();
    }
  }
);

watch(rightDrawerOpen, async (isNowOpen) => {
  if (isNowOpen) {
    console.log(t("console.opendraw"));

    // Solo inicializar si aún no existe y el contenido activo es 'helpRequest'
    if (!keyboard && rightDrawerContentType.value === "helpRequest") {
      await nextTick(); // Espera a que el DOM renderice el contenedor

      if (keyboardContainer.value) {
        console.log(t("console.keyboard"));

        // Inicializar teclado virtual
        keyboard = new Keyboard(keyboardContainer.value, {
          onChange,
          onKeyPress,
          inputName: "mainInput",
        });

        // Sincronizar con el texto actual del input (si lo hay)
        keyboard.setInput(helpDescription.value || "");
        console.log(t("console.startkeyboard"));

        // 🔹 Enfocar el textarea de ayuda
        await nextTick(); // asegurar que el input exista en DOM
        helpInput.value?.focus();
        console.log(t("console.cursorstart"));
      } else {
        console.warn(t("console.keyboardcont"));
      }
    }
  } else {
    // Lógica de cierre del drawer y limpieza completa de estados
    console.log(t("console.closedawer"));

    if (keyboard) {
      keyboard.destroy();
      keyboard = null;
      console.log(t("console.keyboarddelete"));
    }

    // 🧹 2️⃣ Reiniciar campos del formulario de ayuda
    helpType.value = null;
    helpDescription.value = "";

    // Colapsar opciones de justificación
    downtimeEvents.value.forEach((event) => {
      event.showJustifyOptions = false;
    });

    // Limpiar estados y expansiones de retrabajos
    reworkReasons.value.forEach((reason) => {
      reason.showPuntasExpansion = false;
      reason.selectedPuntasA = [];
      reason.selectedPuntasB = [];
      reason.puntasConfirmed = false;
      reason.isFixed = false;
    });

    // Limpiar selecciones generales
    selectedReworkReason.value = null;
    badgeScanInput.value = "";
    operatorStore.scannedOperators = [];
    terminalTab.value = "terminalA";

    // Colapsar expansiones de defectos en producción
    productionStore.productionRows.forEach((row) => {
      if (row.defects) {
        row.defects.forEach((defect) => {
          defect.showPuntasExpansion = false;
        });
      }
    });

    // Resetear contraseñas y seguridad
    configPassword.value = "";
    passwordEntered.value = false;

    console.log(t("console.clean"));
  }
});

// 🟢 Watcher para sincronizar el teclado (en cada cambio)
// ❗️ CAMBIO CRUCIAL AQUÍ ❗️
// 🔹 Watch que sincroniza solo si no es teclado virtual
watch(helpDescription, (newValue) => {
  if (keyboard && !updatingFromVirtualKeyboard) {
    const inputEl =
      helpInput.value?.$el?.querySelector("textarea") || helpInput.value?.$el;

    if (!inputEl) return;

    // 🟢 Guardar posición actual del cursor
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;

    keyboard.setInput(newValue);

    nextTick(() => {
      // 🟢 Restaurar posición o selección previa
      inputEl.selectionStart = start;
      inputEl.selectionEnd = end;
      inputEl.scrollTop = inputEl.scrollHeight;
    });
  }
});

// 🔹 Observar cambios en localStorage (cada segundo)
setInterval(() => {
  autoDowntimeIdLS.value = localStorage.getItem("MES_AutoDowntimeID");
}, 1000);

// 🔹 WatchEffect para mostrar la notificación
watchEffect(() => {
  if (autoDowntimeIdLS.value) {
    // Notificación existente
    $q.notify({
      message: t("notify.downtimestart"),
      color: "negative",
      position: "top",
      timeout: 2000,
    });

    // Mantener lógica existente
    showAlert.value = true;

    // Activar la clase de alerta visual
    alertDowntime.value = true;

    // Delay para cargar los datos del downtime
    setTimeout(async () => {
      await cargarDowntimes(true);
      await loadDowntimeEventsFromLS();
      await renderDowntimeChart();
    }, 500);

    // Solo guardar timestamp si aún no se ha guardado
    if (!alertTimestamp.value) {
      alertTimestamp.value = new Date();
      setTimeout(() => {
        localStorage.setItem("MES_AutoDowntimeStart", alertTimestamp.value);
      }, 500);
    }
  }
});

//sendhelprequest
const sendHelpRequest = async () => {
  if (!helpType.value) {
    $q.notify({
      type: "warning",
      message: t("notify.sendhr"),
      position: "top",
    });
    return;
  }

  const requestData = {
    type: helpType.value,
    description: helpDescription.value,
    lineCodeId: stationStore.selectedLine,
    stationId: stationStore.selectedStation,
  };

  const { success, newRecord, message } = await productionStore.SendHelpRequest(
    requestData
  );

  if (success) {
    const stored = JSON.parse(localStorage.getItem("incidentNumbers")) || [];
    stored.unshift(newRecord.number);
    localStorage.setItem("incidentNumbers", JSON.stringify(stored));

    handleFetchStatus();

    $q.notify({
      type: "positive",
      message: `${t("notify.hepl1")} ${newRecord.number}`,
      caption: message,
      position: "top",
    });

    helpType.value = null;
    helpDescription.value = "";
    hideRightDrawer();

    console.log(t("console.ticket"), newRecord.number);
  } else {
    $q.notify({
      type: "negative",
      message: t("notify.errorsend"),
      caption: message || t("notify.help2"),
      position: "top",
    });
  }
};

const handleFetchStatus = async () => {
  incidentLoading.value = true;
  try {
    await productionStore.fetchIncidentStatusesFromSNOW();
  } catch (error) {
    console.error(t("console.statuserror"), error);
    Notify.create({
      type: "negative",
      message: t("notify.fetchstatus"),
      position: "top",
    });
  } finally {
    incidentLoading.value = false;
  }
};

const cleanUpResolvedIncidents = () => {
  // 2 horas
  const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;
  const now = Date.now();

  let incidentNumbers = JSON.parse(
    localStorage.getItem("incidentNumbers") || "[]"
  );
  let resolvedLog = JSON.parse(
    localStorage.getItem("resolvedIncidentsLog") || "[]"
  );

  const incidentsToRemove = [];

  const newResolvedLog = resolvedLog.filter((item) => {
    const timeElapsed = now - item.resolvedAt;

    if (timeElapsed >= TWO_HOURS_IN_MS) {
      incidentsToRemove.push(item.incidentNumber);
      return false;
    }

    return true;
  });

  const newIncidentNumbers = incidentNumbers.filter(
    (incidentNumber) => !incidentsToRemove.includes(incidentNumber)
  );

  if (incidentsToRemove.length > 0) {
    localStorage.setItem("incidentNumbers", JSON.stringify(newIncidentNumbers));
    localStorage.setItem(
      "resolvedIncidentsLog",
      JSON.stringify(newResolvedLog)
    );
  }
};

const handlePrint = () => {
  rightDrawerContentType.value = "printOptions";

  rightDrawerOpen.value = !rightDrawerOpen.value;
};

const sendPrintJob = async () => {
  console.log(t("console.senddocument"));
  const result = await PrintStore.sendPrintJob();
};

const loadPrinterConfig = () => {
  const savedIP = localStorage.getItem(LS_KEY);

  if (savedIP) {
    customPrinterIP.value = savedIP;
    printerConfigOption.value = "custom";
    PrintStore.printerIP = savedIP;
  } else {
    printerConfigOption.value = null;
    customPrinterIP.value = "";
    PrintStore.printerIP = "";
  }
};

const savePrinterConfiguration = () => {
  if (printerConfigOption.value !== "custom") {
    $q.notify({
      type: "negative",
      message: t("notify.errorip"),
      position: "top",
    });
    return;
  }

  const ipToSave = customPrinterIP.value.trim();

  if (!ipToSave) {
    $q.notify({
      type: "negative",
      message: t("notify.addip"),
      position: "top",
    });
    return;
  }

  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
  if (!ipv4Regex.test(ipToSave)) {
    $q.notify({
      type: "negative",
      message: t("notify.formatip"),
      position: "top",
    });
    return;
  }

  localStorage.setItem(LS_KEY, ipToSave);
  PrintStore.printerIP = ipToSave;

  $q.notify({
    type: "positive",
    message: `${t("notify.confprinter1")} (${ipToSave}) ${t(
      "notify.confprinter2"
    )}`,
    position: "top",
  });
};

watch(printerConfigOption, (newValue) => {
  if (newValue === null) {
    localStorage.removeItem(LS_KEY);
    customPrinterIP.value = "";
    PrintStore.printerIP = "";

    $q.notify({
      type: "info",
      message: t("notify.deleteprinter"),
      position: "top",
    });
  }
});
</script>

<style scoped>
/* Colores de la paleta */
:root {
  --color-primary: #3498db; /* Azul principal */
  --color-accent-green: #2ecc71; /* Verde acento */
  --color-accent-orange: #f39c12; /* Naranja acento */
  --color-accent-red: #e74c3c; /* Rojo acento */
  --color-text-dark: #2c3e50; /* Texto oscuro para títulos y valores */
  --color-text-medium: #555; /* Texto general */
  --color-text-light: #7f8c8d; /* Texto secundario/caption */

  --color-background-card: #ffffff; /* Fondo de tarjetas */
  --color-border-subtle: #ebf0f4; /* Bordes suaves */
}

/* --- Estilos Generales y Resets --- */
body {
  font-family: "Roboto", sans-serif;
}

/* --- Layout Principal del Dashboard --- */
.dashboard-container {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* --- Sidebar Minimalista (Q-Drawer Blanco con texto gris) --- */
.sidebar-minimal {
  background-color: white !important; /* Fondo blanco */
  color: #424242; /* Color de texto predeterminado para el sidebar, un gris oscuro */
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar-minimal .text-h6 {
  color: #212121 !important; /* Gris para el título principal */
}

.sidebar-minimal .text-subtitle1,
.sidebar-minimal .text-subtitle2,
.sidebar-minimal .q-item-label.text-weight-medium {
  color: #424242 !important; /* Gris oscuro para subtítulos y etiquetas de items */
}

.sidebar-minimal .q-item-label.text-caption {
  color: #757575 !important; /* Un gris medio para el texto de leyenda/caption */
}

.sidebar-minimal .text-h2 {
  font-size: 2.5rem;
  line-height: 1.2;
}

.sidebar-minimal .q-separator {
  background-color: rgba(0, 0, 0, 0.1) !important; /* Separadores gris claro */
}

.sidebar-minimal .q-list .q-item {
  color: #424242; /* Color general de los items de lista */
}

.sidebar-active-item {
  background-color: #f0f0f0 !important; /* Un gris muy claro para el ítem activo */
  color: #333333 !important;
}

/*Estilo para el item de operador con animación de parpadeo */
.operator-item {
  position: relative;
  overflow: hidden;
}

@keyframes flash-border-green {
  0%,
  100% {
    box-shadow: 0 0 0px 0px rgba(46, 204, 113, 0.7); /* Verde */
    border: 2px solid transparent;
  }
  50% {
    box-shadow: 0 0 10px 3px rgba(46, 204, 113, 0.7); /* Verde brillante */
    border: 2px solid #2ecc71;
  }
}

.operator-item-flash {
  animation: flash-border-green 1.5s infinite ease-in-out;
}

.epoxy-alert-flash {
  animation: flash-red 1s infinite alternate;
  border: 2.5px solid #e53935 !important; /* Quasar negative color */
  box-shadow: 0 0 10px #e53935;
}

.downtime-alert-flash {
  animation: flash-subtle-red 1.5s infinite alternate;
  /* Rojo base menos agresivo (por ejemplo, un tono ladrillo/suave) */
  border: 2.5px solid #cc7777 !important;
  /* Sombra base con el mismo tono suave */
  box-shadow: 0 0 10px #aa5555;
}

@keyframes flash-subtle-red {
  from {
    /* Estado inicial de la animación con un rojo suave */
    box-shadow: 0 0 10px #ff9999;
    border-color: #ff9999;
  }
  to {
    /* Estado final con un brillo y sombra sutiles */
    /* La sombra interior blanca ahora es más sutil si la dejas */
    box-shadow: 0 0 18px #ff9999, 0 0 3px #fff inset;
    border-color: #fff; /* El borde blanco para el parpadeo lo hace más tenue */
  }
}

/* Estilo para el item de estación con animación de parpadeo */
.station-item {
  position: relative;
  overflow: hidden;
}

@keyframes flash-border-blue {
  0%,
  100% {
    box-shadow: 0 0 0px 0px rgba(52, 152, 219, 0.7); /* Azul */
    border: 2px solid transparent;
  }
  50% {
    box-shadow: 0 0 10px 3px rgba(52, 152, 219, 0.7); /* Azul brillante */
    border: 2px solid #3498db;
  }
}

@keyframes flash-border-purple {
  0%,
  100% {
    /* Púrpura más suave o transparente en el inicio/fin */
    box-shadow: 0 0 0px 0px rgba(147, 112, 219, 0.7);
    border: 2px solid transparent;
  }
  50% {
    /* Púrpura brillante en el punto medio */
    box-shadow: 0 0 10px 3px rgba(147, 112, 219, 0.7);
    border: 2px solid #9370db; /* Púrpura sólido */
  }
}

.station-item-flash {
  animation: flash-border-blue 1.5s infinite ease-in-out;
}

.station-item-flash-help {
  animation: flash-border-purple 0s infinite ease-in-out;
}

/* --- Contenido Principal --- */
.main-content-minimal {
  background-image: none !important;
  background-repeat: unset !important;
  background-size: unset !important;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

/* padding superior en el q-page para subir el contenido */
.q-page-container .q-page {
  padding-top: 10px !important;
}

/*Overlay Downtime is Active a pantalla completa sin tarjeta y con texto grande */
.downtime-overlay-full {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1001;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 230, 230, 0.92); /* Fondo en Rojo */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
  padding: 20px;
  box-sizing: border-box;
}

/* Overlay de bienvenida ajustado al espacio restante (sin cubrir el drawer) */
.welcome-overlay-full {
  position: absolute;
  top: 0;
  left: 260px; /* respeta el ancho del drawer (260px) */
  width: calc(100% - 450px); /* ocupa solo el resto del espacio */
  height: 70%;
  background-color: rgba(255, 255, 255, 0.95);

  /* CLAVES DE CENTRADO FLEXBOX: */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrado Horizontal */
  justify-content: center; /* Centrado Vertical */

  text-align: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 20px;
  box-sizing: border-box;
}

/* Imagen ajustada con tamaño máximo y responsivo */
.welcome-overlay-full img {
  width: 40vw; /* Usa 40% del ancho de la vista para responsividad */
  max-width: 600px; /* Limita el tamaño máximo */
  height: auto;
  margin-bottom: 2rem;
}

/* Título y subtítulo centrados y proporcionados */
.welcome-overlay-full .text-h3 {
  font-size: 3.5rem;
  margin-bottom: 10px;
  color: #424242;
}

.welcome-overlay-full .text-h5 {
  font-size: 1.8rem;
  max-width: 600px;
  line-height: 1.4;
  color: #607d8b;
}

/* Colores de texto genéricos para el contenido principal */
.text-blue-grey-10 {
  color: var(--color-text-dark);
}
.text-blue-grey-8 {
  color: var(--color-text-medium);
}
.text-blue-grey-6 {
  color: var(--color-text-light);
}
.text-blue-grey-5 {
  color: var(--color-text-light);
}

/* Contenedores de columnas para que se expandan correctamente */
.flex-grow {
  flex-grow: 1;
}

.flex-column-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* --- Sección de Escaneo --- */
.scan-card {
  background-color: transparent;
  border: 2px solid var(--border-color, #2ecc71);
  border-radius: 10px;
  padding: 5px 15px 15px;
  transition: border-color 0.5s ease-in-out;
}

/* Animación de destello */
@keyframes border-flash {
  0% {
    box-shadow: 0 0 0px 0px rgba(255, 255, 255, 0);
  }
  50% {
    box-shadow: 0 0 15px 5px rgba(255, 255, 255, 0.7);
  }
  100% {
    box-shadow: 0 0 0px 0px rgba(255, 255, 255, 0);
  }
}

.scan-card.border-flash-active {
  animation: border-flash 0.5s ease-out;
}

.scan-card .text-h6 {
  font-weight: 600;
}

.scan-card .text-subtitle1 {
  font-size: 1.15rem;
  font-weight: 600 !important;
}

.q-input.q-field--outlined .q-field__control {
  border-radius: 8px !important;
  background-color: var(--color-background-card) !important;
}

/* --- estilos de Tarjetas KPI Compactas --- */
.kpi-card-compact {
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: var(--color-background-card);
  padding: 10px 15px;
  display: flex;
  align-items: center;
  height: 85px;
  overflow: hidden;
  position: relative;
}

.kpi-card-compact:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
}

.kpi-content-compact {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
}

.kpi-icon-wrapper-compact {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-details-compact {
  flex-grow: 1;
}

.kpi-card-compact .text-caption.kpi-title-full {
  font-size: 0.75em;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--color-text-light);
  margin-bottom: 2px;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.kpi-card-compact .text-h6 {
  font-size: 1.4em;
  font-weight: 700;
  color: var(--color-text-dark);
}

.kpi-card-compact::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  opacity: 0.05;
  z-index: 1;
  background-repeat: no-repeat;
  background-size: 80% auto;
  background-position: right center;
}

/* Fondos  por clase de color */
.kpi-card-compact.kpi-bg-primary::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%233498db' d='M0 70 L20 60 L40 75 L60 55 L80 65 L100 50 V100 H0 Z'/%3E%3C/svg%3E");
  background-color: #f2f7fb;
}

.kpi-card-compact.kpi-bg-green::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%232ecc71' d='M0 50 L20 60 L40 45 L60 55 L80 40 L100 50 V100 H0 Z'/%3E%3C/svg%3E");
  background-color: #f3fcf7;
}

.kpi-card-compact.kpi-bg-orange::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23f39c12' d='M0 60 L20 70 L40 50 L60 65 L80 45 L100 55 V100 H0 Z'/%3E%3C/svg%3E");
  background-color: #fff9f1;
}

.kpi-card-compact.kpi-bg-red::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23e74c3c' d='M0 40 L20 30 L40 50 L60 35 L80 55 L100 40 V100 H0 Z'/%3E%3C/svg%3E");
  background-color: #fff4f4;
}

/* --- Tabla de Producción --- */
.production-table-card {
  border-radius: 10px;
  padding: 5px;
  display: flex;
  flex-direction: column;
}

.full-height-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.production-table-card .q-table__container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.minimal-q-table {
  background-color: var(--color-background-card);
  border-radius: 8px;
  box-shadow: none;
  font-size: 0.9em;
  min-height: 338px;
  flex-grow: 1;
}

.minimal-q-table .q-table__middle {
  min-height: 300px;
}

.production-history-title {
  font-size: 0.8rem;
  font-weight: 600 !important;
  color: var(--color-text-dark);
}

/* Estilos para el encabezado de la tabla  */
.minimal-q-table thead th {
  color: var(--color-text-dark) !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid #c8d3dd;
  text-align: center;
}

/* Aplicar border-radius solo a las esquinas superiores de la primera y última celda del encabezado */
.minimal-q-table thead tr:first-child th:first-child {
  border-top-left-radius: 8px;
}
.minimal-q-table thead tr:first-child th:last-child {
  border-top-right-radius: 8px;
}

.minimal-q-table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid #f2f2f2;
  color: var(--color-text-medium);
  text-align: center;
}

.minimal-q-table tbody tr:hover {
  background-color: #fcfdff !important;
}

/* --- Estilos para el icono de Estado con fondo circular --- */
.status-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  margin: 0 auto;
}

.status-icon-container.completado {
  background-color: rgba(46, 204, 113, 0.2); /* Verde claro */
}

.status-icon-container.retrabajo {
  background-color: rgba(243, 156, 18, 0.2); /* Naranja claro */
}

.status-icon-container.pendiente {
  background-color: rgba(52, 152, 219, 0.2); /* Azul claro */
}

.status-icon-container.default {
  background-color: rgba(149, 165, 166, 0.2); /* Gris claro */
}

/* Asegura que el contenido de las celdas esté centrado para el ícono de estado y JobId */
.q-td.text-center {
  text-align: center;
}

/* --- Diálogos --- */
.dialog-card {
  border-radius: 10px;
  padding: 20px;
}
.dialog-card .text-h6 {
  font-weight: 600;
}

/* Estilos para el panel de justificación */
.justify-options-card {
  border-radius: 8px;
  box-shadow: none;
  background-color: #f8f8f8;
  border: 1px solid #eee;
}

/* Estilos para los botones de justificación con el nuevo tamaño y colores tenues */
.justify-btn-small {
  font-weight: 500;
  text-transform: capitalize;
  flex-basis: calc(50% - 8px);
  max-width: calc(50% - 8px);
  margin: 4px !important;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 40px;
  font-size: 0.85rem;
}

.justify-btn-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}

/* Remueve el efecto de luz del botón Justificar */
.q-btn[label="Justificar"] {
  box-shadow: none !important;
  animation: none !important;
}

/* Asegura que los colores se apliquen y el texto sea visible */
.q-btn[color^="blue-"][color$="-2"],
.q-btn[color^="green-"][color$="-2"],
.q-btn[color^="purple-"][color$="-2"],
.q-btn[color^="orange-"][color$="-2"] {
  background-color: var(--q-color-blue-2);
  color: var(--q-color-blue-grey-9);
}
.q-btn[color="green-2"] {
  background-color: var(--q-color-green-2);
}
.q-btn[color="purple-2"] {
  background-color: var(--q-color-purple-2);
}
.q-btn[color="orange-2"] {
  background-color: var(--q-color-orange-2);
}

/*  estilo para el título de justificación */
.justified-title {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8em;
  font-weight: 500;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
}

/* Estilos para las nuevas tarjetas circulares de puntas */
.circular-card {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border: 2px solid #ccc;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

.circular-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.circular-card.selected-card {
  background-color: #3498db;
  border-color: #3498db;
  color: white;
  transform: scale(0.9);
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.4);
}

.circular-card.selected-card .text-h6 {
  color: white; /* Asegura que el número sea blanco cuando está seleccionado */
}

.circular-card .text-h6 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #555;
}

/* Contenedor para scroll en las tarjetas circulares */
.scrollable-cards-container {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Estilos para el panel de detalles de defecto (expansión) */
.defect-details-card {
  border-radius: 8px;
  box-shadow: none;
  background-color: #f8f8f8;
  border: 1px solid #eee;
}

/* estilo para el icono de confirmación de puntas */
.confirmed-icon-glow {
  position: relative;

  box-shadow: 0 0 8px 2px rgba(46, 204, 113, 0.4);
  border-radius: 50%;
  padding: 2px;
}
.square-button {
  /* Cambiado a square-button */
  background-color: #f0f0f0;
  border: 2px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border-radius: 8px;
  width: 75px;
  height: 65px;
  min-width: unset !important;
  min-height: unset !important;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.square-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Ajustes para el texto dentro del botón */
.square-button .text-caption {
  line-height: 1.2;
  white-space: normal;
  font-size: 0.55em;
  margin-top: 4px;
}

.square-button-help {
  /* Cambiado a square-button */
  background-color: #f0f0f0;
  border: 2px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border-radius: 8px;
  width: 155px;
  height: 65px;
  min-width: unset !important;
  min-height: unset !important;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/*Teclado NUmerico */

.numpad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px; /* similar a q-col-gutter-sm */
}

.numpad-key {
  width: 100%;
  height: 56px; /* botones más grandes y cómodos */
  font-size: 18px;
}

.numpad-spacer {
  visibility: hidden; /* celdas fantasma para centrar el "0" */
}

@media (min-width: 768px) {
  .numpad-key {
    height: 64px;
    font-size: 20px;
  }
}

.numpad-wrapper {
  background: #f8f9fb;
  border: 1px solid #e0e0e0; /* contorno gris */
  border-radius: 12px;
}

.numpad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.numpad-key {
  width: 100%;
  height: 58px;
  font-size: 18px;
  border-radius: 12px;
  transition: transform 0.06s ease, box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.numpad-key.q-btn--outline {
  border-width: 2px;
}

.numpad-key:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #757575; /* un gris más marcado al hover */
}

.numpad-key:active {
  transform: translateY(1px);
}

.numpad-key:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.18);
}

.numpad-spacer {
  visibility: hidden;
}

@media (min-width: 768px) {
  .numpad-key {
    height: 64px;
    font-size: 20px;
  }
}

.downtime-chart-right {
  /* Contenedor de Gráfica de Downtimes */
  position: fixed;
  top: 80px;
  right: 0;
  width: 585px;
  height: 290px;
  background-color: transparent !important; /* ✅ Fondo transparente */
  box-shadow: none !important; /* ✅ Sin sombra */
  border: none !important; /* ✅ Sin borde */
  padding: 10px;
  z-index: 999;
}

.scrollable-list {
  max-height: calc(8 * 5rem); /* cada item ~3.5rem */
  overflow-y: auto;
}

.single-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* agrega los "..." al final */
}

.rounded-btn {
  border-radius: 12px; /* Bordes más suaves */
  font-weight: 600; /* Semi-bold en lugar de bold fuerte */
  font-size: 15px;
  padding: 8px 16px; /* Un poco más de espacio interno */
  border: 2px solid #e0e0e0; /* Color llamativo en lugar de blanco */

  color: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out; /* Animaciones suaves */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); /* Sombra ligera para 3D */
}

.rounded-btn:focus {
  outline: 3px solid rgba(0, 242, 254, 0.6); /* Resalta al hacer focus */
  outline-offset: 2px; /* Espacio entre botón y contorno */
}

.rounded-btn:disabled {
  background: #ccc;
  color: #666;
  border-color: #ddd;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.rounded-btn:hover {
  transform: translateY(-2px); /* Pequeño "flotado" */
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

.rounded-btn:active {
  transform: translateY(1px); /* Simula que el botón se presiona */
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

.split-card {
  box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.25);
  background-color: #ffffff;
  transition: all 0.3s ease-in-out;
}
.split-card .text-body1 {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* --- Base general (mantiene tu funcionalidad actual y agrega estilo) --- */
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  /* 💡 Esto hace que se centre dentro del área visible de la tabla */
  width: 100%;
  height: 200px; /* o usa min-height si lo prefieres */
}

/* --- Centrados (por defecto) --- */
.no-data-center {
  justify-content: center;
  align-items: center;
}

/* --- Arriba / Abajo --- */
.no-data-top {
  justify-content: flex-start;
  align-items: center;
}

.no-data-bottom {
  justify-content: flex-end;
  align-items: center;
}

/* --- Izquierda / Derecha --- */
.no-data-left {
  justify-content: center;
  align-items: flex-start;
}

.no-data-right {
  justify-content: center;
  align-items: flex-end;
}

/* --- Animación de entrada --- */
.animated-no-data {
  animation: fadeSlideIn 0.8s ease forwards;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* --- Efecto pulse en el ícono --- */
.pulse-icon {
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(255, 165, 0, 0.4));
  }
  50% {
    transform: scale(1.08);
    filter: drop-shadow(0 0 12px rgba(255, 165, 0, 0.7));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 0 rgba(255, 165, 0, 0.4));
  }
}

/* --- Efecto fade-in en texto secundario --- */
.fade-in {
  opacity: 0;
  animation: fadeText 1.6s ease-in forwards;
  animation-delay: 0.6s;
}

@keyframes fadeText {
  to {
    opacity: 1;
  }
}

.wrap-text {
  white-space: normal; /* permite saltos de línea */
  word-wrap: break-word; /* corta palabras largas si es necesario */
  overflow-wrap: anywhere; /* asegura que no se desborde */
  text-align: left; /* más natural para textos largos */
  max-width: 400px; /* ajusta según el ancho deseado */
  line-height: 1.4; /* mejora legibilidad */
}

/*-- ENCABEZADO --*/

.header-row {
  background: #f5f5f5; /* Gris suave */
  font-weight: bold; /* Negritas en todo el encabezado */
  border-bottom: 1px solid #ddd;
  min-height: 40px; /* Uniforme */
  display: flex;
  align-items: center; /* Centra verticalmente */
}

.header-row .q-item-label {
  font-weight: bold; /* Negrita en cada celda */
  text-align: center;
}

.header-row .q-item-section:first-child .q-item-label {
  text-align: left; /* Defecto alineado a la izquierda */
}

/* Añade esta clase en tu bloque <style> o archivo CSS */
.fixed-action-container {
  /* Define un ancho fijo que sea suficiente para el botón más grande (el de texto) */
  min-width: 130px; /* Ajusta este valor hasta que el contenido deje de moverse */
  display: flex; /* Asegura que los hijos se alineen correctamente */
  justify-content: center; /* Centra el contenido horizontalmente */
  align-items: center;
  /* Eliminé q-ml-sm de los botones, ahora el margen está aquí si es necesario */
}

.fixed-punta-section {
  /* Define el ancho exacto que ocupa el círculo "2B" o "3A" */
  width: 65px; /* Ajusta este valor para que cubra exactamente el círculo y sus márgenes */
  min-width: 65px;
  max-width: 65px;
  /* Usar `q-ma-xs` en el q-card interior puede sumar márgenes, ajústalos o quítalos. */
}

/* Mantén el CSS de la columna de Acción de la respuesta anterior */
.fixed-action-section {
  min-width: 220px; /* Asegúrate de que este ancho cubra el botón de texto y los dos íconos */
  max-width: 220px; /* Agrega max-width para asegurar que el flex no lo estire */
  justify-content: center;
}

/* En el bloque <style> de MESSystem.txt */
.row-pausada {
  background-color: #fff9c4 !important; /* Un amarillo claro */
}
</style>
