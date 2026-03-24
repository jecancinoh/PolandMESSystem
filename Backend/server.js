require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const path = require("path");
//const { snApi } = require("./snApi.js");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 4000; // Puerto del servidor
const net = require("net");

// Configuración de la base de datos SQL Server
// Ahora lee las credenciales del archivo .env
const dbConfig = {
  user: "MESUser",
  password: "MESUser_Qual!AFL",
  database: "Poland",
  server: "puseamgamosql01",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },

  port: 1433,
};

app.use(cors());
app.use(express.json());

const staticDir = path.join(__dirname, "VueApp");
app.use(express.static(staticDir));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

// ────────────────────────────────────────────────────────────────────────────
//  HEALTHCHECK (antes estaba en "/"; lo movemos a "/health" para no tapar SPA)
//
app.get("/health", async (req, res) => {
  let pool;
  try {
    // Intenta conectar a la base de datos
    pool = await sql.connect(dbConfig);
    res
      .status(200)
      .send("Servidor MES funcionando y conectado a la base de datos SQL.");
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err.message);
    res
      .status(500)
      .send("Error al conectar a la base de datos: " + err.message);
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║             API para Configuración de Estación        ║
// ╚═════════════════════════════════════════════════════════════════════════╝

/**
 * @route GET /api/areas
 * @description Obtiene todas las áreas de la tabla M_Area.
 */
app.get("/api/areas", async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query`SELECT Id, AreaName FROM M_Area ORDER BY AreaName`;
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error al obtener áreas de M_Area:", err.message);
    res
      .status(500)
      .json({ message: "Error al obtener áreas.", error: err.message });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

/**
 * @route GET /api/lines/:areaId
 * @description Obtiene las líneas de la tabla M_Line que coinciden con id_area.
 * @param {number} areaId - El ID del área para filtrar las líneas.
 */
app.get("/api/lines/:areaId", async (req, res) => {
  const { areaId } = req.params;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("areaId", sql.Int, areaId);
    const result =
      await request.query`SELECT Id, LineName, id_area FROM M_Line WHERE id_area = @areaId ORDER BY LineName`;
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(
      `Error al obtener líneas para el área ${areaId} de M_Line:`,
      err.message
    );
    res.status(500).json({
      message: `Error al obtener líneas para el área ${areaId}.`,
      error: err.message,
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

/**
 * @route GET /api/stations/:lineId
 * @description Obtiene las estaciones de la tabla M_Station que coinciden con id_Line.
 * @param {number} lineId - El ID de la línea para filtrar las estaciones.
 */
app.get("/api/stations/:lineId", async (req, res) => {
  const { lineId } = req.params;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("lineId", sql.Int, lineId);
    const result =
      await request.query`SELECT Id, StationName, Description, Production_Order, id_Line, MultipleScan,StationType FROM M_Station WHERE id_Line = @lineId ORDER BY StationName`;
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(
      `Error al obtener estaciones para la línea ${lineId} de M_Station:`,
      err.message
    );
    res.status(500).json({
      message: `Error al obtener estaciones para la línea ${lineId}.`,
      error: err.message,
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

/**
 * @route POST /api/production/pause
 * @description Marca como pausa un registro de T_ProdPart.
 * @body { number } recordId - Id del registro a completar.
 */
app.post("/api/production/pause", async (req, res) => {
  const { recordId } = req.body;
  let pool;

  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("Id", sql.Int, recordId);

    const result = await request.execute("PauseConfirm");
    const rows = result.recordset?.[0]?.RowsAffected ?? 0;

    if (rows > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        message: "No se actualizó: registro no existe o ya estaba completado.",
      });
    }
  } catch (err) {
    console.error("Error al completar producción:", err.message);
    res.status(500).json({
      success: false,
      message: "Error en el servidor al completar el registro.",
      error: err.message,
    });
  } finally {
    pool && pool.close();
  }
});

// ╔════════════════════════════════════════════════════════╗
// ║              API para Trabajos Pendientes              ║
// ╚════════════════════════════════════════════════════════╝

app.get("/api/getOpenJobs", async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    // Ejecutamos el SP optimizado (no requiere parámetros)
    const result = await request.execute("sp_GetOpenJobsReport");

    // result.recordset contendrá los datos devueltos por el SP
    if (result.recordset && result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      // Si no hay trabajos abiertos, devolvemos un array vacío
      res.status(200).json([]);
    }
  } catch (err) {
    console.error(
      "Error al ejecutar Stored Procedure sp_GetOpenJobsReport:",
      err.message
    );
    res.status(500).json({
      message: "Error al obtener el reporte de trabajos abiertos.",
      error: err.message,
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║              API para Operadores              ║
// ╚═════════════════════════════════════════════════════════════════════════╝

/**
 * @route GET /api/getEmp/:badgeNum
 * @description Llama al Stored Procedure GetEmployeeInfo para obtener información del empleado.
 * @param {string} badgeNum - El número de badge del empleado.
 */
app.get("/api/getEmp/:badgeNum", async (req, res) => {
  const { badgeNum } = req.params;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("BadgeNum", sql.NVarChar, badgeNum);

    const result = await request.execute("GetEmployeeInfo");

    // result.recordset contendrá los datos devueltos por el SP
    if (result.recordset && result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      // Si el SP no devuelve registros, significa que el empleado no fue encontrado
      // Devuelve un array vacío para indicar que no se encontro
      res.status(200).json([]);
    }
  } catch (err) {
    console.error(
      `Error al ejecutar Stored Procedure GetEmployeeInfo para badge ${badgeNum}:`,
      err.message
    );
    res.status(500).json({
      message: `Error al obtener información del empleado para badge ${badgeNum}.`,
      error: err.message,
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

// server.js o app.js (Node.js con Express y mssql)
app.post("/api/employee/update", async (req, res) => {
  // AÑADIDO: Log para verificar los datos recibidos en el cuerpo de la petición
  console.log(
    "📥 API Recibido: Petición POST a /api/employee/update con body:",
    req.body
  );

  const { employeeNumber, fullName, description } = req.body;

  // Modificado: Verificación de campos para manejar casos donde description puede ser un string vacío ('')
  if (!employeeNumber || !fullName || description === undefined) {
    // Si la descripción puede ser opcional o un string vacío, esta validación debe ajustarse.
    // Asumiendo que description es necesario, pero si es opcional, lo cambiarías a:
    // if (!employeeNumber || !fullName) { ... }
    return res.status(400).json({
      message:
        "Faltan datos requeridos: employeeNumber, fullName y description.",
    });
  }

  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    // Asumo que tu EMPLOYEE_NUMBER es VARCHAR, si es INT, usa sql.Int
    request.input("employeeNumber", sql.VarChar, employeeNumber);
    request.input("fullName", sql.VarChar, fullName);
    request.input("description", sql.VarChar, description);

    // AÑADIDO: Log para mostrar el query que se está preparando
    console.log(
      `🔨 Preparando UPDATE para el empleado ${employeeNumber} (Nombre: ${fullName}, Descripción: ${description})...`
    );

    const result = await request.query`
      UPDATE [Poland].[dbo].[EmployeeDetails]
      SET [FULL_NAME] = @fullName,
          [DESCRIPTION] = @description
      WHERE [EMPLOYEE_NUMBER] = @employeeNumber
    `;

    // Opcional: Log para ver cuántas filas fueron afectadas
    console.log(
      `✅ UPDATE completado. Filas afectadas: ${result.rowsAffected[0]}`
    );

    if (result.rowsAffected[0] === 0) {
      // En caso de que el número de empleado no exista
      return res
        .status(404)
        .json({ message: "No se encontró el empleado para actualizar." });
    }

    res.status(200).json({ message: "Empleado actualizado correctamente." });
  } catch (err) {
    console.error(
      `❌ Error fatal en la base de datos al actualizar empleado ${employeeNumber}:`,
      err.message
    );
    res.status(500).json({
      message: "Error al actualizar empleado.",
      error: err.message,
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║            API para Registro de Producción           ║
// ╚═════════════════════════════════════════════════════════════════════════╝

/**
 * @route POST /api/production/insert
 * @description Inserta un nuevo registro de producción en la tabla T_ProdPart.
 * @body {object} data - Datos para la inserción.
 * @body {number} data.LineCodeId - ID de la línea.
 * @body {string} data.JobNumber - Número de trabajo.
 * @body {number} data.StationId - ID de la estación.
 * @body {number} data.OperatorId1 - ID del primer operador.
 * @body {number} [data.OperatorId2] - ID del segundo operador (opcional).
 * @body {number} data.Status - Estado del registro (e.g., 1 para Pendiente).
 */
app.post("/api/production/insert", async (req, res) => {
  const {
    LineCodeId,
    JobNumber,
    StationId,
    OperatorId1,
    OperatorId2,
    Status,
    EpoxyId,
  } = req.body;

  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("LineCodeId", sql.Int, LineCodeId);
    request.input("JobNumber", sql.NVarChar, JobNumber);
    request.input("StationId", sql.Int, StationId);
    request.input("OperatorId1", sql.Int, OperatorId1);
    request.input("OperatorId2", sql.Int, OperatorId2 || null);
    request.input("Status", sql.Int, Status);
    request.input("EpoxyId", sql.Int, EpoxyId || null);

    const result = await request.execute("InsertProductionPart");

    if (result.recordset && result.recordset.length > 0) {
      const row = result.recordset[0];

      res.status(201).json({
        message: "Registro de producción insertado exitosamente.",
        NewId: row.NewId,
      });
    } else {
      console.warn("No recordset or empty recordset returned from SP.");
      res.status(500).json({
        message:
          "Error al obtener el ID del nuevo registro. El SP no devolvió un NewId.",
      });
    }
  } catch (err) {
    console.error("Error al insertar registro de producción:", err.message);
    res.status(500).json({
      message: "Error al insertar registro de producción.",
      error: err.message,
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

/**
 * @route GET /api/production/history
 * @description Llama al Stored Procedure GetRecentProductionHistory para obtener el historial de producción.
 * @queryparam {number} lineCodeId - ID de línea para filtrar.
 * @queryparam {number} stationId - ID de estación para filtrar.
 * @queryparam {string} prodDate - Fecha de producción en formato YYYYMMDD.
 * @queryparam {number} [topN=20] - Número de registros a devolver.
 */

//Get Employee info through SQL

app.post("/api/employeeInsert", async (req, res) => {
  const { employeeNumber, fullName, description } = req.body;

  // LOG 1: Verificar la data recibida
  console.log("🟢 [API-LOG] Solicitud de inserción recibida.");
  console.log(
    `🟢 [API-LOG] Datos recibidos: Empleado=${employeeNumber}, Nombre=${fullName}, Descripción=${description}`
  );

  // ** Validar que la data esencial exista antes de conectar a la DB **
  if (!employeeNumber || !fullName || !description) {
    console.warn("⚠️ [API-LOG] Datos incompletos. Faltan campos obligatorios.");
    return res.status(400).json({
      success: false,
      message: "Datos de formulario incompletos. Verifique los campos.",
    });
  }

  try {
    // LOG 2: Verificar conexión a la DB
    console.log("🟡 [API-LOG] Intentando conectar a la base de datos...");
    // 💡 CAMBIO: Usando dbConfig en lugar de sqlConfig
    await sql.connect(dbConfig);
    console.log("✅ [API-LOG] Conexión a la base de datos exitosa.");

    // 1) Verificar si ya existe
    console.log(
      `🟡 [API-LOG] Buscando existencia del empleado #${employeeNumber}...`
    );
    const existResult = await sql.query`
      SELECT 1 AS existsFlag
      FROM [Poland].[dbo].[EmployeeDetails]
      WHERE EMPLOYEE_NUMBER = ${employeeNumber}
    `;

    if (existResult.recordset.length > 0) {
      console.warn(
        `⚠️ [API-LOG] Empleado #${employeeNumber} ya existe. Abortando inserción.`
      );
      return res.status(200).json({
        success: false,
        message: "Ya existe un registro para ese empleado",
      });
    }

    // 2) Insertar si no existe
    console.log(`🟡 [API-LOG] Insertando nuevo empleado #${employeeNumber}...`);
    await sql.query`
      INSERT INTO [Poland].[dbo].[EmployeeDetails] (
        [EMPLOYEE_NUMBER],
        [CODE],
        [DESCRIPTION],
        [FULL_NAME],
        [CODE_1],
        [DESCRIPTION_1],
        [CODE_2],
        [DESCRIPTION_2],
        [START_DATE],
        [END_DATE]
      ) VALUES (
        ${employeeNumber},
        NULL,
        ${description},
        ${fullName},
        NULL,
        NULL,
        NULL,
        NULL,
        GETDATE(),
        GETDATE()
      )
    `;
    console.log("✅ [API-LOG] Inserción de empleado exitosa.");

    return res
      .status(200)
      .json({ success: true, message: "Empleado insertado exitosamente" });
  } catch (err) {
    // LOG 3: Capturar el error detallado
    console.error(
      "❌ [DB-ERROR] Error al insertar empleado:",
      err.message || err
    );

    // Devolvemos el mensaje de error de la base de datos (clave para la depuración)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor. Consulte el log para el detalle.",
      debugInfo: err.message || "Error desconocido en DB",
    });
  }
});

/**
 * Elimina un registro de la tabla [Poland].[dbo].[EmployeeDetails]
 * usando el número de empleado.
 * @param {string} badgeNum - El número de empleado a eliminar.
 */
app.delete("/api/deleteEmployeeDetail/:badgeNum", async (req, res) => {
  const { badgeNum } = req.params;

  if (!badgeNum) {
    return res
      .status(400)
      .send("Número de empleado (badgeNum) es obligatorio.");
  }

  try {
    await sql.connect(dbConfig);

    // Query para eliminar la fila. Usamos la sintaxis de template string
    // para inyectar el parámetro de forma segura.
    const result = await sql.query`
      DELETE FROM [Poland].[dbo].[EmployeeDetails]
      WHERE [EMPLOYEE_NUMBER] = ${badgeNum};
    `;

    // Comprobar cuántas filas fueron afectadas
    if (result.rowsAffected[0] > 0) {
      // Éxito: Se eliminó al menos una fila
      res.status(200).json({
        message: `Registro del empleado ${badgeNum} eliminado correctamente.`,
        deletedCount: result.rowsAffected[0],
      });
    } else {
      // No se encontró el registro para eliminar
      res
        .status(404)
        .send(`No se encontró el empleado ${badgeNum} en EmployeeDetails.`);
    }
  } catch (err) {
    console.error("Error al eliminar empleado:", err.message);
    res.status(500).send("Error interno del servidor al eliminar el registro.");
  }
});

// Valores downtime-reasons
app.get("/api/downtime-reasons", async (req, res) => {
  let pool;
  try {
    pool = await sql.connect(dbConfig); // <-- Esto faltaba
    const result = await pool
      .request()
      .query(
        "SELECT autonum, DownTimeReason, DownTimeReasonEN, DownTimeReasonES FROM [dbo].[DownTimeReason] WHERE Active = 1"
      );

    // 👇 Aquí logueas en el servidor lo que regresa la DB
    console.log("Downtime reasons result:", result.recordset);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener razones de downtime:", err.message);
    res.status(500).json({ error: "Error al obtener las razones de downtime" });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool:", closeErr.message);
      }
    }
  }
});

// Endpoint para obtener los eventos de downtime
app.get("/api/downtime/get", async (req, res) => {
  let pool;
  try {
    console.log("-> RECIBIDO:", req.query);

    pool = await sql.connect(dbConfig);

    // Convertir y validar parámetros
    const AreaId = parseInt(req.query.AreaId, 10);
    const LineId = parseInt(req.query.LineId, 10);
    const StationId = parseInt(req.query.StationId, 10);
    const Fecha = new Date(req.query.Fecha);
    const FechaFin = req.query.FechaFin
      ? new Date(new Date(req.query.FechaFin).setHours(23, 59, 59, 999))
      : null;
    const Shift = req.query.Shift;

    // Parámetro opcional para filtrar ReasonID
    const SoloSinReason = req.query.SoloSinReason
      ? parseInt(req.query.SoloSinReason, 10)
      : 0;

    // Crear solicitud para SP
    const request = pool.request();
    request.input("AreaId", sql.Int, AreaId);
    request.input("LineId", sql.Int, LineId);
    request.input("StationId", sql.Int, StationId);
    request.input("Fecha", sql.DateTime, Fecha);
    request.input("Shift", sql.NVarChar(2), Shift);
    request.input("SoloSinReason", sql.Bit, SoloSinReason); // nuevo parámetro

    if (FechaFin) {
      request.input("FechaFin", sql.DateTime, FechaFin);
    }

    const spParams = { AreaId, LineId, StationId, Fecha, Shift, SoloSinReason };
    if (FechaFin) spParams.FechaFin = FechaFin;

    console.log("-> ENVIANDO a SP:", {
      sp: "sp_GetDowntimeEvents",
      params: spParams,
    });

    const result = await request.execute("sp_GetDowntimeEvents");

    console.log(`-> GENERADO: ${result.recordset.length} registros`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error al ejecutar sp_GetDowntimeEvents:", err.message);
    res.status(500).json({ error: "Error al obtener los eventos de downtime" });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool:", closeErr.message);
      }
    }
  }
});

// -- GET Downtime Summary, Cantidad de demoras por Estacion
app.get("/api/getDownTimeSummary", async (req, res) => {
  // Log 1: El servidor recibe una llamada a esta ruta y con qué método.
  console.log(
    "📡 [Backend] Solicitud recibida en /api/getDownTimeSummary con método GET."
  );

  // Obtener los parámetros de la URL
  const { stationID, productionDate, productionDateStart, productionDateEnd } =
    req.query;

  // Log 2: Mostrar los parámetros exactos que el servidor está recibiendo.
  console.log("👉 [Backend] Parámetros de la URL (req.query):");
  console.log(" @stationID:", stationID);
  console.log(" @productionDate:", productionDate);
  console.log(" @productionDateStart:", productionDateStart);
  console.log(" @productionDateEnd:", productionDateEnd);

  // Validar que se reciba al menos una fecha
  if (!productionDate && !productionDateStart) {
    console.error(
      "❌ [Backend] Error 400: Falta 'productionDate' o 'productionDateStart'."
    );
    return res.status(400).json({
      error: "Debes proporcionar 'productionDate' o 'productionDateStart'.",
    });
  }

  // Determinar las fechas finales para el SP
  let spFechaInicio = productionDateStart || productionDate;
  let spFechaFin = productionDateEnd || null;

  // Log 3: Mostrar los parámetros que se usarán para la consulta a la base de datos.
  console.log("🔍 [Backend] Parámetros finales para el Stored Procedure:");
  console.log(" @FechaInicio:", spFechaInicio);
  console.log(" @FechaFin:", spFechaFin);

  let pool;
  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ [Backend] Conexión a la base de datos exitosa.");

    const result = await pool
      .request()
      .input("FechaInicio", sql.Date, spFechaInicio)
      .input("FechaFin", sql.Date, spFechaFin)
      .execute("sp_GetDownTimeSummary");

    console.log("🎉 [Backend] Stored Procedure ejecutado correctamente.");
    res.status(200).json(result.recordset);
  } catch (err) {
    // Log 4: Capturar cualquier error inesperado.
    console.error("❌ [Backend] Error en /api/getDownTimeSummary:", err);
    res.status(500).json({ error: "Error al consultar resumen de downtime" });
  } finally {
    if (pool) {
      pool.close();
      console.log("🚪 [Backend] Conexión a la base de datos cerrada.");
    }
  }
});

//Solicitudes de informacion Jobnumber a Reporte de Capturas en Polonia

app.get("/api/getJobsByProductionDate", async (req, res) => {
  // Log 1: Entrada de la solicitud
  console.log(
    "------------------------------------------------------------------"
  );
  console.log(
    "📡 [Backend] Solicitud recibida en /api/getJobsByProductionDate"
  );

  const { productionDate, stationName, stationType } = req.query;

  // Log 2: Validación de parámetros recibidos por URL
  console.log("👉 [Backend] Parámetros recibidos (req.query):");
  console.log("   - @productionDate:", productionDate);
  console.log("   - @stationName:", stationName || "NULL (No proporcionado)");
  console.log("   - @stationType:", stationType || "NULL (No proporcionado)");

  if (!productionDate) {
    console.error("❌ [Backend] Error 400: Falta 'productionDate'.");
    return res
      .status(400)
      .json({ error: "El parámetro productionDate es obligatorio." });
  }

  let pool;
  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ [Backend] Conexión a la base de datos establecida.");

    const request = pool.request();

    // Mapeo de inputs
    request.input("ProductionDate", sql.Date, productionDate);
    request.input("StationName", sql.NVarChar(50), stationName || null);
    request.input("StationType", sql.NVarChar(100), stationType || null);

    console.log("🔍 [Backend] Ejecutando SP: sp_GetJobsByProductionDate...");
    const result = await request.execute("sp_GetJobsByProductionDate");

    // Log 3: Validación de los datos resultantes
    const rowCount = result.recordset.length;
    console.log(`🎉 [Backend] SP ejecutado con éxito.`);
    console.log(`📊 [Backend] Total de filas encontradas: ${rowCount}`);

    if (rowCount > 0) {
      // Log 4: Muestra una pequeña muestra del primer registro para validar estructura
      console.log("📋 [Backend] Muestra del primer registro:", {
        JobNumber: result.recordset[0].JobNumber,
        Station: result.recordset[0].StationName,
        Turno: result.recordset[0].Turno,
        ProdDate: result.recordset[0].ProductionDate,
      });
    } else {
      console.warn(
        "⚠️ [Backend] El SP no devolvió ningún registro para estos filtros."
      );
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    // Log 5: Detalle de error
    console.error("❌ [Backend] ERROR DETECTADO:");
    console.error("   - Mensaje:", err.message);
    console.error("   - Stack:", err.stack);
    res.status(500).json({ error: "Error al consultar los jobs por fecha." });
  } finally {
    if (pool) {
      await pool.close();
      console.log("🚪 [Backend] Conexión cerrada.");
      console.log(
        "------------------------------------------------------------------"
      );
    }
  }
});

// -- GET Downtime Summary, Cantidad de demoras por Estacion
app.post("/api/getDownTimeSummary2", async (req, res) => {
  let pool;
  try {
    const {
      stationID,
      productionDate,
      productionDateStart,
      productionDateEnd,
    } = req.body;

    console.log("📦 Datos recibidos en backend:", req.body);

    // Determinar fechas a enviar al SP
    let spStationID = stationID || null;
    let spProductionDateStart;
    let spProductionDateEnd;

    if (productionDateStart) {
      spProductionDateStart = productionDateStart;
      spProductionDateEnd = productionDateEnd || null;
    } else if (productionDate) {
      spProductionDateStart = productionDate;
      spProductionDateEnd = null;
    } else {
      return res.status(400).json({
        error:
          "Debe proporcionar al menos 'productionDate' o 'productionDateStart'.",
      });
    }

    console.log("▶ Ejecutando sp_GetDownTimeSummaryTEST con params:", {
      StationID: spStationID,
      ProductionDateStart: spProductionDateStart,
      ProductionDateEnd: spProductionDateEnd,
    });

    pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("StationID", sql.VarChar(50), spStationID)
      .input("ProductionDateStart", sql.Date, spProductionDateStart)
      .input("ProductionDateEnd", sql.Date, spProductionDateEnd)
      .execute("sp_GetDownTimeSummaryTEST");

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error ejecutando SP:", err);
    res.status(500).json({
      error: "Error ejecutando SP",
      details: err.message,
    });
  } finally {
    if (pool) pool.close();
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║                           Dividir Downtimes                             ║
// ╚═════════════════════════════════════════════════════════════════════════╝
app.post("/api/downtime/split", async (req, res) => {
  let pool;
  try {
    const { ParentDowntimeID, PercentParent, NewReasonID, CreatedBy } =
      req.body;

    console.log("📦 Datos recibidos en backend:", req.body);

    // asegurar que NewReasonID es número
    const parsedReasonID = Number(NewReasonID?.value || NewReasonID);

    pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("ParentDowntimeID", sql.Int, ParentDowntimeID)
      .input("PercentParent", sql.Float, PercentParent)
      .input("NewReasonID", sql.Int, parsedReasonID)
      .input("CreatedBy", sql.Int, CreatedBy)
      .execute("sp_SplitDowntime");

    res.json({
      message: "✅ Split realizado con éxito",
      result: result.recordset,
    });
  } catch (err) {
    console.error("❌ Error al realizar split:", err);
    res
      .status(500)
      .json({ error: "Error en el servidor", details: err.message });
  } finally {
    if (pool) pool.close();
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║         API Inserta el nuevo Downtome en la tabla         ║
// ╚═════════════════════════════════════════════════════════════════════════╝
app.post("/api/production/downtime/start", async (req, res) => {
  const {
    ReasonID,
    StartTime,
    EndTime,
    DowntimeType,
    IsSplit,
    SplitFromDowntimeID,
    CreatedAt,
    CreatedBy,
    Shift,
    AreaId,
    LineId,
    StationId,
    JobIDs,
  } = req.body;

  // Log para debug de payload recibido
  console.log("Payload recibido en downtime/start:", req.body);

  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    // Validación obligatoria
    if (!StartTime || !JobIDs) {
      return res.status(400).json({
        message: "Error: Faltan parámetros requeridos (StartTime, JobIDs).",
      });
    }

    // Convertir ReasonID a int o null
    const parsedReasonID = ReasonID != null ? parseInt(ReasonID, 10) : null;

    // Convertir DowntimeType a BIT (0 o 1)
    let parsedDowntimeType;
    if (DowntimeType === 1 || DowntimeType === "1" || DowntimeType === true) {
      parsedDowntimeType = 1;
    } else if (
      DowntimeType === 0 ||
      DowntimeType === "0" ||
      DowntimeType === false
    ) {
      parsedDowntimeType = 0;
    } else {
      return res.status(400).json({ message: "DowntimeType debe ser 0 o 1." });
    }

    // Convertir IsSplit a boolean (BIT)
    const parsedIsSplit = IsSplit === 1 || IsSplit === true;

    // SplitFromDowntimeID int o null
    const parsedSplitFromDowntimeID =
      SplitFromDowntimeID != null ? parseInt(SplitFromDowntimeID, 10) : null;

    // CreatedBy int (si no viene, puede ser null)
    const parsedCreatedBy =
      CreatedBy != null && !isNaN(parseInt(CreatedBy, 10))
        ? parseInt(CreatedBy, 10)
        : null;

    // AreaId, LineId, StationId enteros o null
    const parsedAreaId =
      AreaId != null && !isNaN(parseInt(AreaId, 10))
        ? parseInt(AreaId, 10)
        : null;
    const parsedLineId =
      LineId != null && !isNaN(parseInt(LineId, 10))
        ? parseInt(LineId, 10)
        : null;
    const parsedStationId =
      StationId != null && !isNaN(parseInt(StationId, 10))
        ? parseInt(StationId, 10)
        : null;

    // Usar las fechas tal cual vienen del frontend
    request.input("ReasonID", sql.Int, parsedReasonID);
    request.input("StartTime", sql.NVarChar, StartTime);
    request.input("EndTime", sql.NVarChar, EndTime || null);
    request.input("DowntimeType", sql.Bit, parsedDowntimeType);
    request.input("IsSplit", sql.Bit, parsedIsSplit);
    request.input("SplitFromDowntimeID", sql.Int, parsedSplitFromDowntimeID);
    request.input("CreatedAt", sql.NVarChar, CreatedAt || new Date());
    request.input("CreatedBy", sql.Int, parsedCreatedBy);
    request.input("Shift", sql.NVarChar, Shift || "");
    request.input("AreaId", sql.Int, parsedAreaId);
    request.input("LineId", sql.Int, parsedLineId);
    request.input("StationId", sql.Int, parsedStationId);
    request.input("JobIDs", sql.NVarChar, JobIDs);

    // Ejecutar stored procedure
    const result = await request.execute("sp_InsertDowntimeWithJobs");

    console.log("Resultado SP:", result.recordset);

    if (result.recordset && result.recordset.length > 0) {
      const row = result.recordset[0];
      return res.status(201).json({
        message: "Downtime iniciado exitosamente.",
        DowntimeID: row.NewDowntimeID,
      });
    } else {
      console.warn("No se recibió el ID del nuevo registro del SP.");
      return res.status(201).json({
        message: "Downtime iniciado, pero el SP no devolvió un ID.",
      });
    }
  } catch (err) {
    console.error("Error en /production/downtime/start:", err.message || err);
    return res.status(500).json({
      message: "Error al iniciar el downtime.",
      error: err.message || "Error desconocido",
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║             API Termina el Downtime insertado             ║
// ╚═════════════════════════════════════════════════════════════════════════╝
app.post("/api/downtime/close", async (req, res) => {
  // 👇 LOG de depuración
  console.log("📩 Payload recibido en /downtime/close:", req.body);

  const { DowntimeID, EndTime, ReasonID } = req.body;
  let pool;

  try {
    if (!DowntimeID) {
      return res.status(400).json({
        message: "DowntimeID es obligatorio.",
      });
    }

    const parsedDowntimeID = parseInt(DowntimeID, 10);
    if (isNaN(parsedDowntimeID)) {
      return res.status(400).json({
        message: "DowntimeID inválido.",
      });
    }

    pool = await sql.connect(dbConfig);
    const request = pool
      .request()
      .input("DowntimeID", sql.Int, parsedDowntimeID);

    if (ReasonID) {
      // Justificar downtime
      request.input("ReasonID", sql.Int, ReasonID);
    }

    if (EndTime) {
      // Cerrar downtime
      request.input("EndTime", sql.NVarChar, EndTime);
    }

    await request.execute("sp_CloseDowntime");

    res.status(200).json({
      message:
        ReasonID && !EndTime
          ? "Downtime justificado exitosamente."
          : EndTime && !ReasonID
          ? "Downtime cerrado exitosamente."
          : "Downtime cerrado y justificado exitosamente.",
      DowntimeID: parsedDowntimeID,
    });
  } catch (err) {
    console.error("Error en /downtime/close:", err);
    res.status(500).json({
      message: "Error al cerrar/justificar el downtime.",
      error: err.message || "Error desconocido",
    });
  } finally {
    if (pool) await pool.close();
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║         Downtime automático (sin ReasonID, sin JobIDs)         ║
// ╚═════════════════════════════════════════════════════════════════════════╝
app.post("/api/downtime/auto", async (req, res) => {
  const { AreaId, LineId, StationId, CreatedBy, Shift, StartTime } = req.body;

  // Función para formatear fecha a 'YYYY-MM-DD HH:mm:ss'
  const formatDateForSQL = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Enero = 0
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  let pool;
  try {
    // 👇 Usamos el StartTime que viene del cliente, si no generamos en servidor
    const startTimeValue = StartTime || formatDateForSQL(new Date());
    const createdAtValue = formatDateForSQL(new Date());

    pool = await sql.connect(dbConfig);
    const request = pool.request();

    // Armamos los parámetros con valores nulos o por defecto
    request.input("ReasonID", sql.Int, null); // ⬅ sin justificación todavía
    request.input("StartTime", sql.NVarChar, startTimeValue);
    request.input("EndTime", sql.NVarChar, null); // sigue abierto
    request.input("DowntimeType", sql.Bit, 0); // downtime automático/productivo
    request.input("IsSplit", sql.Bit, 0);
    request.input("SplitFromDowntimeID", sql.Int, null);
    request.input("CreatedAt", sql.NVarChar, createdAtValue);
    request.input("CreatedBy", sql.Int, CreatedBy || null);
    request.input("Shift", sql.NVarChar, Shift || "");
    request.input("AreaId", sql.Int, AreaId || null);
    request.input("LineId", sql.Int, LineId || null);
    request.input("StationId", sql.Int, StationId || null);
    request.input("JobIDs", sql.NVarChar, null); // ⬅ sin trabajo relacionado

    const result = await request.execute("sp_InsertDowntimeWithJobs");

    if (result.recordset && result.recordset.length > 0) {
      const row = result.recordset[0];
      return res.status(201).json({
        message: "Downtime automático iniciado.",
        DowntimeID: row.NewDowntimeID,
      });
    } else {
      return res.status(201).json({
        message: "Downtime automático iniciado, pero el SP no devolvió ID.",
      });
    }
  } catch (err) {
    console.error("Error en /downtime/auto:", err.message || err);
    return res.status(500).json({
      message: "Error al iniciar downtime automático.",
      error: err.message || "Error desconocido",
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch {}
    }
  }
});

app.get("/api/production/history", async (req, res) => {
  const { lineCodeId, stationId, prodDate, topN } = req.query;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool
      .request()
      .input("LineCodeId", sql.Int, lineCodeId ? parseInt(lineCodeId) : null)
      .input("StationId", sql.Int, stationId ? parseInt(stationId) : null)
      .input("ProdDate", sql.VarChar, prodDate || null)
      .input("TopN", sql.Int, topN ? parseInt(topN) : 20);

    const result = await request.execute("GetRecentProductionHistory");

    const history = result.recordsets[0] || [];
    const DatosGenerales =
      (result.recordsets[1] && result.recordsets[1][0]) || {};

    const avgCycleSeconds = DatosGenerales.AvgCycleSeconds ?? 0;
    const sumConnectorsOk = DatosGenerales.SumConnectorsOk ?? 0;
    const sumConnectorsNg = DatosGenerales.SumConnectorsNg ?? 0;
    const currentshift = DatosGenerales.CurrentShift || "--";

    return res.status(200).json({
      history,
      avgCycleSeconds,
      sumConnectorsOk,
      sumConnectorsNg,
      currentshift,
    });
  } catch (err) {
    console.error("Error al obtener historial de producción:", err);
    return res.status(500).json({
      message: "Error al obtener historial de producción.",
      error: err.message,
    });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

/**
 * @route POST /api/production/complete
 * @description Marca como completado un registro de T_ProdPart.
 * @body { number } recordId - Id del registro a completar.
 */
app.post("/api/production/complete", async (req, res) => {
  const { recordId, terminalA, terminalB, cycleMinutes } = req.body;
  let pool;

  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("Id", sql.Int, recordId);
    request.input("numberOfConnectors", sql.Int, terminalA);
    request.input("numberOfConnectorsB", sql.Int, terminalB);

    // 👇 Nuevo parámetro opcional
    request.input(
      "cycleMinutes",
      sql.Int,
      cycleMinutes ?? null // si no viene, manda NULL y tu SP usa la lógica normal
    );

    const result = await request.execute("CompleteProdPart");
    const rows = result.recordset?.[0]?.RowsAffected ?? 0;

    if (rows > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        message: "No se actualizó: registro no existe o ya estaba completado.",
      });
    }
  } catch (err) {
    console.error("Error al completar producción:", err.message);
    res.status(500).json({
      success: false,
      message: "Error en el servidor al completar el registro.",
      error: err.message,
    });
  } finally {
    pool && pool.close();
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║            API para Registro de HelpRequest          ║
// ╚═════════════════════════════════════════════════════════════════════════╝

/**
 * @route GET /api/HelpRequestGet/
 * @description Obtiene todas las posibles solicitudes de ayuda de M_HelpRequest.
 */
app.get("/api/HelpRequestGet/", async (req, res) => {
  const { stationType } = req.params;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    const result = await request.query(
      "SELECT Id,Description FROM M_HelpRequest ORDER BY Id"
    );
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(`Error al obtener los datos.`, err.message);
    res
      .status(500)
      .json({ message: "Error al obtener los datos.", error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

// ────────────────────────────────────────────────────────────────────────────
// FUNCIÓN DE AYUDA: Mapeo de estado de SNOW
// ────────────────────────────────────────────────────────────────────────────
const mapSnState = (stateCode) => {
  const stateMap = {
    1: "Nuevo",
    2: "En Curso",
    3: "Pendiente",
    6: "Resuelto",
    7: "Cerrado",
  };
  return stateMap[String(stateCode)] || "Desconocido";
};

// ────────────────────────────────────────────────────────────────────────────
// CONSULTAR ESTADO DE INCIDENTES
// ────────────────────────────────────────────────────────────────────────────
app.post("/api/production/incidentStatus", async (req, res) => {
  const { incidentNumbers } = req.body;

  if (!Array.isArray(incidentNumbers) || incidentNumbers.length === 0) {
    return res.status(400).json({
      success: false,
      message:
        "Se requiere un array de 'incidentNumbers' no vacío en el cuerpo de la solicitud.",
    });
  }

  try {
    const encodedQuery = `numberIN${incidentNumbers.join(",")}`;

    const snResponse = await axios.get(
      "https://afltd.service-now.com/api/now/table/incident",
      {
        auth: {
          username: "sa_tanium",
          password: "{,^MB,+<p?Q;CfRlEX@h}}w=esXs]pll6($CaG1h",
        },
        headers: {
          Accept: "application/json",
        },
        params: {
          sysparm_query: encodedQuery,
          sysparm_fields: "number,state",
        },
      }
    );

    const results = snResponse.data.result || [];

    const formattedStatus = results.map((incident) => ({
      number: incident.number,
      status: mapSnState(incident.state),
      stateCode: incident.state,
    }));

    res.status(200).json({
      success: true,
      incidents: formattedStatus,
    });
  } catch (err) {
    console.error("Error al consultar incidentes en SNOW");

    if (err.response) {
      console.error("SNOW respondió:", err.response.data);
    } else {
      console.error("Error local:", err.message);
    }

    res.status(500).json({
      success: false,
      message: "Error al consultar el estado de incidentes en ServiceNow.",
      snError: err.response?.data || null,
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// CREAR INCIDENTE (HELP REQUEST)
// ────────────────────────────────────────────────────────────────────────────
app.post("/api/production/HelpRequest", async (req, res) => {
  const { type, description, lineCodeId, stationId } = req.body;

  if (!type || lineCodeId === undefined || stationId === undefined) {
    return res.status(400).json({
      success: false,
      message:
        "Datos incompletos. Se requieren 'type', 'lineCodeId' y 'stationId'.",
    });
  }

  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("LineCodeId", sql.Int, lineCodeId);
    request.input("StationId", sql.Int, stationId);
    request.input("type", sql.Int, type);

    const result = await request.execute("sp_GetHelpRequestDetails");
    const data = result.recordset[0];

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron datos para los parámetros proporcionados.",
      });
    }

    const { LineName, StationName, HelpDescription, Typeof } = data;

    const snBody = {
      short_description: `Polonia solicita apoyo Línea ${LineName} en la estación ${StationName}`,
      description:
        description && description.trim() !== ""
          ? `Incidente creado desde la línea ${LineName} en la estación ${StationName}. Problema: "${HelpDescription}". Detalle adicional: "${description}".`
          : `Incidente creado desde la línea ${LineName} en la estación ${StationName}. Problema: "${HelpDescription}".`,
      category: "MTY/MES",
      subcategory: Typeof,
      impact: "3",
      urgency: "3",
      assignment_group: "585d63661b27a410d84243f8bc4bcb6c",
      caller_id: "5136503cc611227c0183e96598c4f706",
      u_affected_user: "5136503cc611227c0183e96598c4f706",
      contact_type: "Phone",
      u_phone: ".",
    };

    const snResponse = await axios.post(
      "https://afltd.service-now.com/api/now/table/incident",
      snBody,
      {
        auth: {
          username: "sa_tanium",
          password: "{,^MB,+<p?Q;CfRlEX@h}}w=esXs]pll6($CaG1h",
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const incident = snResponse.data.result;

    res.status(201).json({
      success: true,
      NewId: incident.sys_id,
      Number: incident.number,
      jsonSent: snBody,
    });
  } catch (err) {
    console.error("Error al crear incidente en SNOW");

    if (err.response) {
      console.error("SNOW respondió:", err.response.data);
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el incidente en ServiceNow.",
      snError: err.response?.data || null,
    });
  } finally {
    if (pool) await pool.close();
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║            API para Registro de Epoxy             ║
// ╚═════════════════════════════════════════════════════════════════════════╝

/**
 * @route POST /api/epoxy/register
 * @description Recibe datos de Epoxy, llama al SP InsertEpoxyLot y regresa el mensaje y éxito del SP.
 * @bodyparam {string} lotA - Lote A de Epoxy.
 * @bodyparam {string} lotB - Lote B de Epoxy.
 * @bodyparam {string} serialEpoxyNo - Número de serie de Epoxy.
 * @bodyparam {string} expirationDate - Fecha de expiración de Epoxy (YYYY-MM-DD).
 * @returns {object} { success: boolean, message?: string, newEpoxyId?: number }
 */
app.post("/api/epoxy/register", async (req, res) => {
  const { lotA, lotB, serialEpoxyNo, expirationDate, stationId } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("StationId", sql.Int, stationId);
    request.input("LotA", sql.VarChar(50), lotA);
    request.input("LotB", sql.VarChar(50), lotB);
    request.input("SerialEpoxy", sql.VarChar(50), serialEpoxyNo);
    request.input("ExpirationDate", sql.Date, expirationDate);

    const result = await request.execute("InsertEpoxyLot");

    const spResponse = result.recordset?.[0] || {};
    const success = spResponse.Success === 1;

    if (success) {
      res.status(200).json({
        success: true,
        message: spResponse.Message || "Epoxy registrado correctamente.",
        newEpoxyId: spResponse.NewEpoxyId || null,
      });
    } else {
      res.status(400).json({
        success: false,
        message: spResponse.Message || "No se insertó el Epoxy.",
      });
    }
  } catch (err) {
    console.error("Error al registrar Epoxy:", err.message);
    res.status(500).json({
      success: false,
      message: "Error en el servidor al registrar el Epoxy.",
      error: err.message,
    });
  } finally {
    pool && pool.close();
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║            API para Registro de Retrabajos           ║
// ╚═════════════════════════════════════════════════════════════════════════╝

/**
 * @route GET /api/defects/:stationType
 * @description Obtiene todos los defectos de M_Defects para el tipo de estación dado.
 */
app.get("/api/defects/:stationType", async (req, res) => {
  const { stationType } = req.params;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("StationType", sql.VarChar(50), stationType);
    const result = await request.query(
      "SELECT * FROM M_Defects WHERE StationType = @StationType ORDER BY Id"
    );

    // LOG MODIFICADO para mostrar CUALES registros se obtuvieron
    console.log(`--- Defectos obtenidos para StationType=${stationType} ---`);
    console.log(result.recordset); // ESTO MUESTRA EL ARRAY DE OBJETOS
    console.log(`--------------------------------------------------------`);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error(
      `Error al obtener defectos para StationType=${stationType}:`,
      err.message
    );
    res
      .status(500)
      .json({ message: "Error al cargar retrabajos.", error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

/**
 * @route POST /api/rework/registerAll
 * @description Marca el cable en retrabajo y registra todos los defectos+terminales enviados.
 * @body { number  ProdPartId,   // ID en T_ProdPart
 *         string  Entries      // JSON array de { defectId, terminalNumber, terminalSide }
 *       }
 */
app.post("/api/rework/registerAll", async (req, res) => {
  const {
    ProdPartId,
    MES_SelectedStation,
    numberOfConnectors,
    numberOfConnectorsB,
    Entries,
  } = req.body;
  let pool;
  console.log("Luna: ", MES_SelectedStation);

  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("ProdPartId", sql.Int, ProdPartId);
    request.input("MES_SelectedStation", sql.Int, MES_SelectedStation);
    request.input("numberOfConnectors", sql.Int, numberOfConnectors);
    request.input("numberOfConnectorsB", sql.Int, numberOfConnectorsB);
    request.input("Entries", sql.NVarChar(sql.MAX), Entries);

    // Log para debug
    console.log("⟹ SP ReworkProdPart called with:", { ProdPartId, Entries });

    const result = await request.execute("ReworkProdPart");
    const row = result.recordset?.[0] || {};
    const RowsUpdated = row.RowsUpdated ?? 0;
    const RowsInserted = row.RowsInserted ?? 0;

    console.log(
      `⟹ SP returned RowsUpdated=${RowsUpdated}, RowsInserted=${RowsInserted}`
    );

    // Éxito si hubo al menos inserciones
    const success = RowsInserted > 0;

    res
      .status(200)
      .json({ success, rowsUpdated: RowsUpdated, rowsInserted: RowsInserted });
  } catch (err) {
    console.error("Error al registrar retrabajos batch:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

/**
 * @route GET /api/rework/entries
 * @query { number ProdPartId }  // Id de T_ProdPart
 *        { number JobNumberId } // (opcional) atajo directo
 * @returns [{ id, defect, terminalNumber, terminalSide, regDate }, …]
 */
app.get("/api/rework/entries", async (req, res) => {
  const { ProdPartId, JobNumberId } = req.query;

  // ⭐️ LOG 1: Parámetros recibidos de la solicitud HTTP
  console.log("API /rework/entries recibida. Query:", {
    ProdPartId,
    JobNumberId,
  });

  let pool;
  try {
    pool = await sql.connect(dbConfig);

    const inputProdPartId = ProdPartId ? Number(ProdPartId) : null;
    const inputJobNumberId = JobNumberId ? Number(JobNumberId) : null;

    // ⭐️ LOG 2: Parámetros finales para la consulta SQL
    console.log("API /rework/entries -> Ejecutando dbo.GetReworkEntries con:", {
      ProdPartId: inputProdPartId,
      JobNumberId: inputJobNumberId,
    });

    const result = await pool
      .request()
      .input("ProdPartId", sql.Int, inputProdPartId)
      .input("JobNumberId", sql.Int, inputJobNumberId)
      .execute("dbo.GetReworkEntries");

    // ⭐️ LOG 3 MEJORADO: Muestra la data devuelta por el API (hasta 12 registros)
    const records = result.recordset || [];
    console.log(
      "API /rework/entries <- Datos generados:",
      records.length,
      "registros."
    );

    // Imprime solo los primeros 12 registros para evitar saturar la consola con miles de datos
    console.log("Contenido de los registros:", records.slice(0, 12));

    res.json(records); // Usamos 'records' que ya contiene result.recordset
  } catch (err) {
    console.error("Error fetching rework entries:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

/**
 * @route POST /api/rework/entry/status
 * @description Actualiza el estado de una entrada de retrabajo (T_Reworks) usando el SP dbo.SetReworkEntryStatus.
 *
 * @body { number } id       - ID de la entrada de retrabajo (T_Reworks.Id).
 * @body { number } status   - Nuevo estado (TinyInt). Sugerencia de convención:
 *                             0 = pendiente, 1 = aprobado, 2 = rechazado, 3 = anulado.
 *
 * @returns {object} 200 OK
 *          { ok: true, id: number, status: number }
 */
app.post("/api/rework/entry/status", async (req, res) => {
  const { id, MES_SelectedStation } = req.body || {};
  if (!id || typeof MES_SelectedStation === "undefined") {
    return res.status(400).json({ message: "Faltan 'id' o 'status'." });
  }

  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Id", sql.Int, Number(id))
      .input("MES_SelectedStation", sql.TinyInt, Number(MES_SelectedStation))
      .execute("dbo.SetReworkEntryStatus");

    const rows = result.recordset?.[0]?.RowsAffected ?? 0;
    if (rows === 0) {
      return res.status(404).json({ message: "Rework entry no encontrada." });
    }
    res.json({ ok: true, id, MES_SelectedStation });
  } catch (err) {
    console.error("Error updating rework entry status:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║             API para ETQ Documento                  ║
// ╚═════════════════════════════════════════════════════════════════════════╝
app.get("/api/etq-docs/:stationPrefix", async (req, res) => {
  const stationPrefix = String(req.params.stationPrefix || "").slice(0, 10);
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("StationDesc", sql.VarChar(10), stationPrefix);

    const result = await request.execute("sp_GetEtqDocumentsByStationLike");
    res.status(200).json(result.recordset ?? []);
    console.log("ETQ RESULTS:", result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener documentos de ETQ." });
  } finally {
    if (pool) await pool.close();
  }
});

// ╔═════════════════════════════════════════════════════════════════════════╗
// ║                          API's para Reportes                            ║
// ╚═════════════════════════════════════════════════════════════════════════╝
// Endpoint para llamar a SP_StationOptions
app.get("/api/station-options", async (req, res) => {
  let pool;

  console.log("📡 [API] Petición recibida en /api/station-options");

  try {
    console.log("🔌 [API] Conectando a la base de datos...");
    pool = await sql.connect(dbConfig);
    console.log("✅ [API] Conexión establecida con SQL Server");

    console.log("⚙️ [API] Ejecutando stored procedure: SP_StationOptions");
    const result = await pool.request().query("EXEC [dbo].[SP_StationOptions]");

    console.log(`📊 [API] Registros obtenidos: ${result.recordset.length}`);
    console.log("🗂️ [API] Primer registro:", result.recordset[0]); // opcional, útil para revisar estructura

    res.json(result.recordset);
  } catch (err) {
    console.error(
      "❌ [API] Error al obtener opciones de estaciones:",
      err.message
    );
    res.status(500).json({
      error: "Error al obtener opciones de estaciones",
      details: err.message,
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log("🔒 [API] Conexión con SQL cerrada correctamente");
      } catch (closeErr) {
        console.error("⚠️ [API] Error al cerrar el pool:", closeErr.message);
      }
    }
  }
});

// Endpoint para llamar a sp_ReporteCapturasPorFecha
// Endpoint para llamar a sp_ReporteCapturasPorFecha
app.get("/api/reporte-capturas", async (req, res) => {
  let pool;
  try {
    console.log("-----------------------------------------");
    console.log("➡️ Petición recibida para /api/reporte-capturas");
    console.log("📥 Query (datos de entrada):", req.query);

    const fechaSeleccionada = req.query.fecha || null;
    // ✅ Corrección 1: Asegura un valor por defecto si el parámetro es nulo o indefinido.
    const tipoConteo = req.query.tipoConteo || "Jobs";

    pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("FechaSeleccionada", sql.Date, fechaSeleccionada);
    // ✅ Corrección 2: Define explícitamente la longitud para evitar el truncado de datos.
    request.input("TipoConteo", sql.VarChar(20), tipoConteo);

    console.log("📤 Parámetros enviados al SP:", {
      FechaSeleccionada: fechaSeleccionada,
      TipoConteo: tipoConteo,
    });

    const result = await request.execute("sp_ReporteCapturasPorFecha");
    const data = result.recordset;

    console.log(`✅ SP 'sp_ReporteCapturasPorFecha' ejecutado con éxito.`);
    console.log(`📊 Número de registros devueltos: ${data.length}`);
    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener reporte de capturas:", err.message);
    res.status(500).json({ error: "Error al obtener el reporte de capturas" });
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log("🔒 Conexión a DB cerrada.");
      } catch (closeErr) {
        console.error("❌ Error al cerrar el pool:", closeErr.message);
      }
    }
  }
});

// Endpoint para llamar a sp_ReporteTurnosPorFecha
app.get("/api/reporte-turnos", async (req, res) => {
  let pool;
  try {
    console.log("-----------------------------------------");
    console.log("➡️ Petición recibida para /api/reporte-turnos");
    console.log("📥 Query (datos de entrada):", req.query);

    const fechaSeleccionada = req.query.fecha || null;
    const tipoConteo = req.query.tipoConteo || "Jobs";

    pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("FechaSeleccionada", sql.Date, fechaSeleccionada);
    request.input("TipoConteo", sql.VarChar, tipoConteo);

    console.log("📤 Parámetros enviados al SP:", {
      FechaSeleccionada: fechaSeleccionada,
      TipoConteo: tipoConteo,
    });

    const result = await request.execute("sp_ReporteTurnosPorFecha");
    const data = result.recordset;

    console.log(`✅ SP 'sp_ReporteTurnosPorFecha' ejecutado con éxito.`);
    console.log(`📊 Número de registros devueltos: ${data.length}`);
    // Opcional: muestra los primeros 5 registros para depuración
    // console.log("🔍 Primeros 5 registros:", data.slice(0, 5));

    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener reporte de turnos:", err.message);
    res.status(500).json({ error: "Error al obtener el reporte de turnos" });
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log("🔒 Conexión a DB cerrada.");
      } catch (closeErr) {
        console.error("❌ Error al cerrar el pool:", closeErr.message);
      }
    }
  }
});

/**
 * Endpoint para obtener métricas de captura mensuales, semanales y diarias.
 * Llama al Procedimiento Almacenado GetMultiResultCapturesMetrics.
 * Requiere: year (query param). Opcional: month (query param).
 * * Ejemplo: GET /api/captures-metrics?year=2025&month=10
 */

app.get("/api/captures-metrics", async (req, res) => {
  let pool;
  try {
    // 1. Validar y obtener parámetros de la URL
    const year = parseInt(req.query.year);
    const month = req.query.month ? parseInt(req.query.month) : null;

    // LOG: parámetros recibidos
    console.log(
      `[API Metrics] Recibida solicitud. Parámetros: Año=${year}, Mes=${month}`
    );

    if (isNaN(year)) {
      return res.status(400).send({
        message: "El parámetro 'year' es obligatorio y debe ser numérico.",
      });
    }

    // 2. Conectar a la base de datos
    pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("Ano", sql.Int, year);
    request.input("MesActual", sql.Int, month);

    // LOG: parámetros enviados al SP
    console.log(
      `[API Metrics] Ejecutando SP 'GetMultiResultCapturesMetrics' con Ano=${year}, MesActual=${month}`
    );

    // 3. Ejecutar SP
    const result = await request.execute("GetMultiResultCapturesMetrics");

    const monthlyData = result.recordsets[0] || [];
    const weeklyData = result.recordsets[1] || [];
    const dailyData = result.recordsets[2] || [];

    // LOG: resumen de cantidad de registros
    console.log(
      `[API Metrics] Resultados del SP - Mensual: ${monthlyData.length} regs, Semanal: ${weeklyData.length} regs, Diario: ${dailyData.length} regs`
    );

    // LOG: mostrar los primeros 5 registros de cada conjunto para inspección
    console.log("Primeros registros Mensual:", monthlyData.slice(0, 5));
    console.log("Primeros registros Semanal:", weeklyData.slice(0, 5));
    console.log("Primeros registros Diario:", dailyData.slice(0, 5));

    // 4. Devolver datos
    res.status(200).send({
      message: "Métricas de captura obtenidas exitosamente.",
      data: { monthly: monthlyData, weekly: weeklyData, daily: dailyData },
    });
  } catch (err) {
    console.error(`Error en /api/captures-metrics: ${err.message}`);
    res.status(500).send({
      message: "Error interno del servidor al obtener las métricas.",
      error: err.message,
    });
  } finally {
    // 5. Cerrar el pool
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar el pool de conexión:", closeErr.message);
      }
    }
  }
});

// ───────────────────────────────────────────────────────────────
//  ENDPOINT: Impresión de Documentos
// ───────────────────────────────────────────────────────────────

app.post("/api/print/send", async (req, res) => {
  const { ip, type, data, pageRange } = req.body;
  console.log("paginas: ", pageRange);
  const finalPageRange =
    pageRange && pageRange.trim() !== "" ? pageRange : "all";

  if (!ip || !type || !data || type !== "document_online") {
    return res.status(400).json({
      success: false,
      message:
        "Faltan datos requeridos (IP, Tipo, URL) o el tipo no es 'document_online'.",
    });
  }

  try {
    const fileResponse = await axios.get(data, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(fileResponse.data);

    const printerPort = 9100;

    await new Promise((resolve, reject) => {
      const client = net.createConnection(
        { port: printerPort, host: ip },
        () => {
          client.write(fileBuffer, (err) => {
            if (err) {
              client.destroy();
              return reject(
                new Error(`Fallo al enviar datos al socket: ${err.message}`)
              );
            }
            client.end();
          });
        }
      );

      client.on("error", (err) => {
        let errorMsg;
        if (err.code === "ECONNREFUSED") {
          errorMsg = `ERROR: Conexión rechazada. Verifique que la IP (${ip}) es correcta y que el puerto ${printerPort} está abierto.`;
        } else if (err.code === "ETIMEDOUT") {
          errorMsg = `ERROR: Tiempo de espera agotado al intentar conectar a ${ip}.`;
        } else {
          errorMsg = `Error de socket desconocido: ${err.message}`;
        }
        reject(new Error(errorMsg));
      });

      client.on("timeout", () => {
        client.destroy();
        reject(
          new Error(
            `Tiempo de espera agotado al conectar o enviar a ${ip}:${printerPort}.`
          )
        );
      });

      client.on("close", () => {
        resolve();
      });

      client.setTimeout(5000);
    });

    return res.json({
      success: true,
      message: `Documento descargado y enviado exitosamente a la impresora de red (${ip}). Solicitud de rango de páginas: ${finalPageRange}.`,
    });
  } catch (error) {
    let userMessage = error.message;
    if (error.response?.status === 404) {
      userMessage =
        "El documento en la URL proporcionada no se encontró (404).";
    }

    return res.status(500).json({
      success: false,
      message: `Fallo al procesar o enviar la impresión: ${userMessage}`,
    });
  }
});

// ───────────────────────────────────────────────────────────────
//  STATIC SPA: servir dist/spa y fallback a index.html
// ───────────────────────────────────────────────────────────────

const spaDir = path.join(__dirname, "dist", "spa");

app.use(express.static(spaDir));

// Fallback SOLO para rutas que NO empiezan con /api
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(spaDir, "index.html"));
});

/**
 * @route GET /reports/job-details/:jobNumber
 * @description Obtiene la trazabilidad de producción de un Job mediante un Pivot.
 * @param { string } jobNumber - Número de Job para consultar.
 */
app.get("/api/reports/job-details/:jobNumber", async (req, res) => {
  const { jobNumber } = req.params;
  let pool;

  try {
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("JobNumber", sql.VarChar, jobNumber);

    const result = await request.execute(
      "SP_GetJobProductionTraceabilityPivot"
    );
    const data = result.recordset;

    if (data && data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({
        success: false,
        message: "No se encontró información para el Job solicitado.",
      });
    }
  } catch (err) {
    console.error(
      "Error al ejecutar SP_GetJobProductionTraceabilityPivot:",
      err.message
    );
    res.status(500).json({
      success: false,
      message: "Error en el servidor al consultar la trazabilidad.",
      error: err.message,
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

/**
 * @route GET /reports/weekly-report
 * @description Ejecuta el SP WeeklyReport para obtener datos de la semana.
 */
app.get("/api/reports/weekly-report", async (req, res) => {
  let pool;
  try {
    const { from, to } = req.query; // Opcional: parámetros para filtrar por fecha
    console.log("req.query", req.query);
    console.log();
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros 'from' y 'to' para el rango de fechas.",
      });
    }
    pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("FromDate", sql.Date, from);
    request.input("ToDate", sql.Date, to);

    const result = await request.execute("WeeklyReport");
    const data = result.recordset;

    if (data && data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({
        success: false,
        message: "No se encontraron datos para el reporte semanal.",
      });
    }
  } catch (err) {
    console.error("Error al ejecutar WeeklyReport:", err.message);
    res.status(500).json({
      success: false,
      message: "Error en el servidor al generar el reporte.",
      error: err.message,
    });
  } finally {
    if (pool) await pool.close();
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor backend MES escuchando en http://localhost:${port}`);
  console.log(
    "Intenta acceder a http://localhost:3000 para verificar la conexión a la DB."
  );
  console.log(
    `Endpoint para obtener info de empleado: http://localhost:${port}/api/getEmp/:badgeNum`
  );
  console.log(
    `Endpoint para insertar producción: http://localhost:${port}/api/production/insert`
  );
  console.log(
    `Endpoint para historial de producción: http://localhost:${port}/api/production/history?lineCodeId={lineId}&stationId={stationId}&prodDate={YYYYMMDD}`
  );
});
