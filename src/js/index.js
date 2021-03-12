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
import {altKeyOnly, click, pointerMove} from 'ol/events/condition';

import GeoJSON from 'ol/format/GeoJSON';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';


function initMap(){

////// draw vector layer /////////////

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

////// porygon vector layer /////////////
  var porygonVectorSource = new VectorSource({
    format: new GeoJSON(),
    url: 'http://localhost:8080/geoserver/gisdb/ows' +
            '?service=WFS'+
            '&version=1.0.0'+
            '&request=GetFeature'+
            '&typeName=gisdb%3An03-200101_27-g_administrativeboundary'+
            //'&maxFeatures=50'+
            '&outputFormat=application%2Fjson'+
            '&srsname=EPSG:4326&',
  });

  var porygonVector = new VectorLayer({
    title: 'porygon',
    type: 'base',
    visible: true,
    source: porygonVectorSource,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(37, 224, 0, 1.0)',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });


  ////// line vector layer /////////////
  var lineVectorSource = new VectorSource({
    format: new GeoJSON(),
    url: 'http://localhost:8080/geoserver/gisdb/ows' +
            '?service=WFS'+
            '&version=1.0.0'+
            '&request=GetFeature'+
            '&typeName=gisdb%3Ac23-06_27-g_coastline'+
            //'&maxFeatures=50'+
            '&outputFormat=application%2Fjson'+
            '&srsname=EPSG:4326&',
  });


  var lineVector = new VectorLayer({
    title: 'line',
    type: 'base',
    visible: false,
    source: lineVectorSource,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(252, 17, 17, 1.0)',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });
  
////// point vector layer /////////////
  var pointVectorSource = new VectorSource({
    format: new GeoJSON(),
    url: 'http://localhost:8080/geoserver/gisdb/ows' +
            '?service=WFS'+
            '&version=1.0.0'+
            '&request=GetFeature'+
            '&typeName=gisdb%3Ap30-13_27'+
            //'&maxFeatures=50'+
            '&outputFormat=application%2Fjson'+
            '&srsname=EPSG:4326&',
  });

  var pointVector = new VectorLayer({
    title: 'point',
    type: 'base',
    visible: false,
    ratio: 1,
    source: pointVectorSource,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(18, 1, 253, 1.0)',
        width: 10,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });


////// create map /////////////

  const map = new Map({
    target: 'map',
    layers: [
      new LayerGroup({
        'title' : 'BaseMap',
        layers: [ 
          porygonVector,
          lineVector,
          pointVector
        ]
      }),
      vector
    ],

    view: new View({
      zoom: 4,
      center: [135.529326, 34.713113],
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
    if (value !== 'MoveObj' && value !== 'Delete' && value !== 'Data') {  

      //描画
      draw = new Draw({　
        source: source,
        type: typeSelect.value,
      });
      map.addInteraction(draw);
      
      // スナップ
      snap = new Snap({source: source});　
      map.addInteraction(snap);
      
    }else {

      // 描画編集を切る
      map.removeInteraction(modify);

      //　図形の移動
      select = new Select({
        condition: click,
      });

      map.addInteraction(select);

      if(value == 'Data'){

        select.on('select', function (e) {
          var selectedData = select.getFeatures();
          var data = selectedData.item(0).getProperties();

          var x = ''; 
          var i = 0;
          for (const [key, value] of Object.entries(data)) { 
            if(i === 0){
              i++;
              continue;
            } else {
              x = x + (`${key}: ${value}` + '<br>');
            }
          }
          document.getElementById('info').innerHTML = x;

        });

      }else if(value == 'MoveObj'){
        
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

window.onload = () => {
  var getData = function getData(e) { 
    // var objData = { name : "TechAchademy" , 
    //             languages : ["javascript", "HTML", "CSS"] };
    
    // var x = JSON.stringify(objData);
    // console.log(x);JSON.stringify
    e.preventDefault();
    $.ajax({
      url: 'http://localhost:1234',
      type: 'POST',
      data: JSON.stringify({ id : '12345'}),
      dataType: 'json',
      timeout: 15000,
    }).success(function(data) {
      alert('success!!');
    }).error(function(XMLHttpRequest, textStatus, errorThrown) {
      alert('error!!!');
  　　console.log("XMLHttpRequest : " + XMLHttpRequest.status);
  　　console.log("textStatus     : " + textStatus);
  　　console.log("errorThrown    : " + errorThrown.message);
  });

  };
  document.getElementById('submitBtn').addEventListener('click', getData);
}




