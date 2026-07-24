// El punto de entrada solo conoce la fábrica: nunca importa una fuente concreta.
import { FUENTE_ACTIVA, obtenerFuenteDatos } from "./datos";
import { crearPantallaCrearPedido } from "./pantallas/PantallaCrearPedido";
import "./styles.css";

/** Prepara la estructura común y carga la Pantalla 02 al iniciar la aplicación. */
async function iniciarAplicacion(): Promise<void> {
  // Localiza el único nodo que Vite entrega para montar la aplicación.
  const raiz = document.querySelector<HTMLDivElement>("#app");
  if (!raiz) throw new Error("No existe el contenedor principal");

  // La cabecera muestra siempre qué fuente de datos está seleccionada.
  raiz.innerHTML = `
    <main class="aplicacion">
      <header class="cabecera">
        <h1>Papelería El Lápiz</h1>
        <span>Sistema de pedidos · fuente: ${FUENTE_ACTIVA}</span>
      </header>
      <div class="contenido"></div>
    </main>`;

  // Este contenedor será reemplazado o reutilizado por las siguientes pantallas.
  const contenido = raiz.querySelector<HTMLDivElement>(".contenido");
  if (!contenido) throw new Error("No existe el contenedor de contenido");

  try {
    // La fábrica devuelve memoria, JSON o API sin cambiar el código de la interfaz.
    const fuente = obtenerFuenteDatos();
    const [articulos, clientes] = await Promise.all([
      fuente.listarArticulos(),
      fuente.listarClientes(),
    ]);
    contenido.append(crearPantallaCrearPedido(articulos, clientes, fuente.crearPedido));
  } catch (error) {
    // Si la fuente falla, el usuario recibe una explicación en lugar de una pantalla vacía.
    contenido.innerHTML = `<p class="error">No se pudo cargar el catálogo: ${String(error)}</p>`;
  }
}

// Se invoca sin esperar su promesa porque el navegador continúa cargando la interfaz.
void iniciarAplicacion();
