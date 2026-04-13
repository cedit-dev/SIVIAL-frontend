# 02. Arquitectura y Tecnologías

## Stack Tecnológico
El proyecto se ha construido sobre un entorno moderno de desarrollo web para garantizar velocidad y escalabilidad:

-   **Entorno de ejecución:** Node.js
-   **Toolkit de construcción:** Vite
-   **Framework Principal:** React (con TypeScript para tipado estático)
-   **Librería de Mapas:** Leaflet.js
-   **Visualización de Datos:** Recharts
-   **Iconografía:** Lucide React + SVGs personalizados
-   **Estilos:** Tailwind CSS (Vanilla CSS para configuraciones de tema profundo)
-   **Gestión de Estado:** Zustand (en `useSiniestrosStore.ts`)

## Estructura de Carpetas
```text
/src
  /assets        # Recursos estáticos (Logos de Alcaldía, SinVial)
  /components
    /sinvial     # Componentes core del sistema (MapComponent, EstadisticasPanel, etc)
    /ui          # Componentes base de la interfaz (Botones, inputs)
  /data          # Datos crudos de siniestros (index.ts)
  /pages         # Vistas principales (Landing, Login, Dashboard/Index)
  /store         # Gestión de estado global
  /types         # Definiciones de interfaces TypeScript
  /utils         # Formateadores y cálculos estadísticos
index.css        # Definición global de temas (Light/Dark mode)
```

## Decisiones Técnicas Relevantes
1.  **Leaflet sobre Mapbox/Google Maps:** Se seleccionó Leaflet por su ligereza y facilidad para integrar Tile Layers gratuitos de CARTO y ESRI sin necesidad de API Keys costosas en la etapa actual.
2.  **Tematización mediante Variables CSS:** Se utilizan variables HSL en el `:root` y clases `.light-theme` para permitir transiciones suaves en todos los componentes del sistema.
3.  **Persistencia en LocalStorage:** El sistema recuerda las preferencias del usuario para evitar configuraciones redundantes en cada carga:
    -   `sinvial_theme`: Modo oscuro o claro.
    -   `sinvial_maplayer`: Capa base seleccionada (Satelital, Oscura, etc).
    -   `sinvial_legend_pos`: Posición personalizada de la guía arrastrable.

---
*[Regresar al Índice](file:///d:/Documents/proyectos/SIGOcana-frontend/docs/README.md)*
