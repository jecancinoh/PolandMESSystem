import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from "dayjs";
import { api } from "src/boot/axios";
import { createI18n } from "vue-i18n";
import i18n from "src/i18n"; // or from "src/i18n/index.js" if using default export

export const useOperatorStore = defineStore("operator", () => {

  const activeOperators = ref([]);
  const scannedOperators = ref([]);

  /**
   * @action isLoggedIn
   * @description Nos dice si hay al menos un operador que ya inició sesión.
   */
  const isLoggedIn = computed(() => activeOperators.value.length > 0);

  /**
   * @action
   * @description
   * @param {string} badgeId
   * @returns {object}
   */
  const scanOperatorBadge = async (badgeId) => {
    let employeeData = null;
    let status = i18n.global.t("operator.noResults"); // "no registrado"
    let fullName = i18n.global.t("operator.status"); // "Usuario no registrado"
    let employeeId = null;

    try {
      const response = await api.get(`/getEmp/${badgeId}`);
      employeeData = response.data[0];

      if (employeeData && employeeData.EMPLOYEE_NUMBER) {
        fullName = employeeData.EMPLOYEE_FULL_NAME;
        employeeId = employeeData.EMPLOYEE_NUMBER;
        status = "registered";
      } else {
        if (employeeData) {
          console.warn(
            `[OperatorStore] API returned data for badge "${badgeId}", but EMPLOYEE_NUMBER is missing or null. EmployeeData:`,
            employeeData
          );
        } else {
          console.warn(
            `[OperatorStore] No employee data found for badge "${badgeId}". Response data:`,
            response.data
          );
        }
        status = i18n.global.t("operator.status");
      }
    } catch (error) {
      console.error(
        `Error fetching employee info for badge ${badgeId}:`,
        error
      );
      status = "error";
      fullName = "Error de conexión/API";
    }

    const scanTime = dayjs().format("HH:mm:ss A");

    const existingOperatorIndex = scannedOperators.value.findIndex(
      (op) => op.id === badgeId
    );

    if (existingOperatorIndex !== -1) {
      // Si el badge ya fue escaneado, actualiza su información y se mueve al principio
      const existingOperator = scannedOperators.value[existingOperatorIndex];
      existingOperator.name = fullName;
      existingOperator.status = status;
      existingOperator.scanTime = scanTime;
      existingOperator.employeeId = employeeId;
      scannedOperators.value.splice(existingOperatorIndex, 1);
      scannedOperators.value.unshift(existingOperator);
    } else {
      // Si es un badge nuevo, se pone al principio de la lista
      scannedOperators.value.unshift({
        id: badgeId,
        name: fullName,
        scanTime: scanTime,
        status: status,
        employeeId: employeeId,
      });
    }

    // Limita la lista de scannedOperators a los últimos 10 para evitar que crezca indefinidamente
    if (scannedOperators.value.length > 10) {
      scannedOperators.value.pop(); // Elimina el más antiguo
    }

    // Retorna el estado y el nombre completo para que el componente pueda disparar notificaciones
    return { status, fullName, employeeId };
  };

  /**
   * @action confirmOperatorsLogin
   * @description Confirma qué operadores escaneados pueden iniciar sesión y los guarda como activos.
   * @param {Array<object>} operatorsToConfirm - La lista de operadores escaneados que se quieren confirmar.
   */
  const confirmOperatorsLogin = (operatorsToConfirm) => {
    // Filtra solo los operadores con estado 'registered' Y que tienen un employeeId válido
    activeOperators.value = operatorsToConfirm.filter(
      (op) => op.status === "registered" && op.employeeId != null
    );

    // Persiste los objetos de los operadores activos en localStorage
    localStorage.setItem(
      "MES_ActiveOperators",
      JSON.stringify(activeOperators.value)
    );
  };

  /**
   * @action removeScannedOperator
   * @description Quita a un operador de la lista de los que se escanearon.
   * @param {string} badgeId - El ID de la credencial del operador a quitar.
   */
  const removeScannedOperator = (badgeId) => {
    scannedOperators.value = scannedOperators.value.filter(
      (op) => op.id !== badgeId
    );
    localStorage.setItem(
      "MES_ScannedOperators",
      JSON.stringify(scannedOperators.value)
    );
  };

  /**
   * @action logout
   * @description Cierra la sesión de todos los operadores y borra su información guardada.
   */
  const logout = () => {
    activeOperators.value = [];
    scannedOperators.value = []; // También limpia la lista de escaneados al desloguear
    localStorage.removeItem("MES_ActiveOperators");
    localStorage.removeItem("MES_ScannedOperators");
  };

  /**
   * @action loadStateFromLocalStorage
   * @description Carga la información de los operadores activos y escaneados que se guardó antes.
   * Se llama automáticamente al iniciar la aplicación.
   */
  const loadStateFromLocalStorage = () => {
    const savedActiveOperators = localStorage.getItem("MES_ActiveOperators");
    if (savedActiveOperators) {
      try {
        const parsedOperators = JSON.parse(savedActiveOperators);
        // Filtra para asegurar que solo objetos válidos (con employeeId) se añadan
        activeOperators.value = parsedOperators.filter(
          (op) =>
            op && op.id != null && op.name != null && op.employeeId != null
        );
      } catch (e) {
        console.error("Error parsing MES_ActiveOperators from localStorage", e);
        activeOperators.value = [];
      }
    }

    const savedScannedOperators = localStorage.getItem("MES_ScannedOperators");
    if (savedScannedOperators) {
      try {
        scannedOperators.value = JSON.parse(savedScannedOperators);
      } catch (e) {
        console.error(
          "Error parsing MES_ScannedOperators from localStorage",
          e
        );
        scannedOperators.value = [];
      }
    }
  };

  // Llama a la función para cargar el estado al inicializar el store
  loadStateFromLocalStorage();

  return {
    activeOperators,
    scannedOperators,
    isLoggedIn,
    scanOperatorBadge,
    confirmOperatorsLogin,
    removeScannedOperator,
    logout,
  };
});
