//import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import TileWMS from 'ol/source/TileWMS';
import {Draw, Modify, Snap, Select, Translate} from 'ol/interaction';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import MVT from 'ol/format/MVT';




function initMap(){

  var source = new VectorSource({wrapX: false});

  var vector = new VectorLayer({
    source: source,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
    }),
  });

  const map = new Map({
    target: 'map',
    layers: [
      new LayerGroup({
        'title' : 'BaseMap',
        layers: [
          new TileLayer({
            //new VectorTileLayer({
            title: 'point',
            //format: new MVT(),
            // extent: [-13884991, 2870341, -7455066, 6338219],
            type: 'base',
            visible: false,
            source: new TileWMS({
            //source: new VectorTileSource({
              projection: 'EPSG:6668',
              url: 'http://localhost:8080/geoserver/wms',
              params: {'LAYERS': 'gisdb:p29-13_27'},
              ratio: 1,
              serverType: 'geoserver'
            })
          }),
        
          new TileLayer({
          //new VectorTileLayer({
            title: 'line',
            //format: new MVT(),
            // extent: [-13884991, 2870341, -7455066, 6338219],
            type: 'base',
            visible: false,
            source: new TileWMS({
            //source: new VectorTileSource({
              projection: 'EPSG:6668',
              url: 'http://localhost:8080/geoserver/wms',
              params: {'LAYERS': 'gisdb:c23-06_27-g_coastline'},
              ratio: 1,
              serverType: 'geoserver',
            })
          }),
        
          new TileLayer({
          //new VectorTileLayer({
            title: 'porygon',
            // extent: [-13884991, 2870341, -7455066, 6338219],
            type: 'base',
            //format: new MVT(),
            visible: true,
            source: new TileWMS({
            //source: new VectorTileSource({
              projection: 'EPSG:6668',
              url: 'http://localhost:8080/geoserver/wms',
              params: {'LAYERS': 'gisdb:n03-200101_27-g_administrativeboundary'},
              ratio: 1,
              serverType: 'geoserver',
            })
          })
        ]
      }),
      vector
    ],

    view: new View({
      zoom: 0,
      center: [0, 0]
    })
  });


  //レイヤ変更
  var layerSwitcher = new LayerSwitcher;　
  map.addControl(layerSwitcher);
  
  //描画編集 デフォに設定
  var modify = new Modify({source: source});  
  map.addInteraction(modify);

  var draw, snap, select, translate;  
  var typeSelect = document.getElementById('type');

  function addInteractions() {

    var value = typeSelect.value;
    if (value !== 'MoveObj' && value !== 'Delete') {  

      //描画
      draw = new Draw({　
        source: source,
        type: typeSelect.value,
      });
      map.addInteraction(draw);
      
      // スナップ
      snap = new Snap({source: source});　
      map.addInteraction(snap);
      
    } else {

      // 描画編集を切る
      map.removeInteraction(modify);

      //　図形の移動
      select = new Select();

      map.addInteraction(select);

      if(value == 'MoveObj'){
        
        translate = new Translate({
          features: select.getFeatures()
        });
        map.addInteraction(translate);

      } else { 

        // ※Hover選択に変えるほうがいいが、とりあえずは削除機能として成り立っている    
        select.getFeatures().on('add', function(feature){
          vector.getSource().removeFeature(feature.element);
          feature.target.remove(feature.element);
        });
        map.addInteracon(select);

      }
    }

  }

  /**
   * Handle change event.
   */
  typeSelect.onchange = function () {
    map.addInteraction(modify);　// 切った描画編集を戻す。
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    map.removeInteraction(select);
    map.removeInteraction(translate);
    addInteractions();
  };

  document.getElementById('undo').addEventListener('click', function () {
    draw.removeLastPoint();
  });

  document.getElementById('delete').addEventListener('click', function () {
    vector.getSource().clear();
  });

  addInteractions();

};


initMap();







