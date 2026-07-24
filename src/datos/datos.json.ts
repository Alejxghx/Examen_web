import type { FuenteDatos } from "./contrato";

// Marcador temporal: la fuente JSON se desarrollará en CP2.
const pendiente = () => Promise.reject(new Error("no implementado en CP1"));

/** Mantiene la misma interfaz que las demás fuentes, aunque aún no carga el JSON. */
export const fuenteJson: FuenteDatos = {
  listarArticulos: pendiente,
  listarClientes: pendiente,
  crearCliente: pendiente,
  listarPedidos: pendiente,
  crearPedido: pendiente,
  cancelarPedido: pendiente,
};
