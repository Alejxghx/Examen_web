import semillas from "../../mock/semillas.json";
import type { Articulo, Cliente, NuevoCliente, NuevoPedido, Pedido } from "../dominio";
import type { FuenteDatos } from "./contrato";

const articulos: Articulo[] = semillas.articulos.map((articulo) => ({ ...articulo }));

const pendiente = <T>(): Promise<T> => Promise.reject(new Error("no implementado en CP1"));

export const fuenteMemoria: FuenteDatos = {
  listarArticulos: async () => articulos.map((articulo) => ({ ...articulo })),
  listarClientes: () => pendiente<Cliente[]>(),
  crearCliente: (_datos: NuevoCliente) => pendiente<Cliente>(),
  listarPedidos: () => pendiente<Pedido[]>(),
  crearPedido: (_datos: NuevoPedido) => pendiente<Pedido>(),
  cancelarPedido: (_id: number) => pendiente<Pedido>(),
};
