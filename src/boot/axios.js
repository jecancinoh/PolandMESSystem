import { boot } from "quasar/wrappers";
import axios from "axios";

// Crea una instancia de Axios con una URL base spbmes-devign - localhost
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

//"http://spbmes-devign:3000/api" or http://localhost:3000/api or
// http://spbmes-devign.naa.fujikurausa.com:4000/api

export default boot(({ app }) => {
  // SILENCIAR EL ERROR DE CANAL CERRADO (EXTENSIONES) Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      if (
        event.reason &&
        event.reason.message &&
        event.reason.message.includes(
          "A listener indicated an asynchronous response"
        )
      ) {
        // Detiene el error para que no aparezca en la consola del navegador
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    });
  }

  app.config.globalProperties.$api = api;
});

export { api };
