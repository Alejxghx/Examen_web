// ============================================================================
// CONFIGURACIÓN DE LA CAPA DE DATOS — este archivo SÍ puede (y debe) editarlo.
// ----------------------------------------------------------------------------
// Aquí vive la ÚNICA diferencia entre frameworks: de dónde se lee la fuente
// de datos activa. Deje SOLO la variante de su framework y borre la otra.
// ============================================================================

/** Fuente de datos por defecto si no hay ninguna configurada: "memoria" | "json" | "api". */
export const FUENTE_POR_DEFECTO = "memoria";

/** URL base del servidor mock (modo api). */
export const URL_API = "http://localhost:3000";

/** Ruta del archivo estático de semillas (modo json). */
export const RUTA_SEMILLAS_JSON = "/semillas.json";

// ----------------------------------------------------------------------------
// leerFuente(): devuelve "memoria" | "json" | "api".
// La fábrica (index.ts, bloqueada) llama a esta función. Elija UNA variante.
// ----------------------------------------------------------------------------

// ---- VARIANTE VITE (React, Vue, Svelte, vanilla) ---------------------------
// Lee VITE_FUENTE_DATOS del archivo .env de la raíz.
export function leerFuente(): string {
  return import.meta.env?.VITE_FUENTE_DATOS ?? FUENTE_POR_DEFECTO;
}

// ---- VARIANTE ANGULAR ------------------------------------------------------
// Borre la función de arriba y descomente esta. Defina fuenteDatos en
// src/environments/environment.ts:  export const environment = { fuenteDatos: "memoria" };
//
// import { environment } from "../environments/environment";
// export function leerFuente(): string {
//   return environment.fuenteDatos ?? FUENTE_POR_DEFECTO;
// }
