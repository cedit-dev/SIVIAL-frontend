# 04. Identidad Visual y UI/UX

Este documento detalla los principios de diseño y componentes visuales que garantizan la consistencia estética del sistema.

## Paletas de Colores

### Modo Oscuro (Predeterminado)
Enfocado en la reducción de fatiga visual para uso prolongado en centros de monitoreo.
-   **Fondo Principal:** `#0f172a` (Background)
-   **Tarjetas/Paneles:** `#1e293b` (Card)
-   **Acento Primario:** `#e63946` (Rojo Institucional)
-   **Bordes:** `rgba(255, 255, 255, 0.1)`

### Modo Claro (Beige Premium)
Enfocado en reportes ejecutivos y legibilidad en exteriores.
-   **Fondo Mapa/Paneles:** `#eae6df` (Warm Beige)
-   **Tarjetas KPI:** `#ffffff` (Blanco puro)
-   **Texto Principal:** `#1a1a2e` (Deep Navy)
-   **Bordes:** `1px solid rgba(0,0,0,0.08)`

## Tipografía
Se utiliza la familia de fuentes **Inter** para una legibilidad óptima en interfaces de datos, con **JetBrains Mono** para visualización de coordenadas o datos crudos.

## Sistema de Capas (Z-Index)
Para garantizar que los overlays no se bloqueen entre sí, se ha definido la siguiente jerarquía:

| Capa | Z-Index | Componente |
| :--- | :--- | :--- |
| **Mapa** | `0` | Leaflet Container |
| **Controles Flotantes** | `1000` | Zoom, Puntos/Calor, Re-centrar |
| **Filtros** | `1500` | Panel Lateral de Filtros |
| **Leyenda** | `1800` | Guía del Mapa (Draggable) |
| **Estadísticas** | `2000` | Panel Analítico Inferior |

## Transiciones y Micro-interacciones
-   **Panel Estadístico:** `0.35s cubic-bezier(0.4, 0, 0.2, 1)` (Desplazamiento desde abajo).
-   **Panel de Filtros:** `0.25s ease-out` (Desplazamiento lateral).
-   **Cambio de Tema:** `0.4s ease` (Fundido suave de colores).
-   **Botones:** `active:scale-95` para feedback táctil.

## Estilo de Botones
El sistema utiliza un diseño basado en "píldoras" y botones redondeados:
-   **Radio de Borde:** `999px` para botones de acción principal (Estadísticas, Login).
-   **Iconos:** Siempre acompañados de tooltips o etiquetas claras.

---
*[Regresar al Índice](file:///d:/Documents/proyectos/SIGOcana-frontend/docs/README.md)*
