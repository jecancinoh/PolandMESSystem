const axios = require("axios");

const snApi = axios.create({
  baseURL: "https://afltd.service-now.com/api/now/table",
  auth: {
    username: "sa_tanium", // reemplaza con tus credenciales reales
    password: "{,^MB,+<p?Q;CfRlEX@h}}w=esXs]pll6($CaG1h",
  },
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

module.exports = { snApi };
