/** Lenguaje de la aplicación. Esta capa no depende de datos ni de interfaz. */
export interface Articulo {
  /** Identificador único del artículo. */
  id: number;
  /** Nombre mostrado en el catálogo. */
  nombre: string;
  /** Valor de una unidad, antes de cualquier descuento. */
  precioUnitario: number;
  /** Unidades disponibles actualmente para pedidos. */
  disponibles: number;
  /** Indica si el artículo se puede utilizar para crear pedidos. */
  activo: boolean;
}

/** Datos persistidos de un cliente registrado. */
export interface Cliente {
  /** Identificador asignado al crear el cliente. */
  id: number;
  /** Nombre completo del cliente. */
  nombre: string;
  /** Cédula usada para identificar al cliente. */
  cedula: string;
  /** Teléfono de contacto. */
  telefono: string;
}

/** Datos que se envían para crear un cliente; el id lo asigna la fuente de datos. */
export type NuevoCliente = Omit<Cliente, "id">;

/** Estados permitidos por el ciclo de vida de un pedido. */
export type EstadoPedido = "PENDIENTE" | "ENTREGADO" | "CANCELADO";

/** Registro de una transacción de pedido ya creada. */
export interface Pedido {
  /** Identificador único del pedido. */
  id: number;
  /** Artículo solicitado. */
  articuloId: number;
  /** Cliente que realizó el pedido. */
  clienteId: number;
  /** Número de unidades solicitadas. */
  cantidad: number;
  /** Importe final, con descuento si corresponde. */
  total: number;
  /** Señala si se aplicó la regla de descuento. */
  descuentoAplicado: boolean;
  /** Estado actual del pedido. */
  estado: EstadoPedido;
}

/** Datos mínimos que se requieren antes de crear un pedido. */
export interface NuevoPedido {
  /** Artículo que será descontado del inventario. */
  articuloId: number;
  /** Cliente existente que realiza el pedido. */
  clienteId: number;
  /** Cantidad que se validará contra la disponibilidad. */
  cantidad: number;
}
