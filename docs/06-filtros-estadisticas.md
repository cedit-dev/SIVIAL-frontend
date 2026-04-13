# 06. Gestión de Filtros y Estadísticas

El análisis de datos en SinVial Ocaña se divide en dos paneles complementarios: el de segmentación (Filtros) y el de resultados (Estadísticas).

## Panel de Filtros (Lateral)
-   **Ubicación:** Lateral izquierdo, colapsable.
-   **Interacción:** Al abrirse, el botón de activación se oculta para limpiar la interfaz.
-   **Criterios de Filtrado:**
    -   Rango de Fechas (Inicio / Fin).
    -   Nivel de Gravedad (Checkbox multi-selección).
    -   Tipo de Siniestro (Dropdown).
    -   Vehículo Involucrado.
    -   Clima (Luvioso, Seco, Nublado).
-   **Botón de Limpiar:** Restablece todos los filtros con un clic.

## Panel de Estadísticas (Overlay Inferior)
-   **Ubicación:** Overlay fijo en la parte inferior de la pantalla.
-   **Estructura:**
    1.  **Header:** Título "Análisis de Siniestralidad" con botón de cierre integrado.
    2.  **KPIs (Tarjetas Superiores):** Resumen numérico de siniestros, víctimas, fallecidos, tipo frecuente y zona peligrosa.
    3.  **Gráficas Dinámicas:**
        -   *Siniestros por Tipo:* Gráfica de barras horizontales.
        -   *Distribución por Gravedad:* Gráfica de dona (Donut Chart).
    4.  **Tabla de Datos:** Listado detallado y paginado de los siniestros filtrados.

## Comportamiento del Overlay
El panel tiene una altura máxima de `75vh` y cuenta con scroll interno independiente. Al activarse, se desplaza suavemente desde el borde inferior mediante una transformación `translateY(0)`.

## Calidad de Datos y Ortografía
Se han aplicado correcciones en todas las etiquetas de la interfaz para garantizar la profesionalidad del sistema:
-   Actualización de "solo danos" a "**Solo daños**".
-   Estandarización de mayúsculas en encabezados de tablas.
-   Acentos correctos en etiquetas de KPIs (Siniestros, Víctimas, Vía).

---
*[Regresar al Índice](file:///d:/Documents/proyectos/SIGOcana-frontend/docs/README.md)*
