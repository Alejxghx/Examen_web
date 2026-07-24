import type { Articulo, Cliente, NuevoCliente, NuevoPedido, Pedido } from "../dominio";
import { URL_API } from "./configuracion";
import type { FuenteDatos } from "./contrato";

/** Formato común de los errores que devuelve el servidor mock. */
interface RespuestaError {
  error: string;
}

/**
 * Realiza una petición REST al mock, convierte la respuesta a JSON y transforma
 * los errores HTTP en errores que la interfaz puede mostrar al usuario.
 */
async function pedir<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const respuesta = await fetch(`${URL_API}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...opciones?.headers,
    },
  });
  const cuerpo = await respuesta.json() as T | RespuestaError;

  if (!respuesta.ok) {
    const mensaje = typeof cuerpo === "object" && cuerpo !== null && "error" in cuerpo
      ? (cuerpo as RespuestaError).error
      : "Error al comunicarse con el servidor mock";
    throw new Error(mensaje);
  }

  return cuerpo as T;
}

/** Fuente CP3: todas sus operaciones se realizan contra http://localhost:3000. */
export const fuenteApi: FuenteDatos = {
  // Consultas REST de los tres recursos que necesita la pantalla de detalle.
  listarArticulos: () => pedir<Articulo[]>("/articulos"),
  listarClientes: () => pedir<Cliente[]>("/clientes"),
  listarPedidos: () => pedir<Pedido[]>("/pedidos"),

  // Envía los datos del nuevo cliente al endpoint POST /clientes.
  crearCliente: (datos: NuevoCliente) => pedir<Cliente>("/clientes", {
    method: "POST",
    body: JSON.stringify(datos),
  }),

  // Envía un pedido para que el servidor aplique las reglas de negocio.
  crearPedido: (datos: NuevoPedido) => pedir<Pedido>("/pedidos", {
    method: "POST",
    body: JSON.stringify(datos),
  }),

  // La única transición permitida por el mock es llevar PENDIENTE a CANCELADO.
  cancelarPedido: (id: number) => pedir<Pedido>(`/pedidos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ estado: "CANCELADO" }),
  }),
};
