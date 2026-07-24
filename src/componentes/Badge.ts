/** Crea la etiqueta visual reutilizable para el estado de un artículo. */
export function crearBadge(activo: boolean): HTMLElement {
  // Se genera el elemento, en vez de usar texto HTML, para poder reutilizarlo en tablas.
  const badge = document.createElement("span");
  // La clase determina los colores del estado y el texto expresa su significado.
  badge.className = `badge badge--${activo ? "activo" : "inactivo"}`;
  badge.textContent = activo ? "Activo" : "Inactivo";
  return badge;
}
