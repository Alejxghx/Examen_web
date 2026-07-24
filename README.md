# Examen Práctico Final — IS-403 · Temática 09: PAPELERIA

Este paquete es su punto de partida. Las reglas y la rúbrica están en el
documento del examen; aquí está solo lo operativo.

## 1. Qué hay en este paquete

| Carpeta | Contenido |
|---|---|
| `pantallas/` | Las 3 imágenes de la aplicación terminada — su **única especificación** |
| `mock/` | El servidor de datos local (`servidor-mock.js`) y las semillas (`semillas.json`) |
| `base/datos/` | `contrato.ts` e `index.ts` **BLOQUEADOS** + `configuracion.ts` (editable) |

## 2. Antes de escribir código

Observe las 3 pantallas con detenimiento. Las entidades, los campos, los
textos y las 5 reglas de negocio están ahí. Nadie se los va a dictar.

## 3. Primeros 10 minutos

1. Cree su proyecto con el framework de su elección, por ejemplo:
   - `npm create vite@latest mi-examen -- --template svelte-ts` (o `react-ts`, `vue-ts`, `vanilla-ts`)
   - `ng new mi-examen` (Angular)
2. Copie la carpeta `base/datos/` completa a `src/datos/` de su proyecto.
3. Copie `mock/semillas.json` a `public/semillas.json` (lo usará el modo `json`).
4. Cree el archivo `.env` en la raíz con: `VITE_FUENTE_DATOS=memoria`
   *(en Angular: en `src/datos/configuracion.ts` use la variante `leerFuente()` con `environment` y defina `fuenteDatos` en `src/environments/environment.ts`).*
5. Cree los archivos de los pasos 4 y 5 de abajo — **sin ellos la fábrica no compila**.

## 4. El dominio (usted lo completa en CP1)

Cree `src/dominio/index.ts`. El contrato bloqueado importa estos cinco
nombres; **los campos de cada uno los deriva usted de las pantallas**:

```ts
export interface Articulo {
  // TODO: derive los campos de pantallas/01-listado.png
}
export interface Cliente {
  // TODO: derive los campos de pantallas/02-crear.png
}
export type NuevoCliente = unknown; // TODO: qué se necesita para crear un cliente
export interface Pedido {
  // TODO: derive los campos de pantallas/03-detalle.png
}
export type NuevoPedido = unknown; // TODO: qué se necesita para crear la transacción
```

## 5. Las tres fuentes de datos (usted las implementa)

Cree estos tres archivos en `src/datos/` — la fábrica los importa por su
nombre exacto. Esqueleto inicial listo para pegar (los tres deben **existir
desde CP1**, aunque dos sigan sin implementar):

```ts
// datos.memoria.ts  (cambie "fuenteMemoria" por fuenteJson / fuenteApi en los otros)
import type { FuenteDatos } from "./contrato";
const pendiente = () => Promise.reject(new Error("no implementado"));
export const fuenteMemoria: FuenteDatos = {
  listarArticulos: pendiente,
  listarClientes: pendiente,
  crearCliente: pendiente,
  listarPedidos: pendiente,
  crearPedido: pendiente,
  cancelarPedido: pendiente,
};
```

| Archivo | Fuente | Qué hace |
|---|---|---|
| `datos.memoria.ts` | `memoria` | Las semillas importadas en el código; mutaciones en arreglos de JS |
| `datos.json.ts` | `json` | Carga `/semillas.json` con `fetch` al iniciar; luego opera en memoria |
| `datos.api.ts` | `api` | Todas las operaciones vía REST contra el mock |

El resto de su aplicación consume **únicamente** `obtenerFuenteDatos()` de
`src/datos/index.ts`. Ningún componente ni pantalla sabe qué fuente hay detrás.

## 6. El servidor mock (modo `api`)

```bash
node mock/servidor-mock.cjs mock/semillas.json
```

Corre en `http://localhost:3000` y expone: `GET /articulos`, `GET|POST /clientes`,
`GET|POST /pedidos`, `PATCH /pedidos/:id`. Visite `http://localhost:3000/`
para ver el índice. **Reiniciarlo restaura las semillas** — úselo para volver
al estado inicial antes de presentar un checkpoint.

## 7. Estructura exigida (se firma en CP1)

```
src/
  dominio/       → interfaces y tipos (el lenguaje de la app)
  datos/         → contrato, fábrica, configuración + sus tres fuentes
  componentes/   → piezas reutilizables (Badge, Tabla, ...)
  pantallas/     → las 3 vistas del examen
```

Tres reglas de oro: las pantallas no definen tipos ni acceden a datos
directamente; los componentes no saben de dónde vienen los datos; el dominio
no importa nada de nadie. *(En Angular se evalúa la separación equivalente.)*

## 8. Recordatorios de una línea

- La cabecera de su aplicación debe mostrar la **fuente activa** (memoria / json / api).
- Los archivos bloqueados no se tocan: se comparan contra el original al firmar.
- Commit por checkpoint; commit final `"Examen C4 - Auditoría"` con push hasta 1 hora después del cierre.
