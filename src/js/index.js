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
import * as olProj from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';


var allSource, select;



var idList = new Array();

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
    url: 'http://localhost:8080/geoserver/gisdb/ows'+
            '?service=WFS'+
            '&version=1.0.0'+
            '&request=GetFeature'+
            '&typeName=gisdb%3Ap30-13_27'+
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
        color: 'rgba(0, 166, 255, 1.0)',
        width: 5,
      }),
      fill: new Fill({
        color: 'rgba(0, 166, 255, 1.0)',
      }),
      image: new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: 'rgba(0, 166, 255, 1.0)',
        }),
      }),
    }),
  });


////// create map /////////////

  let center = olProj.transform([135.529326, 34.713113], 'EPSG:4326', 'EPSG:3857');

  let view = new View({
    zoom: 8,
    center: center,
  })

  const map = new Map({
    target: 'map',
    layers: [
      new LayerGroup({
        'title' : 'BaseMap',
        layers: [ 
          porygonVector,
          lineVector,
          pointVector,
        ]
      }),
      vector
    ],

    view: view,
  });

  //レイヤ変更
  var layerSwitcher = new LayerSwitcher;　
  map.addControl(layerSwitcher);
  
  //描画編集 デフォに設定
  var modify = new Modify({source: source});  
  map.addInteraction(modify);

  var draw, snap, translate;  
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

          if(data !== null){

          var x = ''; 
          var i = 0;
          for (const [key, value] of Object.entries(data)) { 
            if(i === 0){
              i++;
              continue;
            } else {

              var id = key;
              var html ="＜変更＞<input type=\"text\" id=\"" + id +"\">"
              idList.push(id);

              x = x + (`${key}: ${value}` + html + '<br>');
              
            }
          }
          document.getElementById('info').innerHTML = x;

          }

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
  
  var editData = function editData(e) { 

    //選択中の属性情報の変更
    var features = select.getFeatures();
    console.log(features);

    var originalData = features.item(0).getProperties();


    var data = features.item(0);
    // console.log(data);
    var id = data.getId().split( '.' );

    //編集入力値取得
    var featureInfo = {};

    if(id.length  !== 2){
      
    } else {
      for(let j = 0; j <id.length; j++){
        if(j === 0 ){
          featureInfo["tableName"] = id[j]
        } else {
          featureInfo["gid"] = id[j]
        }
      }
    }

    for(const id of idList){
      var editedInfo = document.getElementById(id).value;
      featureInfo[id] = editedInfo;
    }

    //console.log(featureInfo);

    // const geoJsonObject = new GeoJSON();
    // var x = geoJsonObject.writeFeaturesObject([data]);

    $.ajax({
      type: 'POST',
      url: 'http://localhost:1234/',
      dataType: 'json',
      data: featureInfo,
    }).success(function(data) {
      
      var x = ''; 
      var i = 0;
      // 元データを読み込み、更新されているものだけ上書き
      for (const [key, value] of Object.entries(originalData)) { 
        if(i === 0){
          i++;
          continue;
        } else {
          
          for (const [key2, value2] of Object.entries(data)) { 
            if(value2 != "" && value2 != null){
              if(key == key2){
                value = value2;
                features.set(key2, value2);
              }
            } 
          }
          
          var id = key;
          var html ="＜変更＞<input type=\"text\" id=\"" + id +"\">"
          x = x + (`${key}: ${value}` + html + '<br>');
        }
      }
      document.getElementById('info').innerHTML = x;

    }).error(function(XMLHttpRequest, textStatus, errorThrown) {
      alert('error!!!');
  　　console.log("XMLHttpRequest : " + XMLHttpRequest.status);
  　　console.log("textStatus     : " + textStatus);
  　　console.log("errorThrown    : " + errorThrown.message);
    });

  };
  document.getElementById('editFeatureInfo').addEventListener('click', editData);

  var saveNewData = function saveNewData(e) { 

    var editedInfo = document.getElementById("n03_001").value;
    console.log(editedInfo);

    //選択中の属性情報の変更
    var features = select.getFeatures();
    //console.log(features);

    var data = features.item(0);
    const geoJsonObject = new GeoJSON();
    var x = geoJsonObject.writeFeaturesObject([data]);
    //console.log(x);

    $.ajax({
      type: 'POST',
      url: 'http://localhost:1234/',
      dataType: 'json',
      data: x,
    }).success(function(data) {
      console.log(data);
    }).error(function(XMLHttpRequest, textStatus, errorThrown) {
      alert('error!!!');
  　　console.log("XMLHttpRequest : " + XMLHttpRequest.status);
  　　console.log("textStatus     : " + textStatus);
  　　console.log("errorThrown    : " + errorThrown.message);
    });

  };
  document.getElementById('saveNewFeature').addEventListener('click', saveNewData);

}




