import './style.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { fromLonLat } from 'ol/proj.js';
import { Fill, Stroke, Style, Text } from 'ol/style.js';
import { register } from 'ol/proj/proj4.js';
import proj4 from 'proj4';

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
        console.log('Nombre departamento:', nombre);
        return new Style({
            stroke: new Stroke({
                color: '#FF0000',
                width: 2
            }),
            fill: new Fill({
                color: 'rgba(255, 0, 0, 0.2)'
            }),
            text: new Text({
                text: nombre || '',
                font: 'bold 18px Arial',
                fill: new Fill({
                    color: '#FFFFFF'
                }),
                stroke: new Stroke({
                    color: '#000000',
                    width: 4
                }),
                overflow: true,
                offsetY: 0
            })
        });
    }
});

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        }),
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