# 05. El Mapa y la Geo-información

El mapa es el componente central para la interpretación territorial de los siniestros viales.

## Capas Base (Tile Layers)
El sistema permite alternar entre 5 capas diferentes para diversas necesidades de análisis:

| Nombre | Proveedor | URL de Referencia |
| :--- | :--- | :--- |
| **Oscuro (Dark)** | CARTO | `https://{s}.basemaps.cartocdn.com/dark_all/...` |
| **Claro (Light)** | CARTO | `https://{s}.basemaps.cartocdn.com/light_all/...` |
| **Satélite** | ESRI | `https://server.arcgisonline.com/ArcGIS/rest/...` |
| **Calles (OSM)** | OpenStreetMap | `https://{s}.tile.openstreetmap.org/...` |
| **Topográfico** | OpenTopoMap | `https://{s}.tile.opentopomap.org/...` |

## Simbología de Siniestros
Cada marcador utiliza un icono SVG personalizado que representa el tipo de vehículo o accidente:
-   **Choque:** Silueta de dos coches colisionando.
-   **Atropello:** Peatón inclinado con línea de impacto (distintivo claro).
-   **Animal:** Silueta de cuadrúpedo (vaca/perro) de perfil.
-   **Moto/Caída Moto:** Silueta de motocicleta.
-   **Volcamiento:** Vehículo invertido.

## Códigos de Color por Gravedad
Los colores de los marcadores y popups indican la severidad del evento:
-   🟥 **Fatal** (`#991b1b`): Siniestros con personas fallecidas.
-   🟧 **Grave** (`#e63946`): Siniestros con heridos de gravedad.
-   🟨 **Leve** (`#f59e0b`): Siniestros con heridos leves.
-   🟦 **Solo Daños** (`#3b82f6`): Siniestros sin lesionados.

## Badge de Víctimas Múltiples
Para accidentes con alto impacto, el sistema añade un círculo rojo (`#ef4444`) en la esquina superior derecha del icono con el número total de víctimas. Este badge solo se activa si `víctimas > 1`.

## Fondo del Contenedor Leaflet
Para evitar parpadeos blancos durante la carga de tiles, el fondo del contenedor se adapta al tema:
-   **Modo Oscuro:** `#0d1117`
-   **Modo Claro:** `#e8e0d0`

---
*[Regresar al Índice](file:///d:/Documents/proyectos/SIGOcana-frontend/docs/README.md)*
