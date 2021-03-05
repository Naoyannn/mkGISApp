//import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import TileWMS from 'ol/source/TileWMS';


function initMap(){
  const map = new Map({
    target: 'map',
    layers: [
      new LayerGroup({
        'title' : 'BaseMap',
        layers: [
          new TileLayer({
            title: 'point',
            // extent: [-13884991, 2870341, -7455066, 6338219],
            type: 'base',
            visible: false,
            source: new TileWMS({
              projection: 'EPSG:4326',
              url: 'http://localhost:8080/geoserver/wms',
              params: {'LAYERS': 'gisdb:p29-13_27'},
              ratio: 1,
              serverType: 'geoserver'
            })
          }),
        
          new TileLayer({
            title: 'line',
            // extent: [-13884991, 2870341, -7455066, 6338219],
            type: 'base',
            visible: false,
            source: new TileWMS({
              projection: 'EPSG:4326',
              url: 'http://localhost:8080/geoserver/wms',
              params: {'LAYERS': 'gisdb:c23-06_27-g_coastline'},
              ratio: 1,
              serverType: 'geoserver',
            })
          }),
        
          new TileLayer({
            title: 'porygon',
            // extent: [-13884991, 2870341, -7455066, 6338219],
            type: 'base',
            visible: true,
            source: new TileWMS({
              projection: 'EPSG:4326',
              url: 'http://localhost:8080/geoserver/wms',
              params: {'LAYERS': 'gisdb:n03-200101_27-g_administrativeboundary'},
              ratio: 1,
              serverType: 'geoserver',
            })
          })
        ]
      })
    ],

    view: new View({
      zoom: 0,
      center: [0, 0]
    })
  });

  var layerSwitcher = new LayerSwitcher({
    tipLabel: 'Légende'
  });
  map.addControl(layerSwitcher);

  
};

initMap();




