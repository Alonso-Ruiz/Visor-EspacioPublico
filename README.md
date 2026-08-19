# Visor de Espacios Públicos

Aplicación web estática para consultar el Reglamento de Espacios Públicos de San Borja.

## Estructura

- `index.html`: estructura semántica de la interfaz.
- `assets/css/app.css`: estilos visuales y adaptación responsive.
- `assets/js/app.js`: interacción, mapa, búsqueda y ficha técnica.
- `layers/`: datos geográficos y datos complementarios utilizados por el visor.
- `styles/`: estilos cartográficos y leyendas exportados por QGIS. Se conserva para incorporar futuras entregas de capas.
- `images/`: imágenes de identidad visual.
- `pdf/`: diseños de franjas viales servidos localmente. Los archivos se identifican por el código de la vía, por ejemplo `VLP-AV-01.pdf`.
- `anexos/`: publicación oficial y anexos generales mostrados desde el cuadro informativo del visor.

`assets/css` controla la interfaz del visor, mientras que `styles` pertenece a las capas geográficas. No deben mezclarse ni eliminarse los estilos cartográficos al actualizar una entrega de QGIS.

## Ejecución local

Sirve la carpeta con un servidor HTTP estático. Por ejemplo:

```powershell
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

El proyecto no requiere compilación ni instalación de dependencias.

## Capas integradas

- Red vial local y metropolitana.
- Parques y plazas con parámetros normativos.
- Espacios públicos integrados de Limatambo y Torres de San Borja.
- Servidumbres de paso.
- Manzanas urbanas y manzanas de Limatambo.
- Secciones viales como fuente auxiliar de atributos y documentos PDF.

## Street View

El botón Pegman está agrupado en la esquina inferior izquierda junto con los controles de norte e información. Permite:

- Activar Street View y seleccionar un punto del mapa.
- Arrastrar el icono hasta una ubicación para definir también la orientación inicial.
- Cancelar el modo de selección con la tecla `Escape`.

La vista se abre en Google Maps usando las coordenadas seleccionadas; no requiere una clave de API.

El botón de información muestra temporalmente la cabecera del visor. La cabecera también aparece al cerrar la portada inicial y se oculta suavemente después de unos segundos.

Dentro de la cabecera, el botón **Ver anexos** despliega la relación de documentos disponibles. Mientras la lista está abierta, la cabecera permanece visible.
