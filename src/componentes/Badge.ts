export function crearBadge(activo: boolean): HTMLElement {
  const badge = document.createElement("span");
  badge.className = `badge badge--${activo ? "activo" : "inactivo"}`;
  badge.textContent = activo ? "Activo" : "Inactivo";
  return badge;
}
