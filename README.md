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
