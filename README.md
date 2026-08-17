# Visor de Espacios Públicos

Aplicación web estática para consultar el Reglamento de Espacios Públicos de San Borja.

## Estructura

- `index.html`: estructura semántica de la interfaz.
- `assets/css/app.css`: estilos visuales y adaptación responsive.
- `assets/js/app.js`: interacción, mapa, búsqueda y ficha técnica.
- `layers/`: datos geográficos y datos complementarios utilizados por el visor.
- `styles/`: estilos cartográficos y leyendas exportados por QGIS. Se conserva para incorporar futuras entregas de capas.
- `images/`: imágenes de identidad visual.

`assets/css` controla la interfaz del visor, mientras que `styles` pertenece a las capas geográficas. No deben mezclarse ni eliminarse los estilos cartográficos al actualizar una entrega de QGIS.

## Ejecución local

Sirve la carpeta con un servidor HTTP estático. Por ejemplo:

```powershell
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

El proyecto no requiere compilación ni instalación de dependencias.

## Street View

El botón Pegman de la esquina inferior derecha permite:

- Activar Street View y seleccionar un punto del mapa.
- Arrastrar el icono hasta una ubicación para definir también la orientación inicial.
- Cancelar el modo de selección con la tecla `Escape`.

La vista se abre en Google Maps usando las coordenadas seleccionadas; no requiere una clave de API.
