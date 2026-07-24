/** Fuente de datos por defecto si no hay ninguna configurada. */
export const FUENTE_POR_DEFECTO = "memoria";

/** URL base del servidor mock (modo api). */
export const URL_API = "http://localhost:3000";

/** Ruta del archivo estático de semillas (modo json). */
export const RUTA_SEMILLAS_JSON = "/semillas.json";

/** Variante Vite: lee VITE_FUENTE_DATOS desde .env. */
export function leerFuente(): string {
  return import.meta.env.VITE_FUENTE_DATOS ?? FUENTE_POR_DEFECTO;
}
