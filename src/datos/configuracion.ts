/** Fuente de datos de respaldo cuando no existe la variable de entorno. */
export const FUENTE_POR_DEFECTO = "memoria";

/** URL base del servidor mock (modo api). */
export const URL_API = "http://localhost:3000";

/** Ruta del archivo estático de semillas (modo json). */
export const RUTA_SEMILLAS_JSON = "/semillas.json";

/**
 * Variante para Vite. Lee VITE_FUENTE_DATOS desde el entorno y permite
 * conmutar entre memoria, json y api sin que la interfaz cambie.
 */
export function leerFuente(): string {
  return import.meta.env.VITE_FUENTE_DATOS ?? FUENTE_POR_DEFECTO;
}
