// src/boot/i18n.js
import { boot } from "quasar/wrappers";
import { Quasar } from "quasar";
import i18n from "src/i18n"; // this is your src/i18n/index.js that exports the i18n instance

import qEn from "quasar/lang/en-US";
import qEs from "quasar/lang/es";
import qPl from "quasar/lang/pl";

const packs = { en: qEn, es: qEs, pl: qPl };

export default boot(({ app }) => {
  // restore saved language (default to 'es')
  const saved = localStorage.getItem("lang") || "es";
  i18n.global.locale.value = saved;
  document.documentElement.setAttribute("lang", saved);

  // set Quasar UI language too
  Quasar.lang.set(packs[saved] || qEn);

  app.use(i18n);
});
