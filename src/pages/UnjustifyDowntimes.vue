<template>
  <q-layout view="lHh LpR lFf">
    <!-- Drawer lateral para filtros -->
    <q-drawer
      side="left"
      show-if-above
      v-model="drawer"
      bordered
      :width="240"
      class="bg-blue-grey-1 column"
      behavior="desktop"
    >
      <q-list class="q-pt-xl">
        <div
          class="text-subtitle1 text-weight-bold text-primary flex items-center justify-center q-mb-md q-mt-lg"
        >
        <q-icon name="filter_alt" color="primary" size="28px" class="q-mr-sm" />
    <span class="text-h6 text-primary q-mt-xs">    {{ $t("configuration.drawerTitle") }}</span>
  </div>

        <q-separator spaced />

       <q-card-section class="q-gutter-md q-pt-lg">

  <!-- 🔵 FILTRO POR LÍNEA -->
  <q-select
    v-model="selectedLine"
    :options="lineOptions"
    :label="$t('hrxhr.line')"
    outlined
    dense
    option-value="value"
    option-label="label"
    emit-value
    map-options
    clearable
    :loading="!lineOptions.length"
  >
    <template v-slot:prepend>
      <q-icon name="linear_scale" color="primary" />
    </template>
  </q-select>


  <!-- 🟢 FILTRO POR ESTACIÓN -->
  <q-select
    v-model="selectedStation"
    :options="stationOptions"
     :label="$t('hrxhr.station')"
    outlined
    dense
    options-dense
    option-value="value"
    option-label="label"
    emit-value
    map-options
    clearable
    :loading="!stationOptions.length"
  >
    <template v-slot:prepend>
      <q-icon name="place" color="primary" />
    </template>
  </q-select>


  <!-- 🟣 FILTRO POR FECHA -->
  <q-select
    v-model="selectedDate"
    :options="availableDatesFiltered"
   :label="$t('sidebar.prodDate')"
    outlined
    dense
    option-value="value"
    option-label="label"
    emit-value
    map-options
    clearable
  >
    <template v-slot:prepend>
      <q-icon name="event" color="primary" />
    </template>
  </q-select>

</q-card-section>

      </q-list>
      <q-separator spaced />
      <q-item clickable>
        <q-btn
           :label="$t('Reporte.update')"
          color="primary"
          icon="refresh"
          class="rounded-btn full-width"
          @click="refreshEventos"
      /></q-item>


  <div class="text-caption text-weight-bold text-secondary text-center q-mt-xs">
  <q-icon name="table_chart" size="14px" class="q-mr-xs" />
 {{ $t("unjustifyt.tregis") }}
  <span class="text-caption text-weight-bold text-primary">
    {{ totalRegistrosReporte }}
  </span>
</div>
      <q-separator spaced />
      <div v-if="filteredEvents?.length" class="q-pa-sm">




 <q-card flat bordered class="bg-primary text-white shadow-2 q-mb-md"> <q-card-section class="q-pa-sm text-center">
    <div class="text-caption text-uppercase"> {{ $t("unjustifyt.tfilt") }}</div>
    <div class="text-h4 text-bold"> {{ filteredEvents.length }}</div>
    <div class="text-caption text-italic">
      <span v-if="filteredEvents === 0">
       {{ $t("unjustifyt.nodata") }}
      </span>

      <span v-else-if="filterOpenOnly">
        ({{ $t("unjustifyt.dopen") }})
      </span>

      <span v-else class="text-weight-medium">
      {{ $t("unjustifyt.dunjus") }}
      </span>
    </div>
  </q-card-section>
</q-card>

<q-card
  dark
  bordered
  v-ripple="activeEventsCount > 0"
  @click="activeEventsCount > 0 ? filterOpenOnly = !filterOpenOnly : null"
  :class="[
    filterOpenOnly
      ? 'bg-negative text-white shadow-8'
      : 'bg-orange-5 text-white',

    activeEventsCount > 0
      ? 'cursor-pointer clickable-card'
      : 'opacity-50 cursor-not-allowed'
  ]"
>
  <q-card-section class="q-pa-sm text-center relative-position">

    <!-- Icono indicador de acción -->
    <q-icon
      v-if="activeEventsCount > 0"
      name="chevron_right"
      class="absolute-right q-ma-sm action-icon"
      size="20px"
      opacity="0.7"
    />

    <div class="text-caption text-uppercase">
     {{ $t("unjustifyt.dopen") }}
    </div>

    <div class="text-h4 text-bold">
      <q-icon
        :name="activeEventsCount === 0
          ? 'block'
          : (filterOpenOnly ? 'filter_alt' : 'history')"
        size="24px"
        class="q-mr-xs"
      />
      {{ activeEventsCount }}
    </div>

    <div class="text-caption text-italic">
      <span v-if="activeEventsCount === 0">
         {{ $t("unjustifyt.noevent") }}
      </span>

      <span v-else-if="filterOpenOnly">
        (   {{ $t("unjustifyt.filtevent") }})
      </span>

      <span v-else class="text-weight-medium">
       {{ $t("unjustifyt.click") }}
      </span>
    </div>

  </q-card-section>
</q-card>
        <!-- Mostrar filtros aplicados -->

      </div>

      <!-- Opcional: mensaje cuando no hay filtrados -->
      <div v-else class="q-pa-sm text-subtitle2">
        {{ $t("unjustifyt.nofilt") }}
      </div>
<q-separator spaced />

<!-- Reloj -->
<div class="q-pa-sm flex justify-center">
  <div
    class="text-center q-pa-sm bg-grey-2 rounded-borders border-primary shadow-up-1"
  >
    <div class="text-h5 text-bold text-primary">
      {{ horaFormateada }}
    </div>
    <div class="text-caption text-grey-8">
      {{ fechaFormateada }}
    </div>
  </div>
</div>

<q-separator spaced />

<!-- Idioma -->
  <q-card-actions align="left" >
<div class="row justify-center items-center q-mt-xs full-width" style="min-height: 50px;">
  <LanguageToggle />
</div></q-card-actions>
    </q-drawer>

    <!-- Contenido principal -->
    <q-page-container>
      <q-page padding>
        <div v-if="filteredEvents.length" class="row items-center q-gutter-sm">
         <q-avatar square size="70px">
    <img src="/img/AFL.png"
      style="width: 2em; height: 2em; margin-right: 0.5em"
                 >
  </q-avatar>
<div>
  <div class="text-h5 text-bold text-dark">
    {{$t('hrxhr.line')}}: <span class="text-primary">{{ lineNamesHeader }}</span>
  </div>

  <div class="text-subtitle2 text-grey-7">
   {{$t('unjustifyt.title')}}
  </div>

  <div class="text-caption text-weight-bold text-secondary flex items-center q-mt-xs">
    <q-icon name="history" size="14px" class="q-mr-xs" />
    <span>  {{$t('unjustifyt.update')}}:</span>
    <span class="text-weight-bold q-ml-xs text-primary">{{ lastUpdateDisplay }}</span>
  </div>
</div>
  <q-space />

<q-badge
  :color="filterOpenOnly ? 'amber-9' : 'negative'"
  class="q-pa-sm shadow-2"
  :class="filterOpenOnly ? 'text-black' : 'text-white'"
  style="font-size: 16px"
>
  <q-icon
    :name="filterOpenOnly ? 'access_time' : 'warning'"
    class="q-mr-xs"
  />

  {{ totalSinJustificar }} {{ filterOpenOnly ? $t('unjustifyt.open') : $t('unjustifyt.close')}}
  <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
     {{ $t("unjustifyt.click2") }}
  </q-tooltip>
</q-badge>


        </div>



        <!-- ✅ Aquí solo cambia downtimeEvents por filteredEvents -->
        <section v-if="filteredEvents.length" class="downtime-summary">
         <q-table
  v-if="filteredEvents.length"
  class="downtime-qtable "
   table-header-class="custom-header"
  flat
  bordered
  :rows="filteredEvents"
  :columns="columns"
  row-key="DowntimeID"
  :pagination="pagination"
  @update:pagination="pagination = $event"
  :rows-per-page-options="[5, 10, 20, 50]"
>
  <!-- 🔥 Columna ID -->
  <template #body-cell-DowntimeID="props">
    <q-td :props="props">
      <q-chip
       :color="getDowntimeIDColor(props.row.DowntimeID, props.row.EndTime)"
        text-color="white"
        square
      >
        {{ props.row.DowntimeID }}
      </q-chip>
    </q-td>
  </template>

  <!-- 🔥 Columna Downtime Reason -->
  <template #body-cell-DownTimeReason="props">
    <q-td :props="props">
      <q-btn
        dense
        no-caps
        :color="
          props.row.DownTimeReason &&
          props.row.DownTimeReason !== '⚠️ Sin Justificar ⚠️'
            ? reasonColors[props.row.DownTimeReason] || 'primary'
            : 'amber'
        "
        :text-color="
          props.row.DownTimeReason &&
          props.row.DownTimeReason !== '⚠️ Sin Justificar ⚠️'
            ? 'white'
            : 'black'
        "
        @click="openDowntimeDialog(props.row)"
      >
        <q-icon
          v-if="
            !props.row.DownTimeReason ||
            props.row.DownTimeReason === '⚠️ Sin Justificar ⚠️'
          "
          name="gavel"
          class="q-mr-xs"
        />
        {{ props.row.DownTimeReason || $t("graph.nodefine") }}
      </q-btn>
    </q-td>
  </template>

  <!-- 🔥 Columna Type -->
  <template #body-cell-DowntimeType="props">
    <q-td :props="props">
      {{
        props.row.DowntimeType === true || props.row.DowntimeType === 1
          ? $t('overlay.manual')
          : $t('overlay.automatic')

      }}
    </q-td>
  </template>

  <!-- 🔥 Columna Estación -->
  <template #body-cell-StationName="props">
    <q-td :props="props">
      {{ props.row.StationName }}
    </q-td>
  </template>

  <!-- 🔥 Columna Split -->
  <template #body-cell-Split="props">
    <q-td :props="props">
      <q-btn
        :label="$t('downtimepanel.split')"
        color="amber"
        icon="swap_horiz"
        text-color="black"
        size="sm"
        glossy
        dense
        style="font-size: 12px"
        @click="openSplitDialog(props.row)"
      />
    </q-td>
  </template>

  <!-- 🔥 Columna ProductionDate -->
  <template #body-cell-ProductionDate="props">
    <q-td :props="props">
      {{ props.row.ProductionDate }}
    </q-td>
  </template>

  <!-- 🔥 Columna Operador -->
  <template #body-cell-FULL_NAME="props">
    <q-td :props="props">
      <div class="text-left ellipsis">
        {{ props.row.FULL_NAME }}
      </div>
    </q-td>
  </template>

  <!-- 🔥 Columna Turno -->
  <template #body-cell-Shift="props">
    <q-td :props="props">
      <q-badge color="primary" outline class="text-subtitle2">
        {{ props.row.Shift }}
      </q-badge>
    </q-td>
  </template>

  <!-- 🔥 Columna StartTime -->
<template #body-cell-StartTime="props">
  <q-td :props="props">
    {{ formatSmartDate(props.row.StartTime, props.row.EndTime, true) }}
  </q-td>
</template>

  <!-- 🔥 Columna EndTime -->
<template #body-cell-EndTime="props">
  <q-td :props="props">
    <q-btn
      v-if="!props.row.EndTime"
      dense no-caps color="amber" text-color="black"
      @click="openCloseDowntimeDialog(props.row)"
      :disable="isLoading"
    >
      <q-icon name="access_time" class="q-mr-xs" />
      {{ $t("unjustifyt.open2") }}
    </q-btn>

    <span
      v-else
      :class="{
        'text-red-8 text-bold': !dayjs.utc(props.row.StartTime).isSame(dayjs.utc(props.row.EndTime), 'day')
      }"
    >
      {{ formatSmartDate(props.row.StartTime, props.row.EndTime, false) }}
    </span>
  </q-td>
</template>

  <!-- 🔥 Columna Total -->
<template #body-cell-Total="props">
  <q-td :props="props" class="row items-center no-wrap">
    <q-icon
      name="schedule"
      size="xs"
      class="q-mr-xs"
      :color="
        props.row.DurationSeconds < 0
          ? 'red'
          : 'teal'
      "
    />

    {{
      formatMinutesToHM(
        props.row.DurationInputMinutes ??
        Math.round(props.row.DurationSeconds / 60)
      )
    }}
  </q-td>
</template>
</q-table>

        </section>


<section class="downtime-summary q-mb-md">
  <q-card flat bordered class="chart-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6 text-primary text-weight-bold">
        <q-icon name="analytics" class="q-mr-sm" />
        {{ $t("graph.title2") }}
      </div>

      <q-space />

      <q-btn-toggle
        v-model="chartType"
        flat
        dense
        toggle-color="primary"
        color="grey-7"
        :options="[
          { label: $t('graph.B'), value: 'column', icon: 'bar_chart' },
          { label: $t('graph.H'), value: 'bar', icon: 'notes' },
          { label: $t('graph.L'), value: 'line', icon: 'show_chart' },
          { label: $t('graph.D'), value: 'pie', icon: 'pie_chart' }
        ]"
        @update:model-value="changeChartType"
      />
    </q-card-section>

    <q-card-section>
      <div ref="chartContainer" class="highcharts-wrapper"></div>
    </q-card-section>
  </q-card>
</section>

      </q-page>
    </q-page-container>

    <!-- DIALOGO PARA JUSTIFICAR -->
    <q-dialog v-model="showDowntimeDialog" persistent>
      <q-card
        class="split-card"
        style="
          min-width: 400px;
          max-width: 90vw;
          overflow-x: hidden;
          width: fit-content;
          border-radius: 16px;
        "
      >
        <div class="row items-center q-pa-sm bg-primary text-white">
          <!-- Imagen en la esquina superior izquierda -->
          <img
            src="/img/AFL_Logo.svg"
            style="width: 2.5em; height: 2.5em; margin-right: 0.5em"
            class="q-mr-sm"
          />

          <div class="text-h6">    {{ $t("unjustifyt.justify") }}</div>
          <q-space />
        </div>

        <q-card-section>
          <div class="text-subtitle2 q-mb-md">
            <strong> {{ $t("unjustifyt.did") }}</strong> {{ selectedDowntimeId }}<br />
            <strong> {{ $t("unjustifyt.dtotal") }}</strong>
            {{ formattedDuration }} <br />
            <strong> {{ $t("unjustifyt.tdownt") }}</strong>
            <span>
              <q-chip
                v-if="selectedDowntimeType === false"
                color="red"
                text-color="white"
                size="sm"
                square
                icon="timer_off"
                class="q-ml-sm"
              >
               {{ $t("unjustifyt.dauto") }}
              </q-chip>
              <q-chip
                v-else-if="selectedDowntimeType === true"
                color="primary"
                text-color="white"
                size="sm"
                square
                icon="handyman"
                class="q-ml-sm"
              >
                 {{ $t("unjustifyt.dmanual") }}
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
                 {{ $t("unjustifyt.none") }}
              </q-chip>
            </span>
          </div>

          <p style="font-weight: bold; margin-bottom: 0.5rem">
               {{ $t("unjustifyt.selectm") }}
           <span
  :class="`bg-${
    reasonColors[
      downtimeStore.downtimeReasons.find(
        (r) => r.value === newReasonID
      )?.label
    ] || 'grey-7'
  } text-white`"
  style="
    font-weight: bold;
    font-size: 1.1rem;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    display: inline-block;
  "
>
  {{ downtimeStore.downtimeReasons.find(r => r.value === newReasonID)?.label ||  $t('unjustifyt.close') }}
</span>
          </p>

          <q-card-section
            class="row q-gutter-sm justify-center q-mt-md q-pt-none"
          >
            <q-btn
              v-for="reason in downtimeStore.downtimeReasons"
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
              class="col-4 q-mb-sm"
              style="
                min-width: auto;
                padding-left: 0.5rem;
                padding-right: 0.5rem;
              "
              @click="() => (newReasonID = reason.value)"
            />
          </q-card-section>
        </q-card-section>
<!-- Idioma -->
  <q-card-actions align="right" class="text-primary q-pa-sm">
<div class="row justify-center items-center q-mt-xs full-width" style="min-height: 50px;">
  <LanguageToggle />
</div></q-card-actions>
        <q-card-actions align="right" class="text-primary q-pa-sm">
          <q-btn flat label="Cancelar" v-close-popup />

          <q-btn
            flat
            label="Justificar"
            color="primary"
            :disable="!newReasonID"
            class="rounded-btn"
            @click="handleJustifyReason()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIALOGO PARA TERMINAR DOWNTIME -->
    <q-dialog v-model="showDowntimeDialog2" persistent>
      <q-card
        style="
          min-width: 400px;
          max-width: 90vw;
          overflow-x: hidden;
          width: fit-content;
          border-radius: 16px;
        "
      >
        <div class="row items-center q-pa-sm bg-primary text-white">
          <!-- Imagen en la esquina superior izquierda -->
          <img
            src="/img/AFL_Logo.svg"
            style="width: 2.5em; height: 2.5em; margin-right: 0.5em"
            class="q-mr-sm"
          />

          <div class="text-h6"> {{ $t("unjustifyt.close0") }}</div>
          <q-space />
        </div>

        <q-card-section>
          <div class="text-subtitle2 q-mb-md">
            <strong>{{ $t("unjustifyt.did") }}</strong> {{ currentDowntimeID }}<br />
            <strong>{{ $t("unjustifyt.date") }}</strong> {{ currentProductionDate
            }}<br />
            <strong>{{ $t("unjustifyt.hrs") }}</strong>
            {{ formatTimeToUTC(currentStartTime) }}<br />
            <strong>{{ $t("unjustifyt.tdownt") }}</strong>
            <span>
              <q-chip
                v-if="selectedDowntimeType === false"
                color="red"
                text-color="white"
                size="sm"
                square
                icon="timer_off"
                class="q-ml-sm"
              >
               {{ $t("unjustifyt.dauto") }}
              </q-chip>
              <q-chip
                v-else-if="selectedDowntimeType === true"
                color="primary"
                text-color="white"
                size="sm"
                square
                icon="handyman"
                class="q-ml-sm"
              >
           {{ $t("unjustifyt.dmanual") }}
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
              {{ $t("unjustifyt.none") }}
              </q-chip>
            </span>
          </div>

          <q-input
  v-model.number="downtimeDurationMinutes"
  type="number"
  :label="$t('unjustifyt.duration')"
  :hint="$t('unjustifyt.calc1')"
  outlined
  dense
  min="1"
  step="1"
  @keydown.enter="closeDowntime"
  :rules="[
    (val) => (val !== null && val > 0) || $t('unjustifyt.calc2')
  ]"
/>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup :disable="isClosing" />
          <q-btn
            label="Cerrar Downtime"
            color="positive"
            @click="closeDowntime"
            :loading="isClosing"
            :disable="
              !downtimeDurationMinutes ||
              downtimeDurationMinutes <= 0 ||
              isClosing
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 🔵 Modal Split -->
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
        <!-- Encabezado -->
        <div class="row items-center q-pa-sm bg-primary text-white">
          <img
            src="/img/AFL_Logo.svg"
            style="width: 2.5em; height: 2.5em; margin-right: 0.5em"
            class="q-mr-sm"
          />
          <div class="text-h6">{{ $t("unjustifyt.split") }}</div>
          <q-space />
        </div>

        <!-- Información del downtime -->
        <q-card-section>
          <p>
            <strong>{{ $t("unjustifyt.did") }}</strong>
            {{ selectedDowntimeFull?.DowntimeID }}<br />
            <strong>{{ $t("unjustifyt.dtotal") }}</strong>
            {{ Math.floor(selectedDowntimeFull?.DurationSeconds / 60) }}
            {{ $t("unjustifyt.min") }}<br />
            <strong>{{ $t("unjustifyt.des") }}</strong>
            {{ selectedDowntimeFull?.DownTimeReason || "Ninguno" }}<br />
            <strong>{{ $t("unjustifyt.tdownt") }}</strong>
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
                {{ $t("unjustifyt.dauto") }}
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
{{ $t("unjustifyt.dmanual") }}
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
                {{ $t("unjustifyt.none") }}
              </q-chip>
            </span>
          </p>
        </q-card-section>

        <q-separator class="q-mb-md" />

        <!-- Slider de minutos -->
        <q-card-section>
          <div class="q-mt-md">
            <q-slider
              ref="sliderRef"
              v-model="selectedMinutes"
              :min="0"
              :max="totalMinutes"
              :step="1"
              label-always
              :markers="true"
              :marker-labels="computedMarkerLabels"
              style="max-width: 100%"
              :label-value="`Padre (minutos): ${selectedMinutes}`"
              color="primary"
              track-color="grey-3"
              thumb-color="blue-7"
            />
          </div>

          <q-separator class="q-mt-md q-mb-md" />

          <div class="row justify-between text-caption q-mt-xs">
            <q-badge color="primary" class="q-py-xs q-px-sm text-subtitle2">
             {{ $t("unjustifyt.father") }} {{ selectedMinutes }} min
            </q-badge>
            <q-badge color="primary" class="q-py-xs q-px-sm text-subtitle2">
             {{ $t("unjustifyt.son") }} {{ totalMinutes - selectedMinutes }} min
            </q-badge>
          </div>
        </q-card-section>

        <q-separator class="q-mt-md q-mb-md" />

        <!-- Selección de Reason -->
        <q-card-section>
          <p style="font-weight: bold; margin-bottom: 0.5rem">
            {{ $t("unjustifyt.sonreason") }}
            <span
              :class="`text-${
                reasonColors[
                  downtimeStore.downtimeReasons.find(
                    (r) => r.value === newReasonID
                  )?.label
                ] || 'grey-5'
              }`"
              style="
                font-weight: bold;
                font-size: 1.1rem;
                background-color: rgba(0, 0, 0, 0.05);
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
              "
            >
              {{
                downtimeStore.downtimeReasons.find(
                  (r) => r.value === newReasonID
                )?.label || "Ninguno"
              }}
            </span>
          </p>

          <div class="row q-gutter-sm justify-center q-mt-md">
            <q-btn
              v-for="reason in downtimeStore.downtimeReasons"
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
              class="col-4 q-mb-sm"
              @click="() => (newReasonID = reason.value)"
            />
          </div>
        </q-card-section>
        <!-- Idioma -->
  <q-card-actions align="right" class="text-primary q-pa-sm">
<div class="row justify-center items-center q-mt-xs full-width" style="min-height: 50px;">
  <LanguageToggle />
</div></q-card-actions>

        <!-- Botones -->
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn
            flat
            label="Split"
            color="primary"
            :disable="!newReasonID || !selectedMinutes"
            @click="
              handleSplitClick(selectedDowntime, selectedMinutes, newReasonID)
            "
          />
        </q-card-actions>
      </q-card>

    </q-dialog>
  </q-layout>

</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  nextTick,
  watch,
} from "vue";

import { Notify } from "quasar";
import { usedowntimeStore } from "src/stores/downtimeStore";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import Highcharts from 'highcharts';
import DrilldownModule from 'highcharts/modules/drilldown';
import "dayjs/locale/es"; // Cargar español
import "dayjs/locale/en"; // Cargar inglés
import "dayjs/locale/pl"; // Cargar polaco
import localeData from "dayjs/plugin/localeData"; // Permite usar .locale()
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
// Establecer idioma globalmente
dayjs.locale("es");
import LanguageToggle from "src/components/LanguageToggle.vue";
import { useI18n } from "vue-i18n";
dayjs.extend(localizedFormat);
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Esta es la forma infalible: detecta si es una función o si está en .default
if (typeof DrilldownModule === 'function') {
  DrilldownModule(Highcharts);
} else if (DrilldownModule && DrilldownModule.default) {
  DrilldownModule.default(Highcharts);
};

const { t, locale } = useI18n();

const downtimeStore = usedowntimeStore();
const drawer = ref(true);

const start = ref(null);
const end = ref(null);
const downtimeEvents = ref([]);
const loadingStations = ref(true);

// 🔹 Filtros
const selectedStation = ref(null);
const selectedLine = ref(null);
const selectedDate = ref(null);
const dateMenu = ref(false);

// Reloj
const fechaFormateada = ref("");
const horaFormateada = ref("");

// 🔹 Aquí declaras la lista de razones
const downtimeReasons = ref([]);

//variable para ultima actualizacion
const lastUpdate = ref(new Date());

const filterOpenOnly = ref(false);

//Justificar Downtime
const showDowntimeDialog = ref(false);
const selectedDowntimeId = ref(null);
const selectedDurationSeconds = ref(null);
const selectedDowntimeType = ref(null);
const currentProductionDate = ref(null);
const newReasonID = ref(null);
const selectedDowntimeItem = ref(null);
const currentDowntimeItem = ref(null);
const showDowntimeDialog2 = ref(false);
const currentDowntimeID = ref(null);
const currentStartTime = ref(null);
const downtimeDurationMinutes = ref(null);
const isClosing = ref(false); // Para deshabilitar el botón mientras se procesa
const isLoading = ref(false); // <--- ¡Añadir esta línea!

// Estado modal
const showSplitDialog = ref(false);
const selectedDowntime = ref(null);
const selectedDowntimeFull = ref(null);
const selectedMinutes = ref(0);
const sliderRef = ref(null);

// Configurables
const LABEL_SPACING_PX = 70; // aprox px por etiqueta (ajusta si quieres más/menos)
const MAX_LABELS_CAP = 14; // <-- límite que pediste

// Número máximo calculado de etiquetas visibles
const maxLabels = ref(8);

const updateMaxLabels = async () => {
  await nextTick();
  const comp = sliderRef.value;
  let width = 0;
  if (comp) {
    const el = comp.$el ?? comp;
    width = el?.clientWidth ?? 0;
  }
  if (!width) width = Math.max(200, window.innerWidth - 260);

  const possible = Math.max(2, Math.floor(width / LABEL_SPACING_PX));
  // mínimo 3, máximo el cap que deseas (15)
  maxLabels.value = Math.min(Math.max(3, possible), MAX_LABELS_CAP);
};

// Colores de razones
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


const totalSinJustificar = computed(() => {
  // Filtramos de la lista de eventos filtrados (o de la maestra, según prefieras)
  // los que no tienen motivo aún.
  return filteredEvents.value.filter(e =>
    !e.DownTimeReason ||
    e.DownTimeReason === '⚠️ Sin Justificar ⚠️' ||
    e.DownTimeReason === 'Sin Justificar'
  ).length;
});

const stationWithCounts = computed(() => {
  const stations = {};

  filteredEvents.value.forEach((ev) => {
    if (!stations[ev.StationName]) {
      stations[ev.StationName] = { name: ev.StationName, count: 0 };
    }
    if (!ev.DownTimeReason || ev.DownTimeReason === "⚠️ Sin Justificar ⚠️") {
      stations[ev.StationName].count++;
    }
  });

  return Object.values(stations);
});

const selectReason = (reason) => {
  console.log("Justificar con:", reason);
};

const openCloseDowntimeDialog = (item) => {
  // <--- RECIBIMOS EL ITEM COMPLETO
  currentDowntimeItem.value = item; // <--- LO GUARDAMOS
  currentDowntimeID.value = item.DowntimeID;
  currentProductionDate.value = item.ProductionDate;
  currentStartTime.value = item.StartTime;
  selectedDowntimeType.value = item.DowntimeType;
  downtimeDurationMinutes.value = null;
  showDowntimeDialog2.value = true;
};

/**
 * 1. Calcula EndTime (StartTime + Duración en minutos).
 * 2. Llama a downtimeStore.terminarDowntime con el EndTime calculado.
 */
const closeDowntime = async () => {
  // 1. Validación de entradas
  if (
    !currentDowntimeID.value ||
    !downtimeDurationMinutes.value ||
    downtimeDurationMinutes.value <= 0
  ) {
    Notify.create({
      type: "negative",
      message: "ID o Duración inválida. Ingrese un valor positivo.",
      position: "top",
    });
    return;
  }

  isClosing.value = true;
  const durationInSeconds = downtimeDurationMinutes.value * 60;
  const inputMinutes = downtimeDurationMinutes.value;

  try {
    // 2. Convertir StartTime a objeto Date
    const startTimeObj = new Date(currentStartTime.value);

    // 3. Calcular EndTime: StartTime + Duración en minutos
    const newEndTime = new Date(startTimeObj.getTime() + inputMinutes * 60000);

    // 4. Formato ISO completo con .000Z
    const calculatedEndTime = newEndTime.toISOString();

    // 5. Llamada a la Store
    const success = await downtimeStore.terminarDowntime(
      currentDowntimeID.value,
      null, // No estamos justificando
      calculatedEndTime
    );

    if (success) {
      showDowntimeDialog2.value = false;

      // 🔹 Actualización inmediata de la UI
      if (currentDowntimeItem.value) {
        currentDowntimeItem.value.EndTime = calculatedEndTime;
        currentDowntimeItem.value.DurationSeconds = durationInSeconds;
        currentDowntimeItem.value.DurationInputMinutes = inputMinutes;
      }

      // 🔹 Guardar DowntimeID cerrado en localStorage
      let closedIDs = JSON.parse(
        localStorage.getItem("CloseDowntimeIDs") || "[]"
      );
      // Evitar duplicados
      if (!closedIDs.some((d) => d.DowntimeID === currentDowntimeID.value)) {
        closedIDs.push({
          DowntimeID: currentDowntimeID.value,
          EndTime: calculatedEndTime,
        });
      }
      localStorage.setItem("CloseDowntimeIDs", JSON.stringify(closedIDs));

      // 🔹 Actualizar downtimeEvents en localStorage
      localStorage.setItem(
        "downtimeEvents",
        JSON.stringify(downtimeEvents.value)
      );
    }
  } catch (error) {
    console.error("Error al cerrar downtime:", error);
  } finally {
    isClosing.value = false;
  }
};

const pagination = ref({
  sortBy: "DowntimeID",
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

// 🔥 Columnas de QTable
const columns = computed(() => [
  {
    name: "DowntimeID",
     label: t("unjustifyt.id"),
    field: "DowntimeID",
    align: "center",
    sortable: true,
  },
  {
    name: "DownTimeReason",
     label: t("unjustifyt.down"),
    field: "DownTimeReason",
    align: "center",
    sortable: true,
  },
  {
    name: "DowntimeType",
    label: t("unjustifyt.station"),
    field: "DowntimeType",
    align: "center",
    sortable: true,
      classes: "text-bold",
  },
  {
    name: "StationName",
    label:  t("unjustifyt.type"),
    field: "StationName",
    align: "center",
    sortable: true,
       classes: "text-bold",
  },
  {
    name: "Split",
    label: t("unjustifyt.split"),
    field: "Split",
    align: "center",
    sortable: false,
  },
  {
    name: "ProductionDate",
    label: t("unjustifyt.date"),
    field: "ProductionDate",
    align: "center",
    sortable: true,
       classes: "text-bold",
  },
  {
    name: "FULL_NAME",
    label:  t("unjustifyt.operator"),
    field: "FULL_NAME",
    align: "center",
    sortable: true,
    classes: "text-bold",
  },
  {
    name: "Shift",
    label:  t("unjustifyt.shift"),
    field: "Shift",
    align: "center",
    sortable: true,
  },
{
  name: "StartTime",
  label: t("unjustifyt.hrs"),
  field: "StartTime",
  align: "center",
  sortable: true,
     classes: "text-bold",
},
  {
    name: "EndTime",
    label: t("unjustifyt.hrf"),
    field: "EndTime",
    align: "center",
    sortable: true,
       classes: "text-bold",
  },
  {
    name: "Total",
    label:  t("unjustifyt.total"),
    field: "DurationSeconds",
    align: "center",
    sortable: true,
  },
]);

const lastUpdateDisplay = computed(() => {
  return lastUpdate.value
    ? new Date(lastUpdate.value).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";
});

const handleJustifyReason = async () => {
  const downtimeID = selectedDowntimeId.value;
  const reasonID = newReasonID.value; // El ID que seleccionó el usuario

  // Llamar al backend
  const success = await downtimeStore.changeDowntimeReasonID(
    downtimeID,
    reasonID
  );

  if (success) {
    // 1. Encontrar el objeto Reason para obtener el 'label' que se mostrará en la tabla
    const newReason = downtimeStore.downtimeReasons.find(
      (r) => r.value === reasonID
    );

    // 2. Actualizar el downtime en memoria
    if (selectedDowntimeItem.value && newReason) {
      selectedDowntimeItem.value.DownTimeReason = newReason.label;
      selectedDowntimeItem.value.ReasonID = reasonID;
    }

    // 3. 🔥 Persistir en localStorage
    localStorage.setItem(
      "downtimeEvents",
      JSON.stringify(downtimeEvents.value)
    );

    // 4. Cerrar el diálogo y resetear
    showDowntimeDialog.value = false;
    newReasonID.value = null;
  }
};

const lineNamesHeader = computed(() => {
  const names = [...new Set(filteredEvents.value.map((e) => e.LineName))];
  return names.join(", ");
});


function formatMinutesToHM(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0 min'

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes} min`
  }

  if (minutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${minutes} min`
};

const formattedDuration = computed(() => {
  if (!selectedDurationSeconds.value) return '0 h 0 min'

  const totalSeconds = selectedDurationSeconds.value
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return `${hours} h ${minutes} min`
});




// Abrir el dialogo
const openDowntimeDialog = async (item) => {
  // 1. Guardar la referencia al ITEM para poder actualizarlo después
  selectedDowntimeItem.value = item;

  selectedDowntimeId.value = item.DowntimeID;
  selectedDurationSeconds.value = item.DurationSeconds;
  selectedDowntimeType.value = item.DowntimeType;

  // 2. 🎯 CRUCIAL: Inicializar newReasonID en NULL (o 0, si ese es tu ID de 'Sin Justificar')
  // Basado en tu reporte de "Sin Justificar", null es lo más seguro.
  newReasonID.value = null;

  showDowntimeDialog.value = true;
  await downtimeStore.fetchDowntimeReasons(); // cargamos razones
};

// --- Cargar eventos ---
const cargarEventos = async () => {
  try {
    start.value = "2025-08-18";
    end.value = dayjs().format("YYYY-MM-DD");

    await downtimeStore.fetchDowntimeEventsRango(start.value, end.value);
    downtimeEvents.value = downtimeStore.downtimeEvents;
    lastUpdate.value = Date.now();
    // Guardar en localStorage
    localStorage.setItem(
      "downtimeEvents",
      JSON.stringify(downtimeEvents.value)
    );
  } catch (err) {
    console.error("Error cargando eventos:", err);
    downtimeEvents.value = [];
  }
};

// Estaciones dinámicas según línea y fecha
const stationOptions = computed(() => {
  const stations = {};
  downtimeEvents.value
    .filter((e) => !selectedLine.value || e.LineName === selectedLine.value)
    .filter(
      (e) => !selectedDate.value || e.ProductionDate === selectedDate.value
    )
    .forEach((e) => {
      if (!stations[e.StationName])
        stations[e.StationName] = { name: e.StationName, count: 0 };
      if (!e.DownTimeReason || e.DownTimeReason === "⚠️ Sin Justificar ⚠️")
        stations[e.StationName].count++;
    });

  return Object.values(stations).map((s) => ({
    label: `${s.name} (${s.count})`,
    value: s.name,
  }));
});

// Líneas con contador total de downtimes sin justificar (sin filtrar)
const lineOptions = computed(() => {
  const lines = {};
  downtimeEvents.value.forEach((e) => {
    if (!lines[e.LineName]) lines[e.LineName] = { name: e.LineName, count: 0 };

    // Contador de downtime sin justificar
    if (!e.DownTimeReason || e.DownTimeReason === "⚠️ Sin Justificar ⚠️") {
      lines[e.LineName].count++;
    }
  });

  return Object.values(lines).map((l) => ({
    label: `${l.name} (${l.count})`,
    value: l.name,
  }));
});

// Fechas dinámicas según estación y línea
const availableDatesFiltered = computed(() => {
  const dates = {};

  downtimeEvents.value
    .filter(
      (e) => !selectedStation.value || e.StationName === selectedStation.value
    )
    .filter((e) => !selectedLine.value || e.LineName === selectedLine.value)
    .forEach((e) => {
      const date = e.ProductionDate;
      if (!dates[date]) dates[date] = { name: date, count: 0 };
      if (!e.DownTimeReason || e.DownTimeReason === "⚠️ Sin Justificar ⚠️") {
        dates[date].count++;
      }
    });

  return Object.values(dates)
    .sort((a, b) =>
      dayjs(a.name, "DD/MM/YYYY").isAfter(dayjs(b.name, "DD/MM/YYYY")) ? 1 : -1
    )
    .map((d) => ({
      label: `${d.name} (${d.count})`,
      value: d.name,
    }));
});

// --- Computed para mostrar los eventos filtrados ---
const filteredEvents = computed(() => {
  return downtimeEvents.value.filter((e) => {
    // --- Filtros que ya tenías ---
    const stationOk = !selectedStation.value ||
                      e.StationName?.trim() === selectedStation.value?.trim();
    const lineOk = !selectedLine.value ||
                   e.LineName?.trim() === selectedLine.value?.trim();
    const dateOk = !selectedDate.value ||
                   e.ProductionDate === selectedDate.value;

    // --- NUEVO FILTRO: Solo Abiertos ---
    // Si filterOpenOnly es true, solo deja pasar los que NO tienen EndTime (null o vacío)
    const openOnlyOk = !filterOpenOnly.value || (!e.EndTime || e.EndTime === "");

    return stationOk && lineOk && dateOk && openOnlyOk;
  });
});

// Este valor siempre mostrará el total absoluto de registros cargados
const totalRegistrosReporte = computed(() => {
  return downtimeEvents.value.length;
});

// Ejemplo de lo que debería pasar al cerrar con éxito:
const cerrarEventoEnTabla = (id, horaFin) => {
  const evento = downtimeEvents.value.find(e => e.DowntimeID === id);
  if (evento) {
    evento.EndTime = horaFin; // Al dejar de ser null, activeEventsCount bajará solo

    // Actualiza el localstorage para que no "reviva" al F5
    localStorage.setItem("downtimeEvents", JSON.stringify(downtimeEvents.value));
  }
};

const activeEventsCount = computed(() => {
  // Filtramos la lista BASE aplicando solo los filtros de selección (Línea, Estación, Fecha)
  // Pero IGNORANDO el interruptor de "Solo Abiertos" para que el contador siempre sea veraz
  return downtimeEvents.value.filter((e) => {
    const stationOk = !selectedStation.value ||
                     e.StationName?.trim() === selectedStation.value?.trim();
    const lineOk = !selectedLine.value ||
                   e.LineName?.trim() === selectedLine.value?.trim();
    const dateOk = !selectedDate.value ||
                   e.ProductionDate === selectedDate.value;

    // Condición de Abierto (EndTime nulo o vacío)
    const isOpen = !e.EndTime || e.EndTime === "";

    return stationOk && lineOk && dateOk && isOpen;
  }).length;
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

const formatSmartDate = (start, end = null, isStartTime = false) => {
  if (!start) return "-";

  const startDate = dayjs.utc(start);
  const endDate = end ? dayjs.utc(end) : null;

  // Lógica para START TIME
  if (isStartTime) {
    if (!endDate) return startDate.format('hh:mm A');
    // Si cruzó el día, fecha completa. Si no, solo hora.
    return startDate.isSame(endDate, 'day')
      ? startDate.format('hh:mm A')
      : startDate.format('DD/MM/YYYY hh:mm A');
  }

  // Lógica para END TIME
  if (!endDate) return "-";
  return startDate.isSame(endDate, 'day')
    ? endDate.format('hh:mm A')
    : endDate.format('DD/MM/YYYY hh:mm A');
};

// Asegúrate de agregarla al return si no usas <script setup>
// return { formatSmartDate, dayjs, ... }

// --- Reloj digital ---
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

const refreshEventos = async () => {
  if (
    confirm(
      "⚠️ Al actualizar el reporte se reemplazarán los datos de la tabla.\n¿Desea continuar?"
    )
  ) {
    try {
      // Limpiar localStorage
      localStorage.removeItem("downtimeEvents");
      localStorage.removeItem("CloseDowntimeIDs");

filterOpenOnly.value = false;


      // Esperar a que termine la carga
      await cargarEventos();



      console.log("Reporte actualizado correctamente");
    } catch (error) {
      console.error("Error al refrescar eventos:", error);
      console.error("Error real:", err);
    }
  }
};


const getDowntimeIDColor = (downtimeID, endTime) => {
  // 1. PRIORIDAD: Si no tiene Hora Fin, siempre es ROJO
  if (!endTime) {
    return "negative";
  }

  // 2. Si tiene Hora Fin, revisamos el localStorage
  const closedIDs = JSON.parse(
    localStorage.getItem("CloseDowntimeIDs") || "[]"
  );

  const isSaved = closedIDs.some((d) => d.DowntimeID === downtimeID);

  // 3. Si está en la lista de "Cerrados recientemente" es VERDE, si no AZUL
  return isSaved ? "green" : "primary";
};


//Funciones Modal Split
// Total minutos para slider
const totalMinutes = computed(() =>
  selectedDowntimeFull.value
    ? Math.floor(selectedDowntimeFull.value.DurationSeconds / 60)
    : 0
);

// Abrir modal Split
const openSplitDialog = async (item) => {
  // 1. Guardar la referencia del downtime seleccionado
  selectedDowntime.value = item;
  selectedDowntimeFull.value = item;

  // 2. Inicializar valores
  selectedMinutes.value = 0;
  newReasonID.value = null;

  // 3. Cargar las razones disponibles desde el store
  await downtimeStore.fetchDowntimeReasons();

  // 4. Mostrar modal
  showSplitDialog.value = true;
};

// Ejecutar split
const handleSplitClick = async (
  selectedDowntime,
  selectedMinutes,
  newReasonID
) => {
  try {
    // 1️⃣ Llamar a la función del store y CAPTURAR EL ID del hijo de SQL
    const sqlDowntimeID = await downtimeStore.handleSplit(
      selectedDowntime,
      selectedMinutes,
      newReasonID
    );

    // Opcional: Si el backend no devuelve un ID válido, se puede detener la actualización local
    if (!sqlDowntimeID) {
      Notify.create({
        type: "negative",
        message:
          "Error: El servidor no retornó un ID válido para el evento hijo.",
      });
      // NOTA: La notificación de error del store ya se disparó.
      return;
    }

    // 2️⃣ Actualizar localStorage
    const storedEvents =
      JSON.parse(localStorage.getItem("downtimeEvents")) || [];

    // Actualizar downtime padre
    const parentIndex = storedEvents.findIndex(
      (e) => e.DowntimeID === selectedDowntime.DowntimeID
    );
    if (parentIndex !== -1) {
      storedEvents[parentIndex].DurationSeconds = selectedMinutes * 60;
      storedEvents[parentIndex].EndTime = new Date(
        new Date(storedEvents[parentIndex].StartTime).getTime() +
          selectedMinutes * 60000
      ).toISOString();
    }

    // Crear downtime hijo
    const childDowntime = {
      DowntimeID: sqlDowntimeID, // <-- ¡USANDO EL ID REAL DE SQL!
      StartTime: storedEvents[parentIndex].EndTime, // inicia cuando termina el padre
      EndTime:
        selectedDowntime.DurationSeconds * 60 > selectedMinutes * 60
          ? new Date(
              new Date(storedEvents[parentIndex].EndTime).getTime() +
                (selectedDowntime.DurationSeconds - selectedMinutes * 60) * 1000
            ).toISOString()
          : selectedDowntime.EndTime, // Usar EndTime original si no hay duración restante
      DurationSeconds: selectedDowntime.DurationSeconds - selectedMinutes * 60,
      DownTimeReason:
        downtimeStore.downtimeReasons.find((r) => r.value === newReasonID)
          ?.label || "Ninguno",
      DowntimeType: selectedDowntime.DowntimeType,
      LineName: selectedDowntime.LineName,
      StationName: selectedDowntime.StationName,
      CreatedBy: selectedDowntime.CreatedBy,

      // Campos adicionales copiados del padre (incluyendo la corrección de FULL_NAME)
      ProductionDate: selectedDowntime.ProductionDate,
      Shift: selectedDowntime.Shift,
      FULL_NAME: selectedDowntime.FULL_NAME, // <-- Asignación corregida
    };

    storedEvents.push(childDowntime);

    // Guardar en localStorage
    localStorage.setItem("downtimeEvents", JSON.stringify(storedEvents));

    // Actualizar la variable reactiva para refrescar la tabla
    downtimeEvents.value = storedEvents;

    // 3️⃣ Cerrar modal
    showSplitDialog.value = false;

    Notify.create({
      type: "positive",
      message: "Split realizado y actualizado en la tabla.",
    });
  } catch (error) {
    console.error("❌ Error en handleSplitClick:", error);
    Notify.create({
      type: "negative",
      message: "Error al realizar el split",
    });
  }
};


// 1. Referencias
const chartContainer = ref(null);
const chartInstance = ref(null);
const chartType = ref('column');

// 2. La función de actualización
const updateChart = () => {
  if (!chartContainer.value) return;

  const rawData = JSON.parse(localStorage.getItem('downtimeEvents') || '[]');

  if (!rawData || rawData.length === 0) {
    if (chartInstance.value) chartInstance.value.destroy();
    return;
  }

  const typeTotals = {};
  const stationDetails = {};

  rawData.forEach(curr => {
    const type = curr.Description || 'Sin Tipo';
    const station = curr.StationName || 'Sin Estación';

    let duration = curr.DurationSeconds;
    if (duration === null && curr.StartTime) {
      const start = dayjs.utc(curr.StartTime);
      duration = dayjs().diff(start, 'second');
    }

    const minutes = (duration || 0) / 60;

    typeTotals[type] = (typeTotals[type] || 0) + minutes;

    if (!stationDetails[type]) {
      stationDetails[type] = {};
    }
    stationDetails[type][station] = (stationDetails[type][station] || 0) + minutes;
  });

// 3. Formatear Serie Principal (Nivel 1)
const mainSeriesData = Object.entries(typeTotals).map(([name, y]) => ({
  name: name,
  y: parseFloat(y.toFixed(2)),
  drilldown: name,
  // 🔥 Agregamos el número de estaciones únicas para este tipo
  stationCount: stationDetails[name] ? Object.keys(stationDetails[name]).length : 0
})).sort((a, b) => b.y - a.y);

  const drilldownSeries = Object.entries(stationDetails).map(([typeName, stations]) => ({
    name: typeName,
    id: typeName,
    data: Object.entries(stations)
      .map(([stName, stY]) => [stName, parseFloat(stY.toFixed(2))])
      .sort((a, b) => b[1] - a[1])
  }));


  chartInstance.value = Highcharts.chart(chartContainer.value, {
    chart: {
      type: chartType.value,
      backgroundColor: 'transparent',
    },
    // 🔥 Paleta de colores más oscuros y profesionales
    colors: [
      '#1A237E', // Indigo Dark
      '#004D40', // Teal Dark
      '#1B5E20', // Green Dark
      '#E65100', // Orange Dark
      '#B71C1C', // Red Dark
      '#311B92', // Deep Purple
      '#212121'  // Grey Dark
    ],
    title: { text: null },
   xAxis: {
      type: 'category',
      labels: {
        rotation: -45,
        style: {
          fontSize: '11px',
          color: '#333333' // Un gris oscuro profesional en lugar de azul
        }
      }
    },
    yAxis: {
      title: { text: 'Minutos Totales' },
      min: 0
    },
plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y:.1f}',
          // 🔥 Limpiamos los estilos para que se vea normal
          style: {
            fontSize: '13px',
            fontWeight: '600',
            color: '#333333',     // Un gris oscuro/negro limpio
            textOutline: 'none',  // ❌ Esto elimina el borde azul/negro que causa el error
            textShadow: 'none'    // ❌ Eliminamos cualquier sombra extra
          },
          // Si quieres que el texto flote sobre la barra y no se mezcle:
          y: -10
        }
      },
      pie: {
        innerSize: '50%',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y:.1f}',
          style: {
            textOutline: 'none' // También quitamos el borde aquí
          }
        }
      }
    },
    series: [{
      name: 'Station Types',
      colorByPoint: true,
      data: mainSeriesData
    }],
    drilldown: {
      activeAxisLabelStyle: { textDecoration: 'none', fontStyle: 'italic', color: '#1A237E' },
      series: drilldownSeries
    },
   tooltip: {
  headerFormat: '<span style="font-size:11px; color:#666">{series.name}</span><br>',
  pointFormat: `
    <span style="color:{point.color}">●</span> <b>{point.name}</b><br/>
    Tiempo: <b>{point.y:,.2f} min</b><br/>
    Estaciones: <b>{point.stationCount}</b>
  `
},
    credits: { enabled: false },
    accessibility: { enabled: false }
  });
};

// 3. 🔥 ESTA ES LA FUNCIÓN QUE TE MARCA ERROR (Asegúrate que esté aquí adentro)
const changeChartType = (newType) => {
  console.log("Cambiando a:", newType);
  chartType.value = newType;

  if (chartInstance.value) {
    chartInstance.value.update({
      chart: {
        type: newType
      },
      // 🔥 Esto es lo que recupera los nombres de las estaciones
      xAxis: {
        type: 'category',
        labels: {
          enabled: true
        }
      }
    }, true, true); // Los parámetros true aseguran que redibuje y mantenga la configuración 1 a 1
  }
};

onMounted(() => {
    updateChart();
  updateMaxLabels();
  window.addEventListener("resize", updateMaxLabels);
  mostrarHora();
  intervaloId = setInterval(mostrarHora, 1000);

  const cached = localStorage.getItem("downtimeEvents");
  if (cached) {
    downtimeEvents.value = JSON.parse(cached);
  } else {
    cargarEventos();
  }
});

onUnmounted(() => clearInterval(intervaloId));

watch(activeEventsCount, (newCount) => {
  if (newCount === 0) {
    filterOpenOnly.value = false;
  }
});

// Recalcula cuando cambie totalMinutes (p. ej. nuevo downtime)
watch(totalMinutes, () => {
  updateMaxLabels();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateMaxLabels);
});

// Formato: SOLO minutos (ej: "0", "60", "120", etc.)
const formatLabel = (mins) => String(mins);

// Genera marker-labels respetando máximo de etiquetas y siempre incluyendo 0 y el final
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

// --- Función para limpiar filtros ---
const clearFilters = () => {
  selectedStation.value = null;
  selectedLine.value = null;
  selectedDate.value = null;
};
</script>

<style scoped>
.scrollable-table-container {
  max-height: 75vh;
  overflow-y: auto;
}
.custom-trackingrow {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  padding: 0.5rem 0;
}
:deep(.custom-header th) {
  background-color: #003153 !important;
  color: white !important;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}

/* Celdas de tabla */
.tracking-cell {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  white-space: normal;
  overflow: visible;
}

.custom-trackingrow:hover {
  background-color: #f5f5f5;
  transition: background-color 0.2s;
}

/* Zebra striping */
.custom-trackingrow:nth-child(even):not(.custom-header) {
  background-color: #e9eef5;
}

/* Hover animado */
.custom-trackingrow:hover:not(.custom-header) {
  background-color: #d0e4ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Anchos específicos por columna */
.downtime-reason-cell {
  flex: 2;
  min-width: 120px;
  max-width: 200px;
}
.job-number-cell {
  flex: 2;
  min-width: 100px;
  max-width: 150px;
}
.station-id-cell {
  flex: 1;
  min-width: 80px;
  max-width: 180px;
}
.line-cell {
  flex: 1;
  min-width: 60px;
  max-width: 160px;
}
.production-date-cell {
  flex: 1.5;
  min-width: 100px;
  max-width: 200px;
}
.operator-cell {
  flex: 3;
  min-width: 180px;
  max-width: 350px;
  text-align: center;
}
.turno-cell {
  flex: 0.8;
  min-width: 10px;
  max-width: 100px;
}
.hora-inicio-cell {
  flex: 1.5;
  min-width: 90px;
  max-width: 250px;
}
.duracion-minutos-cell {
  flex: 1;
  min-width: 80px;
  max-width: 150px;
}
.downtime-summary {
  padding: 1rem;
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

.rounded-btn {
  border-radius: 10px;
  font-weight: bold;
  font-size: 13px;
  padding: 6px 12px; /* Controla el espacio interno horizontal y vertical */
  width: auto; /* Se adapta al contenido */
  min-width: unset; /* Elimina el tamaño mínimo forzado */
  border: 2px solid white;
}

/* Etiquetas más pequeñas y sin wrap para mejorar legibilidad */
.q-slider__marker-label {
  font-size: 0.75rem;
  white-space: nowrap;
  transform: translateY(6px);
  padding: 0 4px;
  max-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* Forzar el estilo del encabezado */
:deep(.downtime-qtable thead tr th) {
  background-color: #003153 !important; /* Azul oscuro */
  color: white !important;
  font-weight: 900 !important; /* Grosor máximo */
  font-size: 14px !important;
}

/* Asegurar que el texto dentro del th sea negrita */
:deep(.downtime-qtable .q-table__th) {
  font-weight: 900 !important;
}

/* Los iconos de las flechitas de orden también deben ser blancos */
:deep(.downtime-qtable .q-table__sort-icon) {
  color: white !important;
  opacity: 1 !important;
}

/*q-card clickeable*/

.clickable-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  will-change: transform, box-shadow;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
}

.action-icon {
  transition: transform 0.15s ease;
}

.clickable-card:hover .action-icon {
  transform: translateX(3px);
}


.chart-card {
  border-radius: 8px;
  background-color: #ffffff;
}

/* Aquí controlas el alto de la gráfica */
.highcharts-wrapper {
  width: 100%;
  height: 600px; /* <--- Cambia este valor al alto que desees */
  min-height: 300px;
}

/* Ajuste opcional para pantallas pequeñas (móviles) */
@media (max-width: 600px) {
  .highcharts-wrapper {
    height: 350px;
  }
}
</style>
