/** Lenguaje de la aplicación. Esta capa no depende de datos ni de interfaz. */
export interface Articulo {
  id: number;
  nombre: string;
  precioUnitario: number;
  disponibles: number;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
}

export type NuevoCliente = Omit<Cliente, "id">;

export type EstadoPedido = "PENDIENTE" | "ENTREGADO" | "CANCELADO";

export interface Pedido {
  id: number;
  articuloId: number;
  clienteId: number;
  cantidad: number;
  total: number;
  descuentoAplicado: boolean;
  estado: EstadoPedido;
}

export interface NuevoPedido {
  articuloId: number;
  clienteId: number;
  cantidad: number;
}
