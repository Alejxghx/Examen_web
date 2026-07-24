import type { EstadoPedido } from "../dominio";

/** Muestra el estado de un pedido con el color correspondiente a su ciclo de vida. */
export function crearBadgePedido(estado: EstadoPedido): HTMLElement {
  const badge = document.createElement("span");
  badge.className = `badge-pedido badge-pedido--${estado.toLowerCase()}`;
  badge.textContent = estado;
  return badge;
}

/** Etiqueta reutilizable que informa el descuento aplicado a un pedido. */
export function crearBadgeDescuento(): HTMLElement {
  const badge = document.createElement("span");
  badge.className = "badge-descuento";
  badge.textContent = "−10%";
  return badge;
}
