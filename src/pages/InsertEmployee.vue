<template>
  <q-page class="q-pa-md page-background">
    <div class="row justify-center q-col-gutter-xl">
      <!-- Columna izquierda: Registro de Operador -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="operator-card shadow-2 hover-card">
          <!-- Encabezado -->
          <div
            class="row items-center q-pa-sm text-white rounded-t-borders"
            style="background-color: #1565c0"
          >
            <q-avatar size="42px" class="q-mr-md">
              <img src="/img/AFL_Logo.svg" />
            </q-avatar>
            <div class="text-h5 text-weight-bold">
              {{ $t("operators.operatorReg") }}
            </div>
          </div>

          <!-- Campos -->
          <q-card-section>
            <q-input
              v-model="employeeNumber"
              :label="$t('operators.empNumber')"
              filled
              dense
              lazy-rules
              :rules="[
                (val) => !!val || 'Campo Numérico Obligatorio',
                (val) => /^\d+$/.test(val) || 'Solo se permiten números',
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="fullName"
              :label="$t('operators.fullName')"
              filled
              dense
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="description"
              :label="$t('operators.description')"
              filled
              dense
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>
          </q-card-section>

          <!-- Botones -->
          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              class="rounded-btn"
              icon="cleaning_services"
              :label="$t('operators.clear')"
              color="grey-6"
              @click="clearFields"
            />
            <q-btn
              class="rounded-btn"
              :label="$t('operators.save')"
              icon="save"
              color="primary"
              :loading="isSaving"
              @click="saveEmployee"
              glossy
            />
          </q-card-actions>
        </q-card>

        <!-- Nuevo recuadro de Búsqueda de Operador -->
        <q-card flat bordered class="operator-card shadow-2 hover-card q-mt-xl">
          <div
            class="row items-center q-pa-sm text-white rounded-t-borders"
            style="background-color: #1565c0"
          >
            <q-avatar size="42px" class="q-mr-md">
              <img src="/img/AFL_Logo.svg" />
            </q-avatar>
            <div class="text-h5 text-weight-bold">
              {{ $t("operators.searchOperator") }}
            </div>
          </div>

          <q-card-section class="q-pa-sm">
            <q-input
              v-model="searchBadge"
              :label="$t('operators.empNumber')"
              filled
              dense
              lazy-rules
              :rules="[(val) => !!val || 'Ingrese un número de empleado']"
              @keyup.enter="searchEmployee"
            >
              <!-- Ícono a la izquierda -->
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" />
              </template>

              <!-- Botones a la derecha -->
              <template v-slot:append>
                <q-btn
                  round
                  dense
                  flat
                  icon="search"
                  color="primary"
                  @click="searchEmployee"
                />
              </template>
            </q-input>

            <div
              v-if="employeeInfo"
              class="q-mt-sm q-pa-sm bg-grey-2 rounded-borders"
            >
              <div class="row q-col-gutter q-mb-xs">
                <b class="col-auto">Número:</b>
                <div class="col q-ml-sm">
                  {{ employeeInfo.EMPLOYEE_NUMBER }}
                </div>
              </div>

              <!-- Nombre editable -->
              <div class="row q-col-gutter q-mb-xs items-center">
                <b class="col-auto">Nombre:</b>
                <div v-if="!editMode" class="col q-ml-sm">
                  {{ employeeInfo.EMPLOYEE_FULL_NAME }}
                </div>
                <q-input
                  v-else
                  v-model="editableName"
                  dense
                  outlined
                  class="col"
                  @keyup.enter="saveChanges"
                />
              </div>

              <!-- Puesto editable -->
              <div class="row q-col-gutter items-center">
                <b class="col-auto">Puesto:</b>
                <div v-if="!editMode" class="col q-ml-sm">
                  {{ employeeInfo.HR_JOBS_DESC }}
                </div>
                <q-input
                  v-else
                  v-model="editablePosition"
                  dense
                  outlined
                  class="col"
                  @keyup.enter="saveChanges"
                />
              </div>

              <!-- Botones Guardar / Cancelar -->
              <div v-if="editMode" class="q-mt-sm row justify-end q-gutter-sm">
                <q-btn color="green" label="Guardar" @click="saveChanges" />
                <q-btn color="red" label="Cancelar" @click="cancelEdit" />
              </div>
            </div>
          </q-card-section>
          <q-card-actions v-if="employeeInfo" align="right" class="q-pa-md">
            <q-btn
              label="Limpiar"
              color="grey-6"
              icon="cleaning_services"
              class="rounded-btn q-ml-xs"
              @click="clearSearch"
              glossy
            />
            <q-btn
              label="Editar"
              icon="edit"
              color="primary"
              class="rounded-btn q-ml-sm"
              @click="toggleEdit()"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Columna derecha: Tabla de operadores registrados -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="operator-card shadow-2 hover-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6 text-primary row items-center">
                <img
                  src="/img/AFL.png"
                  alt="Logo AFL"
                  class="q-mr-sm"
                  style="width: 2em; height: 2.5em"
                />
                <span class="text-weight-medium">{{
                  $t("operators.title")
                }}</span>
              </div>

              <div class="row items-center q-gutter-sm">
                <q-chip
                  color="primary"
                  text-color="white"
                  outline
                  class="text-weight-bold"
                >
                  {{ $t("operators.totalRecords") }} {{ employees.length }}
                </q-chip>

                <q-btn
                  icon="cleaning_services"
                  color="negative"
                  :label="$t('operators.clearTable')"
                  size="sm"
                  unelevated
                  class="text-weight-bold rounded-btn"
                  @click="confirmClearTable"
                />
              </div>
            </div>
          </q-card-section>

          <div class="table-container">
            <q-table
              :rows="employees"
              :columns="columns"
              row-key="employeeNumber"
              flat
              bordered
              class="styled-table"
              :pagination="{ page: 1, rowsPerPage: 0 }"
              :rows-per-page-options="[]"
            >
              <template v-slot:no-data>
                <div
                  class="q-pa-lg flex column text-grey-7 no-data-container no-data-bottom animated-no-data"
                >
                  <q-icon
                    name="hourglass_empty"
                    size="64px"
                    color="orange-6"
                    class="pulse-icon"
                  />
                  <div
                    class="text-subtitle1 q-mt-sm text-weight-medium text-orange-10"
                  >
                    {{ $t("operators.noRecords") }}
                  </div>
                  <div class="text-grey-7 text-weight-bold fade-in">
                    {{ $t("operators.waiting") }}
                  </div>
                </div>
              </template>

              <template v-slot:body-cell-index="props">
                <q-td class="text-grey-8 text-weight-medium">{{
                  props.rowIndex + 1
                }}</q-td>
              </template>

              <!-- 1. Lógica Condicional de Botones de Acción -->
              <template v-slot:body-cell-actions="props">
                <q-td class="text-center">
                  <!-- Modo Edición: Muestra Guardar/Cancelar -->
                  <div
                    v-if="editRow === props.row.employeeNumber"
                    class="flex justify-center"
                  >
                    <q-btn
                      color="green"
                      icon="save"
                      dense
                      round
                      class="q-mr-sm"
                      @click="saveRowChanges"
                    >
                      <q-tooltip>Grabar</q-tooltip>
                    </q-btn>
                    <q-btn
                      color="red"
                      dense
                      round
                      icon="close"
                      @click="editRow = null"
                    >
                      <q-tooltip>{{ $t("common.cancel") }}</q-tooltip>
                    </q-btn>
                  </div>
                  <!-- Modo Normal: Muestra Editar/Eliminar -->
                  <div v-else class="flex justify-center">
                    <q-btn
                      icon="edit"
                      color="primary"
                      size="sm"
                      round
                      class="q-mr-sm"
                      dense
                      @click="toggleEditRow(props.row)"
                    >
                      <q-tooltip>Editar Registro</q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="delete"
                      color="negative"
                      size="sm"
                      unelevated
                      round
                      dense
                      @click="handleDeleteEmployee(props.row.employeeNumber)"
                    >
                      <q-tooltip>Eliminar Registro</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </template>

              <!-- 2. Columna Nombre (Solo Input en Modo Edición) -->
              <template v-slot:body-cell-fullName="props">
                <q-td>
                  <div v-if="editRow === props.row.employeeNumber">
                    <!-- Asegúrate que esta variable coincida con tu script (editableName vs editablerowName) -->
                    <q-input
                      v-model="editablerowName"
                      dense
                      outlined
                      @keyup.enter="saveRowChanges"
                    />
                  </div>
                  <div v-else>
                    {{ props.row.fullName }}
                  </div>
                </q-td>
              </template>

              <!-- 3. Columna Descripción (Solo Input en Modo Edición) -->
              <template v-slot:body-cell-description="props">
                <q-td>
                  <div v-if="editRow === props.row.employeeNumber">
                    <q-input
                      v-model="editableDescription"
                      dense
                      outlined
                      @keyup.enter="saveRowChanges"
                    />
                    <!-- ¡Botones Eliminados de aquí! -->
                  </div>
                  <div v-else>
                    {{ props.row.description }}
                  </div>
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card>
      </div>
    </div>
    <template v-slot:body-cell-fullName="props">
      <q-td>
        <div v-if="editRow === props.row.employeeNumber">
          <q-input v-model="editableName" dense outlined />
        </div>
        <div v-else>
          {{ props.row.fullName }}
        </div>
      </q-td>
    </template>
    <div>
      <LanguageToggle />
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useReportStore } from "src/stores/ReportStore";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import LanguageToggle from "src/components/LanguageToggle.vue";

const $q = useQuasar();
const store = useReportStore();
const { t } = useI18n();

// Campos del formulario
const employeeNumber = ref("");
const fullName = ref("");
const description = ref("");

// Estado del botón
const isSaving = ref(false);

// Lista de empleados (tabla)
const employees = ref([]);

// 🔹 Variables reactivas
const searchBadge = ref("");
const employeeInfo = ref(null);
const editMode = ref(false);
const editableName = ref("");
const editablePosition = ref("");

// Fila que estamos editando
const editRow = ref(null);
const editablerowName = ref("");
const editableDescription = ref("");

// Función para activar edición en la fila seleccionada
const toggleEditRow = (row) => {
  editRow.value = row.employeeNumber; // marca la fila activa
  editablerowName.value = row.fullName;
  editableDescription.value = row.description;
};

// Guardar cambios para la fila
const saveRowChanges = async () => {
  if (!editRow.value) return;

  const row = employees.value.find((r) => r.employeeNumber === editRow.value);
  if (!row) return;

  // Actualiza localmente
  row.fullName = editablerowName.value;
  row.description = editableDescription.value;

  // --- Actualiza en localStorage ---
  const storedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
  const index = storedEmployees.findIndex(
    (emp) => emp.employeeNumber === row.employeeNumber
  );

  if (index !== -1) {
    // Actualiza los valores que cambian
    storedEmployees[index].fullName = editablerowName.value;
    storedEmployees[index].description = editableDescription.value;
    localStorage.setItem("employees", JSON.stringify(storedEmployees));
  }

  // Actualiza en DB
  try {
    await store.updateEmployee(
      row.employeeNumber,
      editablerowName.value,
      editableDescription.value
    );
  } catch (err) {
    console.error("Error al actualizar en DB:", err);
  }

  editRow.value = null;
};

// Limpiar contenedor de busqueda
const clearSearch = () => {
  searchBadge.value = "";
  employeeInfo.value = null;
  editMode.value = false;
  editableName.value = "";
  editablePosition.value = "";
};

// 🧾 Columnas de la tabla
const columns = computed(() => [
  {
    name: "employeeNumber",
    label: t("operators.empNumber"),
    align: "center",
    field: "employeeNumber",
  },
  {
    name: "fullName",
    label: t("operators.fullName"),
    align: "center",
    field: "fullName",
  },
  {
    name: "description",
    label: t("operators.description"),
    align: "center",
    field: "description",
  },
  {
    name: "actions",
    label: t("operators.actions"),
    align: "center",
    field: "actions",
  },
]);

// Limpiar campos
function clearFields() {
  employeeNumber.value = "";
  fullName.value = "";
  description.value = "";
}

// Busqueda de operador
// 🔹 Función para buscar empleado
async function searchEmployee() {
  if (!searchBadge.value) {
    $q.notify({ type: "warning", message: "Ingrese un número de empleado" });
    return;
  }

  // --- Validación contra empleados registrados manualmente ---
  const storedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
  const exists = storedEmployees.some(
    (emp) => emp.employeeNumber === searchBadge.value
  );

  if (exists) {
    $q.notify({
      type: "warning",
      message:
        'El número de Operador se encuentra en la lista de "Operadores Registrados Manualmente"',
    });
    return; // No continuar con la búsqueda
  }

  // --- Lógica original ---
  const result = await store.fetchEmployee(searchBadge.value);

  if (result && result.length > 0) {
    employeeInfo.value = {
      EMPLOYEE_NUMBER: result[0].EMPLOYEE_NUMBER,
      EMPLOYEE_FULL_NAME: result[0].EMPLOYEE_FULL_NAME,
      HR_JOBS_DESC: result[0].HR_JOBS_DESC,
    };
  } else {
    employeeInfo.value = null;
    $q.notify({ type: "negative", message: "No se encontró el empleado" });
  }
}

// Activa el modo edición y copia los valores
const toggleEdit = () => {
  if (!employeeInfo.value) return;
  editMode.value = true;
  editableName.value = employeeInfo.value.EMPLOYEE_FULL_NAME;
  editablePosition.value = employeeInfo.value.HR_JOBS_DESC;
};

// Guardar cambios
const saveChanges = async () => {
  if (!employeeInfo.value) return;

  // Actualiza localmente
  employeeInfo.value.EMPLOYEE_FULL_NAME = editableName.value;
  employeeInfo.value.HR_JOBS_DESC = editablePosition.value;

  editMode.value = false;

  // Actualiza en la base de datos usando el store
  try {
    await store.updateEmployee(
      employeeInfo.value.EMPLOYEE_NUMBER,
      editableName.value,
      editablePosition.value
    );

    // --- Guardar o actualizar en localStorage ---
    const storedEmployees = JSON.parse(localStorage.getItem("employees")) || [];

    // Verificar si el empleado ya existe
    const index = storedEmployees.findIndex(
      (emp) => emp.employeeNumber === employeeInfo.value.EMPLOYEE_NUMBER
    );

    if (index !== -1) {
      // Si existe, actualiza sus datos
      storedEmployees[index].fullName = editableName.value;
      storedEmployees[index].description = editablePosition.value;
    } else {
      // Si no existe, lo agrega
      storedEmployees.push({
        employeeNumber: employeeInfo.value.EMPLOYEE_NUMBER,
        fullName: editableName.value,
        description: editablePosition.value,
      });
    }

    // Guardar nuevamente en localStorage
    localStorage.setItem("employees", JSON.stringify(storedEmployees));

    clearSearch();

    // 5️⃣ Actualizar tabla reactiva
    employees.value = storedEmployees;
  } catch (err) {
    console.error("Error al actualizar en DB:", err);
  }
};

// Cancelar edición
const cancelEdit = () => {
  editMode.value = false;
};

// 🔹 Confirmar antes de limpiar toda la tabla
function confirmClearTable() {
  $q.dialog({
    title: "Confirmar eliminación",
    message:
      "¿Estás seguro de que deseas borrar todos los registros? Esta acción no se puede deshacer.",
    cancel: true,
    persistent: true,
    ok: {
      label: "Sí, borrar",
      color: "negative",
    },
    cancel: {
      label: "Cancelar",
      color: "primary",
      flat: true,
    },
  }).onOk(() => {
    clearTableData();
  });
}

// 🔹 Limpiar los datos de la tabla y del localStorage
function clearTableData() {
  localStorage.removeItem("employees");
  employees.value = [];

  $q.notify({
    type: "positive",
    message: "La tabla ha sido limpiada correctamente.",
    position: "top",
    timeout: 2000,
  });
}

// Limpia caracteres no numéricos al escanear o escribir
watch(employeeNumber, (val) => {
  employeeNumber.value = val.replace(/\D/g, "");
});

// ✅ Función saveEmployee corregida
const saveEmployee = async () => {
  // 1️⃣ Validación de campos obligatorios
  if (
    !employeeNumber.value?.trim() ||
    !fullName.value?.trim() ||
    !description.value?.trim()
  ) {
    $q.notify({
      color: "negative",
      message: "Por favor llena todos los campos antes de guardar.",
      position: "top",
    });
    return;
  }

  // 💡 Nuevo: Prepara el objeto para la confirmación
  const newEmployeeData = {
    employeeNumber: employeeNumber.value,
    fullName: capitalizeWords(fullName.value),
    description: toUpperCaseText(description.value),
  };

  // 1.5 🔒 Diálogo de Confirmación
$q.dialog({
  title: t("employeeRegister.title"),
  message: `
    <p class="text-bold">
      ${t("employeeRegister.confirmQuestion")}
    </p>
    <p class="q-mt-sm"></br>
      ${t("employeeRegister.validateMessage")}
    </p>
    <ul>
      <li>
        <strong>${t("employeeRegister.labels.operator")}:</strong>
        ${newEmployeeData.employeeNumber}
      </li>
      <li>
        <strong>${t("employeeRegister.labels.name")}:</strong>
        ${newEmployeeData.fullName}
      </li>
      <li>
        <strong>${t("employeeRegister.labels.description")}:</strong>
        ${newEmployeeData.description}
      </li>
    </ul>
    <p class="text-bold text-amber-10 q-mt-sm">
      ${t("employeeRegister.warning")}
    </p>
  `,
  html: true,
  cancel: true,
  ok: {
    label: t("common.yesRegister"),
    color: "positive",
  },
  cancel: {
    label: t("common.cancel"),
    color: "grey",
  },
  persistent: true,
})

    .onOk(async () => {
      // ⬇️ TODO EL CONTENIDO ORIGINAL DE LA FUNCIÓN SE MUEVE AQUÍ
      isSaving.value = true;

      try {
        // 2️⃣ Usar el objeto ya construido
        const newEmployee = newEmployeeData;

        // 3️⃣ Llamada al Store para guardar en SQL
        const result = await store.insertEmployee(newEmployee);

         if (!result.success) {
      $q.notify({
        color: "warning",
        message:
          result.message ||
          t("employeeRegister.notifications.saveWarning"),
        position: "top",
      });
      return;
    }

        // 4️⃣ Guardar en localStorage (NOTA: Revisar las directivas sobre el uso de DB vs LocalStorage)
        const storedEmployees =
          JSON.parse(localStorage.getItem("employees")) || [];

        const existsIndex = storedEmployees.findIndex(
          (emp) => emp.employeeNumber === newEmployee.employeeNumber
        );

        if (existsIndex >= 0) {
          storedEmployees[existsIndex] = newEmployee;
        } else {
          storedEmployees.push(newEmployee);
        }

        localStorage.setItem("employees", JSON.stringify(storedEmployees));

        // 5️⃣ Actualizar tabla reactiva
        employees.value = storedEmployees;

        // 6️⃣ Notificación de éxito
        $q.notify({
      color: "positive",
      message: t("employeeRegister.notifications.saveSuccess"),
      position: "top",
    });

        // 7️⃣ Limpiar campos
        clearFields();
      } catch (error) {
        console.error("Error al guardar el empleado:", error);
        $q.notify({
      color: "negative",
      message: t("employeeRegister.notifications.saveError"),
      position: "top",
    });
      } finally {
        // Se restablece isSaving.value = false, ya sea que haya éxito o error
        isSaving.value = false;
      }
      // ⬆️ FIN DEL CONTENIDO ORIGINAL
    })
    .onCancel(() => {
      // No hacemos nada si cancela, pero puedes agregar un notify si lo deseas
      $q.notify({
    color: "info",
    message: t("employeeRegister.notifications.cancelled"),
    position: "top",
    timeout: 1000,
  });
    });
  // 💡 IMPORTANTE: Si el diálogo está activo, isSaving.value debe permanecer false hasta que haga clic en OK.
};

// Nueva función para eliminar
const handleDeleteEmployee = (employeeNumToDelete) => {
  $q.dialog({
  title: t("employeeRegister.delete.title"),
  message: t("employeeRegister.delete.message", {
    employeeNumber: employeeNumToDelete,
  }),
  cancel: true,
  persistent: true,
}).onOk(() => {
    // 1️⃣ Elimina de la lista local
    employees.value = employees.value.filter(
      (emp) => emp.employeeNumber !== employeeNumToDelete
    );

    // 2️⃣ Actualiza localStorage con la lista filtrada
    localStorage.setItem("employees", JSON.stringify(employees.value));

    // 3️⃣ Notificación de éxito
    $q.notify({
  color: "positive",
  position: "top",
  message: t("employeeRegister.notifications.deleteSuccess", {
    employeeNumber: employeeNumToDelete,
  }),
  icon: "check_circle",
  timeout: 2500,
});

  });
};

// Cargar datos del localStorage al iniciar
onMounted(() => {
  const stored = JSON.parse(localStorage.getItem("employees")) || [];
  employees.value = stored;
});

function capitalizeWords(text) {
  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
function toUpperCaseText(text) {
  return text.toUpperCase();
}
</script>

<style>
.operator-card {
  box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.25);
  background-color: #ffffff;
  transition: all 0.3s ease-in-out;
}
.operator-card .text-body1 {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.operator-card {
  background-color: rgba(
    255,
    255,
    255,
    0.95
  ); /* Fondo semitransparente para mejor visibilidad */
  border-radius: 12px;
}

.operator-card:hover {
  border-color: #1565c0;
  box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.3);
}

.rounded-btn {
  border-radius: 10px;
  font-weight: bold;
  font-size: 14px;
  padding: 6px 12px;
  width: auto;
  min-width: unset;
}

.page-background {
  background: linear-gradient(to bottom, #f5f7fa, #c3cfe2);
  /*background-image: url("/img/AFL_Background.jpg");*/
  background-size: auto;
  background-position: center 85%; /* O center 30%, bottom, etc. */
  background-repeat: no-repeat;

  min-height: 100vh;
}

/* Diseño Q-TABLE */
.table-container {
  height: calc(
    100vh - 250px
  ); /* Ajusta 250px según el alto del formulario y encabezado */
  overflow-y: auto;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  background-color: #fafafa;
}

/* Cabecera */
.styled-table thead tr {
  background-color: #1565c0;

  color: white;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Celdas */
.styled-table td {
  transition: background-color 0.2s ease;
}

/* Zebra stripes */
.styled-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}
.styled-table tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

/* Hover row */
.styled-table tbody tr:hover {
  background-color: #e8f4fd !important;
  cursor: pointer;
}

/* Botón de eliminar */
.styled-table .q-btn {
  transition: transform 0.15s ease;
}

.styled-table .q-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .table-container {
    font-size: 13px;
    padding: 0.5rem;
  }
}

/* --- Base general (mantiene tu funcionalidad actual y agrega estilo) --- */
.no-data-container {
  position: relative; /* se posiciona dentro del área de la tabla */
  top: 50%;
  left: 40%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  transition: transform 0.3s ease;
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

/* --- Efecto pulse en el ícono --- */
.pulse-icon {
  animation: pulse 2.5s infinite cubic-bezier(0.4, 0, 0.6, 1);
}

/* --- Animación de pulso del ícono --- */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* --- Animación de entrada suave (fade + slide) --- */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Animación opcional para texto secundario --- */
.fade-in {
  animation: fadeInText 1.5s ease-in-out;
}

@keyframes fadeInText {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
