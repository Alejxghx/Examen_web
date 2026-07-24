// ARCHIVO BLOQUEADO — NO MODIFICAR
// ============================================================================
// SERVIDOR MOCK — Examen práctico final IS-403 (Aplicaciones para el Cliente Web)
// ----------------------------------------------------------------------------
// Uso:     node servidor-mock.cjs semillas-tema-XX.json [puerto]
// Puerto:  3000 por defecto.
//
// Este servidor es GENÉRICO: no sabe nada de su temática. Lee el archivo de
// semillas y construye sus endpoints con los nombres declarados ahí
// (recursoA, recursoB). Reiniciarlo restaura los datos semilla.
//
// Endpoints (sustituya {A} y {B} por los recursos de SU temática):
//   GET    /                 → índice con los endpoints disponibles
//   GET    /{A}              → catálogo completo (activos e inactivos)
//   GET    /clientes         → clientes
//   POST   /clientes         → crear cliente { nombre, cedula, telefono }
//   GET    /{B}              → transacciones
//   POST   /{B}              → crear { <A>Id, clienteId, cantidad }
//   PATCH  /{B}/:id          → cancelar/anular/retirar (solo desde el estado inicial)
//
// Códigos de estado: 201 creado · 400 JSON inválido · 404 no existe ·
//                    409 estado no permite la acción · 422 regla de negocio.
// ============================================================================
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

// ---------------------------------------------------------------- arranque --
const archivoSemillas = process.argv[2];
if (!archivoSemillas) {
  console.error("Uso: node servidor-mock.cjs <semillas-tema-XX.json> [puerto]");
  process.exit(1);
}
const rutaSemillas = path.resolve(archivoSemillas);
const PUERTO = Number(process.argv[3] || process.env.PUERTO || 3000);

let datos; // estado en memoria del servidor (se resiembra en cada arranque)
function sembrar() {
  const crudo = fs.readFileSync(rutaSemillas, "utf-8");
  datos = JSON.parse(crudo);
  for (const clave of ["recursoA", "recursoB", "estadoInicial", "estadoFinal", "clientes"]) {
    if (!(clave in datos)) {
      console.error(`Semillas inválidas: falta la clave "${clave}"`);
      process.exit(1);
    }
  }
}
sembrar();

const A = datos.recursoA;              // p. ej. "arreglos"
const B = datos.recursoB;              // p. ej. "encargos"
const CAMPO_REF_A =
  datos.campoRefA || A.replace(/s$/, "") + "Id"; // p. ej. "arregloId" — las
  // semillas pueden fijarlo explícitamente (plurales irregulares: funciones→funcionId)
const DESC = datos.descuento || { desdeUnidades: 5, porcentaje: 10 };

// -------------------------------------------------------------- utilidades --
function redondear2(n) {
  return Math.round(n * 100) / 100;
}

function calcularTotal(cantidad, precioUnitario) {
  const bruto = cantidad * precioUnitario;
  const conDescuento = cantidad >= DESC.desdeUnidades;
  const total = conDescuento ? bruto * (1 - DESC.porcentaje / 100) : bruto;
  return { total: redondear2(total), descuentoAplicado: conDescuento };
}

function siguienteId(coleccion) {
  return coleccion.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

function responder(res, codigo, cuerpo) {
  const json = JSON.stringify(cuerpo, null, 2);
  res.writeHead(codigo, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(json);
}

function error(res, codigo, mensaje) {
  responder(res, codigo, { error: mensaje });
}

function leerCuerpo(req) {
  return new Promise((resolver, rechazar) => {
    let crudo = "";
    req.on("data", (t) => (crudo += t));
    req.on("end", () => {
      if (crudo.trim() === "") return resolver({});
      try {
        resolver(JSON.parse(crudo));
      } catch {
        rechazar(new Error("JSON inválido en el cuerpo de la petición"));
      }
    });
  });
}

// ------------------------------------------------------------------ rutas --
async function manejar(req, res) {
  const url = new URL(req.url, `http://localhost:${PUERTO}`);
  const partes = url.pathname.split("/").filter(Boolean); // ["encargos", "3"]

  // Preflight CORS (el navegador lo envía antes de POST/PATCH entre orígenes)
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // GET / → índice
  if (req.method === "GET" && partes.length === 0) {
    return responder(res, 200, {
      negocio: datos.negocio,
      tema: datos.tema,
      endpoints: [
        `GET  /${A}`,
        "GET  /clientes",
        "POST /clientes",
        `GET  /${B}`,
        `POST /${B}`,
        `PATCH /${B}/:id`,
      ],
      nota: "Reiniciar el servidor restaura los datos semilla.",
    });
  }

  // GET /{A}
  if (req.method === "GET" && partes.length === 1 && partes[0] === A) {
    return responder(res, 200, datos[A]);
  }

  // GET /clientes
  if (req.method === "GET" && partes.length === 1 && partes[0] === "clientes") {
    return responder(res, 200, datos.clientes);
  }

  // POST /clientes
  if (req.method === "POST" && partes.length === 1 && partes[0] === "clientes") {
    let cuerpo;
    try {
      cuerpo = await leerCuerpo(req);
    } catch (e) {
      return error(res, 400, e.message);
    }
    const nombre = String(cuerpo.nombre || "").trim();
    const cedula = String(cuerpo.cedula || "").trim();
    const telefono = String(cuerpo.telefono || "").trim();
    if (!nombre || !cedula) {
      return error(res, 422, "El cliente requiere nombre y cédula");
    }
    const cliente = { id: siguienteId(datos.clientes), nombre, cedula, telefono };
    datos.clientes.push(cliente);
    return responder(res, 201, cliente);
  }

  // GET /{B}
  if (req.method === "GET" && partes.length === 1 && partes[0] === B) {
    return responder(res, 200, datos[B]);
  }

  // POST /{B}  — aplica R1, R2, R3 y la mitad de R5 (descuento de disponibilidad)
  if (req.method === "POST" && partes.length === 1 && partes[0] === B) {
    let cuerpo;
    try {
      cuerpo = await leerCuerpo(req);
    } catch (e) {
      return error(res, 400, e.message);
    }
    const refA = Number(cuerpo[CAMPO_REF_A]);
    const clienteId = Number(cuerpo.clienteId);
    const cantidad = Number(cuerpo.cantidad);

    if (!Number.isInteger(refA) || !Number.isInteger(clienteId) || !Number.isInteger(cantidad)) {
      return error(res, 422, `Se requieren ${CAMPO_REF_A}, clienteId y cantidad (enteros)`);
    }
    if (cantidad < 1) {
      return error(res, 422, "La cantidad mínima es 1");
    }

    const itemA = datos[A].find((r) => r.id === refA);
    if (!itemA) return error(res, 404, `No existe el registro ${refA} en ${A}`);
    if (!itemA.activo) return error(res, 422, `"${itemA.nombre}" está inactivo`); // R1

    const cliente = datos.clientes.find((c) => c.id === clienteId);
    if (!cliente) return error(res, 404, `No existe el cliente ${clienteId}`); // R1

    if (cantidad > itemA.disponibles) {
      return error(res, 422, `Solo quedan ${itemA.disponibles} disponibles`); // R2
    }

    const { total, descuentoAplicado } = calcularTotal(cantidad, itemA.precioUnitario); // R3
    const registro = {
      id: siguienteId(datos[B]),
      [CAMPO_REF_A]: refA,
      clienteId,
      cantidad,
      total,
      descuentoAplicado,
      estado: datos.estadoInicial,
    };
    itemA.disponibles -= cantidad; // R5 (al crear se descuenta)
    datos[B].push(registro);
    return responder(res, 201, registro);
  }

  // PATCH /{B}/:id — aplica R4 y la otra mitad de R5 (reposición)
  if (req.method === "PATCH" && partes.length === 2 && partes[0] === B) {
    const id = Number(partes[1]);
    let cuerpo;
    try {
      cuerpo = await leerCuerpo(req);
    } catch (e) {
      return error(res, 400, e.message);
    }
    if (cuerpo.estado !== undefined && cuerpo.estado !== datos.estadoFinal) {
      return error(res, 422, `La única transición permitida por esta vía es a ${datos.estadoFinal}`);
    }
    const registro = datos[B].find((r) => r.id === id);
    if (!registro) return error(res, 404, `No existe el registro ${id} en ${B}`);
    if (registro.estado !== datos.estadoInicial) {
      return error(res, 409, `Solo se permite en estado ${datos.estadoInicial} (actual: ${registro.estado})`); // R4
    }
    registro.estado = datos.estadoFinal;
    const itemA = datos[A].find((r) => r.id === registro[CAMPO_REF_A]);
    if (itemA) itemA.disponibles += registro.cantidad; // R5 (al cancelar se repone)
    return responder(res, 200, registro);
  }

  return error(res, 404, `Ruta no encontrada: ${req.method} ${url.pathname}`);
}

// --------------------------------------------------------------- servidor --
const servidor = http.createServer((req, res) => {
  manejar(req, res).catch((e) => error(res, 500, `Error interno: ${e.message}`));
});

servidor.listen(PUERTO, () => {
  console.log(`Mock de "${datos.negocio}" escuchando en http://localhost:${PUERTO}`);
  console.log(`Recursos: /${A}, /clientes, /${B}`);
  console.log("Reinicie el servidor (Ctrl+C y volver a ejecutar) para restaurar las semillas.");
});
