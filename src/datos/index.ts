// ARCHIVO BLOQUEADO — NO MODIFICAR
// ============================================================================
// FÁBRICA DE LA CAPA DE DATOS
// ----------------------------------------------------------------------------
// Decide qué fuente usa la aplicación SIN que ningún otro archivo cambie.
// El mecanismo de conmutación (contrato + fábrica) está BLOQUEADO; lo único
// que depende de su framework es DE DÓNDE se lee la variable, y eso vive en
// el archivo editable ./configuracion.ts (función leerFuente()).
//
// Usted debe crear, junto a este archivo, las tres implementaciones:
//   datos.memoria.ts  -> export const fuenteMemoria: FuenteDatos
//   datos.json.ts     -> export const fuenteJson: FuenteDatos
//   datos.api.ts      -> export const fuenteApi: FuenteDatos
// Los tres archivos deben existir desde CP1 (aunque dos sean esqueletos que
// rechacen con "no implementado").
// ============================================================================
import type { FuenteDatos } from "./contrato";
import { leerFuente } from "./configuracion";
import { fuenteMemoria } from "./datos.memoria";
import { fuenteJson } from "./datos.json";
import { fuenteApi } from "./datos.api";

export type NombreFuente = "memoria" | "json" | "api";

function normalizar(valor: string): NombreFuente {
  if (valor === "memoria" || valor === "json" || valor === "api") {
    return valor;
  }
  console.warn(`Fuente de datos desconocida: "${valor}". Se usa "memoria".`);
  return "memoria";
}

export const FUENTE_ACTIVA: NombreFuente = normalizar(leerFuente());

export function obtenerFuenteDatos(): FuenteDatos {
  switch (FUENTE_ACTIVA) {
    case "json":
      return fuenteJson;
    case "api":
      return fuenteApi;
    default:
      return fuenteMemoria;
  }
}

export type { FuenteDatos } from "./contrato";
