import type { FuenteDatos } from "./contrato";

const pendiente = () => Promise.reject(new Error("no implementado en CP1"));

export const fuenteJson: FuenteDatos = {
  listarArticulos: pendiente,
  listarClientes: pendiente,
  crearCliente: pendiente,
  listarPedidos: pendiente,
  crearPedido: pendiente,
  cancelarPedido: pendiente,
};
