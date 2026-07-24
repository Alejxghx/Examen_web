import type { Articulo, Cliente, NuevoPedido, Pedido } from "../dominio";

/** Función de la capa de datos que registra el pedido validado por la pantalla. */
type RegistrarPedido = (datos: NuevoPedido) => Promise<Pedido>;

const moneda = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

/** Crea una opción de select sin interpolar datos externos como HTML. */
function crearOpcion(valor: number, texto: string): HTMLOptionElement {
  const opcion = document.createElement("option");
  opcion.value = String(valor);
  opcion.textContent = texto;
  return opcion;
}

/**
 * Construye la Pantalla 02. La pantalla valida y calcula en vivo, mientras que
 * la fuente vuelve a validar al registrar para conservar las reglas de negocio.
 */
export function crearPantallaCrearPedido(
  articulos: Articulo[],
  clientes: Cliente[],
  registrarPedido: RegistrarPedido,
): HTMLElement {
  // R1 en la interfaz: los artículos inactivos no se muestran como seleccionables.
  const articulosActivos = articulos.filter((articulo) => articulo.activo);
  const seccion = document.createElement("section");
  seccion.className = "nuevo-pedido";
  seccion.innerHTML = `
    <h2>Nuevo pedido</h2>
    <form novalidate>
      <label for="articulo">Artículo <b aria-label="campo obligatorio">*</b></label>
      <select id="articulo" name="articulo" required></select>
      <p class="ayuda" data-disponibilidad></p>

      <label for="cliente">Cliente <b aria-label="campo obligatorio">*</b></label>
      <div class="fila-cliente">
        <select id="cliente" name="cliente" required></select>
        <button type="button" class="boton-secundario" data-nuevo-cliente>+ Nuevo cliente</button>
      </div>

      <label for="cantidad">Cantidad <b aria-label="campo obligatorio">*</b></label>
      <input id="cantidad" name="cantidad" type="number" min="1" step="1" value="3" required />
      <p class="mensaje-error" role="alert" data-error></p>

      <div class="resumen-total" aria-live="polite">
        <strong data-total>Total: $0.00</strong>
        <span data-descuento>Desde 5 unidades: 10% de descuento</span>
      </div>
      <p class="mensaje-exito" role="status" data-exito></p>
      <button type="submit" class="boton-principal" data-registrar>Registrar pedido</button>
    </form>`;

  const formulario = seccion.querySelector("form");
  const selectorArticulo = seccion.querySelector<HTMLSelectElement>("#articulo");
  const selectorCliente = seccion.querySelector<HTMLSelectElement>("#cliente");
  const entradaCantidad = seccion.querySelector<HTMLInputElement>("#cantidad");
  const disponibilidad = seccion.querySelector<HTMLElement>("[data-disponibilidad]");
  const total = seccion.querySelector<HTMLElement>("[data-total]");
  const descuento = seccion.querySelector<HTMLElement>("[data-descuento]");
  const error = seccion.querySelector<HTMLElement>("[data-error]");
  const exito = seccion.querySelector<HTMLElement>("[data-exito]");
  const botonRegistrar = seccion.querySelector<HTMLButtonElement>("[data-registrar]");
  const botonNuevoCliente = seccion.querySelector<HTMLButtonElement>("[data-nuevo-cliente]");

  if (!formulario || !selectorArticulo || !selectorCliente || !entradaCantidad || !disponibilidad || !total || !descuento || !error || !exito || !botonRegistrar || !botonNuevoCliente) {
    throw new Error("No se pudo crear el formulario de pedido");
  }

  // Los selectores se alimentan con datos recibidos; la pantalla no accede a la fuente.
  articulosActivos.forEach((articulo) => {
    selectorArticulo.append(crearOpcion(articulo.id, `${articulo.nombre} — ${moneda.format(articulo.precioUnitario)}`));
  });
  clientes.forEach((cliente) => {
    selectorCliente.append(crearOpcion(cliente.id, `${cliente.nombre} — ${cliente.cedula}`));
  });

  /** Obtiene el artículo elegido en el formulario actual. */
  const articuloSeleccionado = (): Articulo | undefined =>
    articulosActivos.find((articulo) => articulo.id === Number(selectorArticulo.value));

  /** Refresca disponibilidad, descuento, total y el estado del botón al escribir. */
  const actualizarResumen = (): boolean => {
    const articulo = articuloSeleccionado();
    const cantidad = entradaCantidad.valueAsNumber;
    const cantidadValida = Boolean(
      articulo
      && Number.isInteger(cantidad)
      && cantidad >= 1
      && cantidad <= articulo.disponibles,
    );

    disponibilidad.textContent = articulo ? `Quedan ${articulo.disponibles} disponibles` : "No hay artículos disponibles";
    if (!articulo) {
      total.textContent = "Total: $0.00";
      error.textContent = "No hay artículos activos para registrar";
    } else if (!Number.isInteger(cantidad) || cantidad < 1) {
      total.textContent = "Total: $0.00";
      error.textContent = "Ingresa una cantidad entera desde 1";
    } else if (cantidad > articulo.disponibles) {
      total.textContent = `Total: ${moneda.format(cantidad * articulo.precioUnitario)}`;
      error.textContent = `Solo quedan ${articulo.disponibles} disponibles`;
    } else {
      const aplicaDescuento = cantidad >= 5;
      const importe = cantidad * articulo.precioUnitario * (aplicaDescuento ? 0.9 : 1);
      total.textContent = `Total: ${moneda.format(importe)}`;
      descuento.textContent = aplicaDescuento
        ? "Descuento aplicado: 10% desde 5 unidades"
        : "Desde 5 unidades: 10% de descuento";
      error.textContent = "";
    }

    botonRegistrar.disabled = !cantidadValida || clientes.length === 0;
    return cantidadValida;
  };

  // El cambio de artículo o cantidad recalcula el pedido sin esperar el envío.
  selectorArticulo.addEventListener("change", () => {
    exito.textContent = "";
    actualizarResumen();
  });
  entradaCantidad.addEventListener("input", () => {
    exito.textContent = "";
    actualizarResumen();
  });

  // CP3 completará el formulario de clientes; aquí se conserva el control visible de la pantalla.
  botonNuevoCliente.addEventListener("click", () => {
    exito.textContent = "La creación de clientes se habilitará en CP3.";
  });

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!actualizarResumen()) return;

    const articulo = articuloSeleccionado();
    if (!articulo) return;

    try {
      // La fuente aplica nuevamente las reglas antes de mutar su estado JSON en memoria.
      const pedido = await registrarPedido({
        articuloId: articulo.id,
        clienteId: Number(selectorCliente.value),
        cantidad: entradaCantidad.valueAsNumber,
      });
      // Se actualiza la copia local para reflejar de inmediato la disponibilidad restante.
      articulo.disponibles -= pedido.cantidad;
      entradaCantidad.value = "1";
      exito.textContent = `Pedido #${pedido.id} registrado correctamente.`;
      actualizarResumen();
    } catch (causa) {
      error.textContent = causa instanceof Error ? causa.message : "No se pudo registrar el pedido";
    }
  });

  // Muestra los valores iniciales de la referencia antes de que el usuario interactúe.
  actualizarResumen();
  return seccion;
}
