import type { Articulo, Cliente, NuevoCliente, NuevoPedido, Pedido } from "../dominio";
import { RUTA_SEMILLAS_JSON } from "./configuracion";
import type { FuenteDatos } from "./contrato";

/** Estructura mínima del archivo de semillas que necesita esta fuente. */
interface SemillasJson {
  articulos: Articulo[];
  clientes: Cliente[];
  pedidos: Pedido[];
}

/** Estado que permanece en memoria después de descargar el archivo JSON una vez. */
interface EstadoJson {
  articulos: Articulo[];
  clientes: Cliente[];
  pedidos: Pedido[];
}

// Se conserva la descarga para no pedir el mismo archivo en cada operación.
let estado: EstadoJson | undefined;

/** Crea copias de los registros para nunca alterar public/semillas.json. */
function copiarSemillas(semillas: SemillasJson): EstadoJson {
  return {
    articulos: semillas.articulos.map((articulo) => ({ ...articulo })),
    clientes: semillas.clientes.map((cliente) => ({ ...cliente })),
    pedidos: semillas.pedidos.map((pedido) => ({ ...pedido })),
  };
}

/** Descarga las semillas la primera vez y después reutiliza el estado de la sesión. */
async function obtenerEstado(): Promise<EstadoJson> {
  if (estado) return estado;

  const respuesta = await fetch(RUTA_SEMILLAS_JSON);
  if (!respuesta.ok) {
    throw new Error("No se pudo cargar el archivo de semillas JSON");
  }

  estado = copiarSemillas(await respuesta.json() as SemillasJson);
  return estado;
}

/** Calcula el siguiente identificador sin depender de una base de datos. */
function siguienteId(pedidos: Pedido[]): number {
  return pedidos.reduce((mayor, pedido) => Math.max(mayor, pedido.id), 0) + 1;
}

/** Aplica la regla del 10% desde cinco unidades y redondea a dos decimales. */
function calcularTotal(cantidad: number, precioUnitario: number): Pick<Pedido, "total" | "descuentoAplicado"> {
  const descuentoAplicado = cantidad >= 5;
  const bruto = cantidad * precioUnitario;
  const total = descuentoAplicado ? bruto * 0.9 : bruto;
  return { total: Math.round(total * 100) / 100, descuentoAplicado };
}

// La creación de clientes forma parte de CP3; se declara aquí para cumplir el contrato.
const pendiente = <T>(): Promise<T> => Promise.reject(new Error("no implementado hasta CP3"));

/** Fuente CP2: lee una vez /semillas.json y luego opera con copias en memoria. */
export const fuenteJson: FuenteDatos = {
  listarArticulos: async () => (await obtenerEstado()).articulos.map((articulo) => ({ ...articulo })),
  listarClientes: async () => (await obtenerEstado()).clientes.map((cliente) => ({ ...cliente })),
  crearCliente: (_datos: NuevoCliente) => pendiente<Cliente>(),
  listarPedidos: async () => (await obtenerEstado()).pedidos.map((pedido) => ({ ...pedido })),
  crearPedido: async (datos: NuevoPedido) => {
    const datosJson = await obtenerEstado();
    const articulo = datosJson.articulos.find((item) => item.id === datos.articuloId);
    const cliente = datosJson.clientes.find((item) => item.id === datos.clienteId);

    // R1: el artículo debe estar activo y el cliente debe existir.
    if (!articulo) throw new Error("El artículo seleccionado no existe");
    if (!articulo.activo) throw new Error(`"${articulo.nombre}" está inactivo`);
    if (!cliente) throw new Error("El cliente seleccionado no existe");

    // R2: solo se aceptan cantidades enteras entre 1 y la disponibilidad actual.
    if (!Number.isInteger(datos.cantidad) || datos.cantidad < 1) {
      throw new Error("La cantidad mínima es 1");
    }
    if (datos.cantidad > articulo.disponibles) {
      throw new Error(`Solo quedan ${articulo.disponibles} disponibles`);
    }

    // R3 y R5: se calcula el importe y se descuenta inventario al registrar.
    const calculo = calcularTotal(datos.cantidad, articulo.precioUnitario);
    const pedido: Pedido = {
      id: siguienteId(datosJson.pedidos),
      articuloId: articulo.id,
      clienteId: cliente.id,
      cantidad: datos.cantidad,
      total: calculo.total,
      descuentoAplicado: calculo.descuentoAplicado,
      estado: "PENDIENTE",
    };
    articulo.disponibles -= datos.cantidad;
    datosJson.pedidos.push(pedido);
    return { ...pedido };
  },
  cancelarPedido: (_id: number) => pendiente<Pedido>(),
};
