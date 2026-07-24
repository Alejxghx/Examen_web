import type { Articulo, Cliente, NuevoCliente, Pedido } from "../dominio";
import { crearBadgeDescuento, crearBadgePedido } from "../componentes/BadgePedido";

/** Operaciones que la pantalla recibe desde la fuente activa, sin conocer su implementación. */
type CancelarPedido = (id: number) => Promise<Pedido>;
type CrearCliente = (datos: NuevoCliente) => Promise<Cliente>;

const moneda = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

/** Crea una celda de tabla usando texto para evitar interpolar información dinámica como HTML. */
function crearCelda(texto?: string): HTMLTableCellElement {
  const celda = document.createElement("td");
  if (texto) celda.textContent = texto;
  return celda;
}

/**
 * Renderiza la Pantalla 03 y conecta las acciones de cancelar pedido y crear
 * cliente con la fuente de datos seleccionada por la fábrica.
 */
export function crearPantallaPedidos(
  articulos: Articulo[],
  clientes: Cliente[],
  pedidos: Pedido[],
  cancelarPedido: CancelarPedido,
  crearCliente: CrearCliente,
): HTMLElement {
  const seccion = document.createElement("section");
  seccion.className = "pedidos";
  seccion.innerHTML = `
    <div class="encabezado-pantalla">
      <h2>Pedidos</h2>
      <button type="button" class="boton-secundario" data-nuevo-cliente>+ Nuevo cliente</button>
    </div>
    <p class="mensaje-error" role="alert" data-error></p>
    <p class="mensaje-exito" role="status" data-exito></p>
    <div class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Artículo</th>
            <th>Cant.</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
    <dialog class="dialogo-cliente" data-dialogo-cliente>
      <form data-formulario-cliente>
        <h3>Nuevo cliente</h3>
        <label for="nombre-cliente">Nombre <b aria-label="campo obligatorio">*</b></label>
        <input id="nombre-cliente" name="nombre" required />
        <label for="cedula-cliente">Cédula <b aria-label="campo obligatorio">*</b></label>
        <input id="cedula-cliente" name="cedula" required />
        <label for="telefono-cliente">Teléfono</label>
        <input id="telefono-cliente" name="telefono" />
        <p class="mensaje-error" role="alert" data-error-cliente></p>
        <div class="acciones-dialogo">
          <button type="button" class="boton-secundario" data-cerrar-cliente>Cancelar</button>
          <button type="submit" class="boton-principal">Guardar cliente</button>
        </div>
      </form>
    </dialog>`;

  const cuerpo = seccion.querySelector("tbody");
  const error = seccion.querySelector<HTMLElement>("[data-error]");
  const exito = seccion.querySelector<HTMLElement>("[data-exito]");
  const botonNuevoCliente = seccion.querySelector<HTMLButtonElement>("[data-nuevo-cliente]");
  const dialogo = seccion.querySelector<HTMLDialogElement>("[data-dialogo-cliente]");
  const formularioCliente = seccion.querySelector<HTMLFormElement>("[data-formulario-cliente]");
  const errorCliente = seccion.querySelector<HTMLElement>("[data-error-cliente]");
  const botonCerrarCliente = seccion.querySelector<HTMLButtonElement>("[data-cerrar-cliente]");

  if (!cuerpo || !error || !exito || !botonNuevoCliente || !dialogo || !formularioCliente || !errorCliente || !botonCerrarCliente) {
    throw new Error("No se pudo crear la pantalla de pedidos");
  }

  /** Dibuja las filas nuevamente después de cancelar un pedido. */
  const renderizarFilas = (): void => {
    cuerpo.replaceChildren();
    pedidos.forEach((pedido) => {
      const articulo = articulos.find((item) => item.id === pedido.articuloId);
      const cliente = clientes.find((item) => item.id === pedido.clienteId);
      const fila = document.createElement("tr");

      fila.append(
        crearCelda(cliente?.nombre ?? "Cliente no disponible"),
        crearCelda(articulo?.nombre ?? "Artículo no disponible"),
        crearCelda(String(pedido.cantidad)),
      );

      // El total y el descuento comparten la misma celda, como en la referencia visual.
      const celdaTotal = crearCelda(moneda.format(pedido.total));
      if (pedido.descuentoAplicado) celdaTotal.append(" ", crearBadgeDescuento());
      fila.append(celdaTotal);

      const celdaEstado = crearCelda();
      celdaEstado.append(crearBadgePedido(pedido.estado));
      fila.append(celdaEstado);

      const celdaAccion = crearCelda();
      if (pedido.estado === "PENDIENTE") {
        const botonCancelar = document.createElement("button");
        botonCancelar.type = "button";
        botonCancelar.className = "boton-cancelar";
        botonCancelar.textContent = "Cancelar";
        botonCancelar.addEventListener("click", async () => {
          error.textContent = "";
          exito.textContent = "";
          botonCancelar.disabled = true;
          try {
            // El servidor verifica la transición y repone el inventario.
            const actualizado = await cancelarPedido(pedido.id);
            pedido.estado = actualizado.estado;
            exito.textContent = `Pedido #${pedido.id} cancelado. ${pedido.cantidad} unidades repuestas al inventario.`;
            renderizarFilas();
          } catch (causa) {
            error.textContent = causa instanceof Error ? causa.message : "No se pudo cancelar el pedido";
            botonCancelar.disabled = false;
          }
        });
        celdaAccion.append(botonCancelar);
      } else if (pedido.estado === "ENTREGADO") {
        const botonCancelado = document.createElement("button");
        botonCancelado.type = "button";
        botonCancelado.className = "boton-cancelar";
        botonCancelado.textContent = "Cancelar";
        botonCancelado.disabled = true;
        celdaAccion.append(botonCancelado);
      } else {
        celdaAccion.className = "nota-reposicion";
        celdaAccion.textContent = `${pedido.cantidad} unidades repuestas al inventario`;
      }
      fila.append(celdaAccion);
      cuerpo.append(fila);
    });
  };

  // Abre el formulario funcional de cliente que usa POST /clientes en modo API.
  botonNuevoCliente.addEventListener("click", () => {
    errorCliente.textContent = "";
    formularioCliente.reset();
    dialogo.showModal();
  });
  botonCerrarCliente.addEventListener("click", () => dialogo.close());

  formularioCliente.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const formulario = new FormData(formularioCliente);
    const datos: NuevoCliente = {
      nombre: String(formulario.get("nombre") ?? "").trim(),
      cedula: String(formulario.get("cedula") ?? "").trim(),
      telefono: String(formulario.get("telefono") ?? "").trim(),
    };
    if (!datos.nombre || !datos.cedula) {
      errorCliente.textContent = "Nombre y cédula son obligatorios";
      return;
    }

    try {
      const cliente = await crearCliente(datos);
      clientes.push(cliente);
      dialogo.close();
      exito.textContent = `Cliente ${cliente.nombre} registrado correctamente.`;
    } catch (causa) {
      errorCliente.textContent = causa instanceof Error ? causa.message : "No se pudo crear el cliente";
    }
  });

  renderizarFilas();
  return seccion;
}
