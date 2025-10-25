# Tutorial Práctico: Aplicación Web con OpenLayers

## Tabla de Contenidos

1. [Introducción a OpenLayers](#introducción-a-openlayers)
2. [Configuración del Proyecto](#configuración-del-proyecto)
3. [Mapa Básico](#mapa-básico)
4. [Capas y Fuentes de Datos](#capas-y-fuentes-de-datos)
5. [Controles e Interacciones](#controles-e-interacciones)
6. [Eventos y Popups](#eventos-y-popups)
7. [Trabajar con Datos GeoJSON](#trabajar-con-datos-geojson)
8. [Proyecciones y Transformaciones](#proyecciones-y-transformaciones)
9. [Servicios OGC](#servicios-ogc)
10. [Aplicación Completa](#aplicación-completa)

---

## Introducción a OpenLayers

**OpenLayers** es una librería JavaScript de código abierto para crear mapas web interactivos. Es potente, flexible y soporta múltiples fuentes de datos y proyecciones.

### Características Principales

- Soporte para múltiples proyecciones
- Capas vectoriales y ráster
- Servicios OGC (WMS, WFS, WMTS)
- Vector tiles
- Interacciones avanzadas (dibujo, edición, snap)
- Renderizado WebGL para alto rendimiento

### Cuándo usar OpenLayers

- Aplicaciones que requieren múltiples proyecciones
- Consumo de servicios OGC estándar
- Aplicaciones empresariales complejas
- Necesidad de control total sobre el mapa

---

## Configuración del Proyecto

### Opción 1: CDN (Rápido para empezar)

Crea un archivo `index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Aplicación OpenLayers</title>
    
    <!-- OpenLayers CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v8.2.0/ol.css">
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        
        #map {
            width: 100%;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <!-- OpenLayers JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/ol@v8.2.0/dist/ol.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### Opción 2: npm (Proyecto con Node)

```bash
# Crear directorio del proyecto
mkdir mi-app-openlayers
cd mi-app-openlayers

# Inicializar npm
npm init -y

# Instalar OpenLayers
npm install ol

# Instalar Vite para desarrollo
npm install --save-dev vite
```

**package.json** (agregar scripts):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Estructura del proyecto:**

```
mi-app-openlayers/
├── index.html
├── main.js
├── style.css
├── package.json
└── node_modules/
```

---

## Mapa Básico

### Con CDN

Crea `app.js`:

```javascript
// Crear el mapa
const map = new ol.Map({
    target: 'map', // ID del div contenedor
    layers: [
        // Capa base de OpenStreetMap
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-74.0060, 4.7110]), // Bogotá
        zoom: 12
    })
});

console.log('Mapa cargado correctamente!');
```

### Con npm/Vite

**index.html:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Aplicación OpenLayers</title>
</head>
<body>
    <div id="map"></div>
    <script type="module" src="/main.js"></script>
</body>
</html>
```

**style.css:**

```css
@import "node_modules/ol/ol.css";

body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}

#map {
    width: 100%;
    height: 100vh;
}
```

**main.js:**

```javascript
import './style.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import { fromLonLat } from 'ol/proj.js';

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: fromLonLat([-74.0060, 4.7110]),
        zoom: 12
    })
});
```

**Ejecutar:**

```bash
npm run dev
```