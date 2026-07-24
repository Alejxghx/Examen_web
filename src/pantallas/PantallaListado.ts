// La pantalla conoce el tipo de dominio, pero no sabe de qué fuente provienen los datos.
import type { Articulo } from "../dominio";
import { crearBadge } from "../componentes/Badge";

// Formateador único para mostrar todos los precios con dos decimales en dólares.
const moneda = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

/** Construye la Pantalla 01 a partir de los artículos recibidos por la capa de datos. */
export function crearPantallaListado(articulos: Articulo[]): HTMLElement {
  // Se crea el esqueleto de la tabla; sus filas se agregan de forma segura después.
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

  // El cuerpo de la tabla debe existir porque ahí se renderiza cada artículo.
  const cuerpo = seccion.querySelector("tbody");
  if (!cuerpo) throw new Error("No se pudo crear la tabla de artículos");

  // Cada registro del dominio se transforma en una fila visible del catálogo.
  articulos.forEach((articulo) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${articulo.nombre}</td>
      <td>${moneda.format(articulo.precioUnitario)}</td>
      <td>${articulo.disponibles}</td>
      <td></td>`;
    // La última celda queda reservada para el componente reutilizable de estado.
    fila.lastElementChild?.append(crearBadge(articulo.activo));
    cuerpo.append(fila);
  });

  // La función entrega la pantalla lista para insertarse en el contenedor principal.
  return seccion;
}
