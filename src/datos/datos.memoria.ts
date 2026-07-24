// Las semillas solo se leen al iniciar; no se modifica el archivo bloqueado.
import semillas from "../../mock/semillas.json";
import type { Articulo, Cliente, NuevoCliente, NuevoPedido, Pedido } from "../dominio";
import type { FuenteDatos } from "./contrato";

// Copia el catálogo a memoria para que las futuras mutaciones no alteren las semillas.
const articulos: Articulo[] = semillas.articulos.map((articulo) => ({ ...articulo }));

// Durante CP1 las operaciones no requeridas deben existir por el contrato,
// pero informan claramente que todavía no tienen implementación.
const pendiente = <T>(): Promise<T> => Promise.reject(new Error("no implementado en CP1"));

/** Implementación activa en CP1: trabaja con arreglos JavaScript en memoria. */
export const fuenteMemoria: FuenteDatos = {
  // Devuelve copias para impedir que una pantalla cambie el estado interno.
  listarArticulos: async () => articulos.map((articulo) => ({ ...articulo })),
  // Las siguientes operaciones se implementarán en CP2 y CP3.
  listarClientes: () => pendiente<Cliente[]>(),
  crearCliente: (_datos: NuevoCliente) => pendiente<Cliente>(),
  listarPedidos: () => pendiente<Pedido[]>(),
  crearPedido: (_datos: NuevoPedido) => pendiente<Pedido>(),
  cancelarPedido: (_id: number) => pendiente<Pedido>(),
};
