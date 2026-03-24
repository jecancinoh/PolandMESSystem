import { defineStore } from "pinia";
import i18n from "src/i18n";
import { Notify } from "quasar";
import { api } from "src/boot/axios";
import { ref } from "vue";

export const usePrintStore = defineStore("print", () => {
  const t = i18n.global.t;

  // 🔥 ESTA ES LA VARIABLE QUE NECESITAS PARA EL BOTÓN
  const printerIP = ref(localStorage.getItem("MES_PRINTER_IP") || "");

  const sendPrintJob = async (pageRange = "1") => {
    if (!printerIP.value) {
      Notify.create({
        type: "negative",
        message: t("storeNotify.print_error_no_ip"),
        position: "top",
      });
      return { success: false, error: "No printer IP configured." };
    }

    const response = await api.post("/print/send", {
      ip: printerIP.value,
      type: "document_online",
      data: "http://intranet.naa.fujikurausa.com/OFS_Photonics/Manufacturing/Documents/doc_draw/907/907-2152_2.pdf",
      pageRange,
    });

    Notify.create({
      type: "positive",
      message: t("storeNotify.print_success", {
        ip: printerIP.value,
        type: "document_online",
      }),
      position: "top",
    });

    return { success: true, message: response.data.message };
  };

  return {
    printerIP,
    sendPrintJob,
  };
});
