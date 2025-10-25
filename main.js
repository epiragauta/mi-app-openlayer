import './style.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM.js';
import TileWMS from 'ol/source/TileWMS.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { fromLonLat } from 'ol/proj.js';
import { Fill, Stroke, Style, Text, Circle as CircleStyle } from 'ol/style.js';
import { register } from 'ol/proj/proj4.js';
import proj4 from 'proj4';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';

// Registrar la proyección EPSG:4686 (MAGNA-SIRGAS)
proj4.defs('EPSG:4686', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs');
register(proj4);

// Capa vectorial con los departamentos
const dptosSource = new VectorSource({
    url: './data/dptos.geojson',
    format: new GeoJSON({
        dataProjection: 'EPSG:4686',
        featureProjection: 'EPSG:3857'
    })
});

const dptosLayer = new VectorLayer({
    source: dptosSource,
    style: function(feature) {
        const nombre = feature.get('dpto_cnmbr');
        //console.log('Nombre departamento:', nombre);
        return new Style({
            stroke: new Stroke({
                color: '#837b7bff',
                width: 1
            }),
            fill: new Fill({
                color: 'rgba(169, 211, 130, 0.2)'
            }),
            text: new Text({
                text: nombre || '',
                font: 'bold 12px Arial',
                fill: new Fill({
                    color: '#807d7dff'
                }),
                stroke: new Stroke({
                    color: '#ebe7e7ff',
                    width: 2
                }),
                overflow: true,
                offsetY: 0
            })
        });
    }
});

// Capas WMS de DANE
const wmsUrl = 'https://portalgis.dane.gov.co/mparcgis/services/NIVEL_DE_REFERENCIA_DE_VEREDAS/Serv_CapasNivelReferenciaVeredas_2024/MapServer/WMSServer';

// Capa de Departamentos desde WMS (Capa 3)
const departamentosWMSLayer = new TileLayer({
    source: new TileWMS({
        url: wmsUrl,
        params: {
            'LAYERS': '3',
            'TILED': true,
            'VERSION': '1.3.0'
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
    }),
    visible: true,
    opacity: 0.7
});

// Capa de Municipios desde WMS (Capa 2)
const municipiosWMSLayer = new TileLayer({
    source: new TileWMS({
        url: wmsUrl,
        params: {
            'LAYERS': '2',
            'TILED': true,
            'VERSION': '1.3.0'
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
    }),
    visible: true,
    opacity: 0.7
});

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        }),
        departamentosWMSLayer,
        municipiosWMSLayer,
        dptosLayer
    ],
    view: new View({
        center: fromLonLat([-74.2973, 4.5709]), // Centro de Colombia
        zoom: 6
    })
});

// Ajustar la vista cuando se carguen las features
dptosSource.once('change', function() {
    if (dptosSource.getState() === 'ready') {
        const features = dptosSource.getFeatures();
        const extent = dptosSource.getExtent();
        console.log('Features cargadas:', features.length);
        console.log('Extent:', extent);

        // Verificar propiedades de la primera feature
        if (features.length > 0) {
            console.log('Propiedades de la primera feature:', features[0].getProperties());
            console.log('Nombre del primer departamento:', features[0].get('dpto_cnmbr'));
        }

        map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000
        });
    }
});

// Coordenadas de las ciudades (lon, lat)
const locations = {
    colombia: [-74.2973, 4.5709],
    tunja: [-73.3627, 5.5350],
    sogamoso: [-72.9342, 5.7168],
    cocuy: [-72.4389, 6.4061]
};

// Crear capa de marcadores
const markersSource = new VectorSource();
const markersLayer = new VectorLayer({
    source: markersSource,
    style: new Style({
        image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: '#ff0000' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
    })
});
map.addLayer(markersLayer);

// Función para agregar marcador
function addMarker(lon, lat, name) {
    const marker = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        name: name
    });
    markersSource.addFeature(marker);
}

// Agregar marcadores para las ciudades
addMarker(locations.colombia[0], locations.colombia[1], 'Colombia');
addMarker(locations.tunja[0], locations.tunja[1], 'Tunja');
addMarker(locations.sogamoso[0], locations.sogamoso[1], 'Sogamoso');
addMarker(locations.cocuy[0], locations.cocuy[1], 'Cocuy');

// Función para centrar el mapa en una ubicación
function centerMap(lon, lat, zoom = 10) {
    map.getView().animate({
        center: fromLonLat([lon, lat]),
        zoom: zoom,
        duration: 1000
    });
}

// Event listeners para los botones
document.getElementById('btn-colombia').addEventListener('click', () => {
    centerMap(locations.colombia[0], locations.colombia[1], 6);
});

document.getElementById('btn-tunja').addEventListener('click', () => {
    centerMap(locations.tunja[0], locations.tunja[1], 12);
});

document.getElementById('btn-sogamoso').addEventListener('click', () => {
    centerMap(locations.sogamoso[0], locations.sogamoso[1], 12);
});

document.getElementById('btn-cocuy').addEventListener('click', () => {
    centerMap(locations.cocuy[0], locations.cocuy[1], 12);
});

// Funcionalidad "Mi Ubicación"
document.getElementById('btn-mi-ubicacion').addEventListener('click', () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lon = position.coords.longitude;
                const lat = position.coords.latitude;

                // Remover marcador anterior de ubicación actual si existe
                const features = markersSource.getFeatures();
                const miUbicacionFeature = features.find(f => f.get('name') === 'Mi Ubicación');
                if (miUbicacionFeature) {
                    markersSource.removeFeature(miUbicacionFeature);
                }

                // Agregar nuevo marcador en la ubicación actual
                const marker = new Feature({
                    geometry: new Point(fromLonLat([lon, lat])),
                    name: 'Mi Ubicación'
                });
                marker.setStyle(new Style({
                    image: new CircleStyle({
                        radius: 10,
                        fill: new Fill({ color: '#4facfe' }),
                        stroke: new Stroke({ color: '#ffffff', width: 3 })
                    })
                }));
                markersSource.addFeature(marker);

                // Centrar el mapa en la ubicación actual
                centerMap(lon, lat, 14);
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);
                alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos del navegador.');
            }
        );
    } else {
        alert('La geolocalización no está disponible en tu navegador.');
    }
});

// Control de visibilidad de capas
document.getElementById('check-departamentos-wms').addEventListener('change', (e) => {
    departamentosWMSLayer.setVisible(e.target.checked);
});

document.getElementById('check-municipios-wms').addEventListener('change', (e) => {
    municipiosWMSLayer.setVisible(e.target.checked);
});

document.getElementById('check-departamentos-geojson').addEventListener('change', (e) => {
    dptosLayer.setVisible(e.target.checked);
});