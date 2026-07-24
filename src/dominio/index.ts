/** Lenguaje de la aplicación. Esta capa no depende de datos ni de interfaz. */
export interface Articulo {
  id: number;
  nombre: string;
  precioUnitario: number;
  disponibles: number;
  activo: boolean;
}

/** Datos persistidos de un cliente registrado. */
export interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
}

/** Datos que se envían para crear un cliente; el id lo asigna la fuente de datos. */
export type NuevoCliente = Omit<Cliente, "id">;

/** Estados permitidos por el ciclo de vida de un pedido. */
export type EstadoPedido = "PENDIENTE" | "ENTREGADO" | "CANCELADO";

/** Registro de una transacción de pedido ya creada. */
export interface Pedido {
  id: number;
  articuloId: number;
  clienteId: number;
  cantidad: number;
  total: number;
  descuentoAplicado: boolean;
  estado: EstadoPedido;
}

/** Datos mínimos que se requieren antes de crear un pedido. */
export interface NuevoPedido {
  articuloId: number;
  clienteId: number;
  cantidad: number;
}
