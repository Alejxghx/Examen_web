import type { Articulo } from "../dominio";
import { crearBadge } from "../componentes/Badge";

const moneda = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function crearPantallaListado(articulos: Articulo[]): HTMLElement {
  const seccion = document.createElement("section");
  seccion.className = "catalogo";
  seccion.innerHTML = `
    <h2>Catálogo de artículos</h2>
    <div class="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>Artículo</th>
            <th>Precio</th>
            <th>Disponibles</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>`;

  const cuerpo = seccion.querySelector("tbody");
  if (!cuerpo) throw new Error("No se pudo crear la tabla de artículos");

  articulos.forEach((articulo) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${articulo.nombre}</td>
      <td>${moneda.format(articulo.precioUnitario)}</td>
      <td>${articulo.disponibles}</td>
      <td></td>`;
    fila.lastElementChild?.append(crearBadge(articulo.activo));
    cuerpo.append(fila);
  });

  return seccion;
}
