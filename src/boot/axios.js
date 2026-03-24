import { boot } from "quasar/wrappers";
import axios from "axios";

// Crea una instancia de Axios con una URL base spbmes-devign - localhost
const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

//"http://spbmes-devign:3000/api" or http://localhost:3000/api or
// http://spbmes-devign.naa.fujikurausa.com:4000/api

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
});

export { api };
