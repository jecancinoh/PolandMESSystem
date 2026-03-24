const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/IndexPage.vue") }],
  },

  {
    path: "/ReportHrxHr",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/ReportHrxHr.vue") }],
  },

  {
    path: "/DowntimesReport",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/DowntimesReport.vue") },
    ],
  },

  {
    path: "/UnjustifyDowntimes",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/UnjustifyDowntimes.vue") },
    ],
  },
  {
    path: "/InsertEmployee",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/InsertEmployee.vue") },
    ],
  },
  {
    path: "/OpenJobsReport",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/OpenJobsReport.vue") },
    ],
  },

  {
    path: "/CaptureReport",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/CaptureReport.vue") },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
