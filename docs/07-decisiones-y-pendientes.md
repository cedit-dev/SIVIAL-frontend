# 07. Decisiones y Próximos Pasos

Este documento registra el razonamiento detrás de ciertas elecciones de diseño y establece la hoja de ruta para futuras versiones.

## Registro de Decisiones de Diseño

### 1. Overlay Inferior en lugar de Panel Lateral (Estadísticas)
Se decidió usar un "bottom overlay" para las estadísticas en lugar de una barra lateral para dar más espacio horizontal a las gráficas y la tabla de datos, permitiendo una comparación visual más cómoda sin sacrificar excesivo espacio del mapa.

### 2. Estilo "Pill" (Píldora) para Botones de Acción
El uso de botones plenamente redondeados (`999px`) se eligió para diferenciar claramente las acciones globales del sistema (Estadísticas, Login, Filtros) de los elementos rectangulares o redondeados simples del mapa, mejorando la jerarquía visual.

### 3. Draggable Legend (Permisividad)
La guía del mapa solo permite el arrastre (`drag`) cuando está abierta o desde áreas que no sean botones. Esto evita clics accidentales mientras se intenta mover o cerrar el widget.

### 4. Color Beige en Modo Claro
Se seleccionó una paleta de beiges cálidos (`#eae6df` / `#f4f1ec`) en lugar de un blanco puro clínico para dar una sensación de "mapa de papel" o "cartografía premium", reduciendo el deslumbramiento en pantallas brillantes.

## Lista de Pendientes (Futuras Mejoras)

### Funcionalidades
-   [ ] **Filtro por hora del día:** Permitir segmentar siniestros por franjas horarias (mañana, tarde, noche, madrugada).
-   [ ] **Vista de Detalle Extendida:** Una página o modal dedicado por siniestro con fotos, testimonios o croquis detallados.
-   [ ] **Comparador de Períodos:** Función para comparar estadísticas entre dos años o semestres diferentes para medir el impacto de las medidas de seguridad.

### Técnico
-   [ ] **Exportación condicionada:** Modificar los generadores de CSV/PDF para que solo incluyan los datos que han pasado por los filtros activos.
-   [ ] **Integración de API Real:** Migrar de los datos estáticos en `data/index.ts` a una API REST conectada a una base de datos PostgreSQL/PostGIS.

---
*[Regresar al Índice](file:///d:/Documents/proyectos/SIGOcana-frontend/docs/README.md)*
