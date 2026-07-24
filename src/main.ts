import { FUENTE_ACTIVA, obtenerFuenteDatos } from "./datos";
import { crearPantallaListado } from "./pantallas/PantallaListado";
import "./styles.css";

async function iniciarAplicacion(): Promise<void> {
  const raiz = document.querySelector<HTMLDivElement>("#app");
  if (!raiz) throw new Error("No existe el contenedor principal");

  raiz.innerHTML = `
    <main class="aplicacion">
      <header class="cabecera">
        <h1>Papelería El Lápiz</h1>
        <span>Sistema de pedidos · fuente: ${FUENTE_ACTIVA}</span>
      </header>
      <div class="contenido"></div>
    </main>`;

  const contenido = raiz.querySelector<HTMLDivElement>(".contenido");
  if (!contenido) throw new Error("No existe el contenedor de contenido");

  try {
    const articulos = await obtenerFuenteDatos().listarArticulos();
    contenido.append(crearPantallaListado(articulos));
  } catch (error) {
    contenido.innerHTML = `<p class="error">No se pudo cargar el catálogo: ${String(error)}</p>`;
  }
}

void iniciarAplicacion();
