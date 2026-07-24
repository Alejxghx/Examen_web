import type { FuenteDatos } from "./contrato";

// Marcador temporal: las llamadas REST al mock se desarrollarán en CP3.
const pendiente = () => Promise.reject(new Error("no implementado en CP1"));

/** Mantiene el contrato de la futura fuente REST sin acoplar la interfaz al servidor. */
export const fuenteApi: FuenteDatos = {
  listarArticulos: pendiente,
  listarClientes: pendiente,
  crearCliente: pendiente,
  listarPedidos: pendiente,
  crearPedido: pendiente,
  cancelarPedido: pendiente,
};
