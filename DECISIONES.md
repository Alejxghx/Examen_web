# Decisiones CP1

1. Se usa Vite con TypeScript y una interfaz web sin framework adicional.
2. El dominio contiene los tipos derivados de las pantallas y no depende de otras capas.
3. Las pantallas consumen `obtenerFuenteDatos()`; no importan semillas ni conocen la fuente activa.
4. CP1 utiliza `memoria`; JSON y API existen como contratos pendientes para sus checkpoints.
5. La pantalla inicial muestra todos los artículos, incluidos los inactivos, como indica el contrato.
6. Los archivos y directorios bloqueados se conservaron intactos; las copias en `src/datos` coinciden con la base.
