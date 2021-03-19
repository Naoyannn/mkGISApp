//import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Draw, Modify, Snap, Select, Translate} from 'ol/interaction';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {click} from 'ol/events/condition';
import * as olProj from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';

//選択図形
var select;

//選択した地物データのKeyリスト
var idList = new Array();

//MAP
var map;

// 変更実行可能フラグ 
var unableFlg1, unableFlg2, unableFlg3, unableFlg4, unableFlg5, unableFlg6, unableFlg7;

// メイン処理
function Main(){

  // ベースMAP
  var osm = new TileLayer({
    source: new OSM(),
  });

  // ポリゴンレイヤ読み込み
  var porygonVectorSource = new VectorSource({
    format: new GeoJSON(),

    // 行政区画レイヤURL
    url: 'http://localhost:8080/geoserver/gisdb/ows' +
            '?service=WFS'+
            '&version=1.0.0'+
            '&request=GetFeature'+
            '&typeName=gisdb%3An03-200101_27-g_administrativeboundary'+
            '&outputFormat=application%2Fjson'+
            '&srsname=EPSG:4326&',
  });

  // ポリゴンレイヤ作成
  var porygonVector = new VectorLayer({
    title: 'porygon',
    type: 'base',
    visible: true,
    source: porygonVectorSource,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(37, 224, 0, 1.0)',
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });


  // ラインレイヤ読み込み 
  var lineVectorSource = new VectorSource({
    format: new GeoJSON(),

    // 海岸レイヤURL
    url: 'http://localhost:8080/geoserver/gisdb/ows' +
            '?service=WFS'+
            '&version=1.0.0'+
            '&request=GetFeature'+
            '&typeName=gisdb%3Ac23-06_27-g_coastline'+
            '&outputFormat=application%2Fjson'+
            '&srsname=EPSG:4326&',
  });

  // ラインレイヤ作成
  var lineVector = new VectorLayer({
    title: 'line',
    type: 'base',
    visible: true,
    source: lineVectorSource,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(252, 17, 17, 1.0)',
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });
  
  // ポイントレイヤ読み込み 
  var pointVectorSource = new VectorSource({
    format: new GeoJSON(),

    // 郵便局レイヤ URL
    url: 'http://localhost:8080/geoserver/gisdb/ows'+
            '?service=WFS'+
            '&version=1.0.0'+
            '&request=GetFeature'+
            '&typeName=gisdb%3Ap30-13_27'+
            '&outputFormat=application%2Fjson'+
            '&srsname=EPSG:4326&',
  });

  // ポイントレイヤ作成 
  var pointVector = new VectorLayer({
    title: 'point',
    type: 'base',
    visible: true,
    ratio: 1,
    source: pointVectorSource,
    style: new Style({
      image: new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: 'rgba(0, 166, 255, 1.0)',
        }),
      }),
    }),
  });

  // 座標調整（変換） 
  let center = olProj.transform([135.529326, 34.713113], 'EPSG:4326', 'EPSG:3857');

  // マップ調整 
  let view = new View({
    zoom: 8,
    center: center,
  })

  // ベースマップ　レイヤ統合 Map全体設定
  map = new Map({
    target: 'map',
    layers: [
      osm,
      porygonVector,
      lineVector,
      pointVector,
    ],
    view: view,
  });

  var draw, snap, translate;  

  // ドロップダウン　選択 
  var typeSelect = document.getElementById('type');
  
  /// 描画編集 デフォに設定 
  var pointModify = new Modify({source: pointVectorSource}); 
  var lineModify = new Modify({source: lineVectorSource});
  var porygonModify = new Modify({source: porygonVectorSource}); 

  // ドロップダウン　選択・変更時に作動 
  function addInteractions() {

    // ドロップダウン　選択項目内容取得
    var value = typeSelect.value;
    
    if (value !== 'MoveObj' && value !== 'Delete' && value !== 'Data') {  

      // データ変更ボタン　非表示　
      document.getElementById("botton").style.visibility = "hidden"; 

      // データ情報　非表示　
      document.getElementById('info').innerHTML = "";
      
      // 描画修正 
      if(value == 'Modify'){

        snap = new Snap({source: source});　
        map.addInteraction(snap);

      // ポイント　描画処理　
      } else　if(value == 'Point') {

        removeModify(pointModify, lineModify, porygonModify);

        draw = new Draw({　
          source: pointVectorSource,
          type: 'Point',
        });
        map.addInteraction(draw);
        
        snap = new Snap({source: pointVectorSource});　
        map.addInteraction(snap);

      // ライン　描画処理　
      } else if(value == 'LineString'){

        removeModify(pointModify, lineModify, porygonModify);
       
        draw = new Draw({　
          source: lineVectorSource,
          type: 'LineString',
        });
        map.addInteraction(draw);
         
        snap = new Snap({source: lineVectorSource});　
        map.addInteraction(snap);
 
      //　ポリゴン　描画処理
      } else if(value == 'Polygon'){

        removeModify(pointModify, lineModify, porygonModify);
        
        draw = new Draw({　
          source: porygonVectorSource,
          type: 'Polygon',
        });
        map.addInteraction(draw);
        
        snap = new Snap({source: porygonVectorSource});　
        map.addInteraction(snap);

      }

    }else {

      removeModify(pointModify, lineModify, porygonModify);

      // 図形の選択　
      select = new Select({
        condition: click,
      });
      map.addInteraction(select);

      // 属性データ　表示　変更処理
      if(value == 'Data'){

        select.on('select', function (e) {

          // 属性データ　取得
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

              // 入力可能文字数表示（idによって文字数を変更）
              var limitcharNum = limitCharNum(id);

              /// 属性情報表示　HTML作成（1行） 
              var html ="（" +limitcharNum+  "）<input type=\"text\" id=\"" + id +"\" name=\"" + id +"\" class = \"input\"　>"
              idList.push(id);
              
              // 属性情報表示　HTML作成（行に追加） 
              x = x + (`${key}: ${value}` + html + '<br>');
              
            }
          }
          
          // 属性情報表示 
          document.getElementById('info').innerHTML = x;

          // 属性情報　編集ボタン表示 
          document.getElementById("botton").style.visibility = "visible";   

        }
      });

      // 図形　移動処理 
      }else if(value == 'MoveObj'){

        noShowFeatureInfo();

        // 図形移動 
        translate = new Translate({
          features: select.getFeatures()
        });

        map.addInteraction(translate);

      // 描画図形　削除処理 
      } else if(value == 'Delete'){ 

        noShowFeatureInfo();
    
        // 描画削除
        select.getFeatures().on(function(feature){
          vector.getSource().removeFeature(feature.element);
          feature.target.remove(feature.element);
        });
        map.addInteracon(select);
      }
    }
  }

  // ドロップダウンリスト　選択時　実行処理
  typeSelect.onchange = function () {
    map.addInteraction(pointModify);
    map.addInteraction(lineModify);
    map.addInteraction(porygonModify);
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    map.removeInteraction(select);
    map.removeInteraction(translate);
    addInteractions();
  };

  addInteractions();

};

//　画面ロード時　実行処理
window.onload = () => {

  Main();
  
}

// 属性情報　編集　バリデーション 
$(function(){

  var count;

  // 入力バリデーション（ポリゴンレイヤ）
  $('#form1').on('change',function(){

    for(var k =0; k<7 ;k++){
      var formData = $(this[k]);
      var id = formData[0].id;
      var value = formData[0].value;
      count = value.length;

      // 入力文字数バリデーション　フラグ判定
      checkCharNum(id, count);
      
      // 文字数制限オーバー　注意表示 
      $('#form1').validate({
        rules: {
          n03_001: {
            maxlength : 8,
          },
          n03_002: {
            maxlength : 10,
          },
          n03_003: {
            maxlength : 10,
          },
          n03_004: {
            maxlength : 14,
          },
          n03_005: {
            maxlength : 10
          },
          n03_006: {
            maxlength : 10,
          },
          n03_007: {
            maxlength : 5,
          },
        },
        messages: {
          n03_001:{
            maxlength: "8文字以内で入力してください"
          },
          n03_002:{
            maxlength: "10文字以内で入力してください"
          },
          n03_003:{
            maxlength: "10文字以内で入力してください",
          },
          n03_004:{
            maxlength: "14文字以内で入力してください",
          },
          n03_005:{
            maxlength: "10文字以内で入力してください"
          },
          n03_006:{
            maxlength: "10文字以内で入力してください"
          },
          n03_007: {
            maxlength : "5文字以内で入力してください"
          },	
      },
      });
    }
    
   });
});




// レイヤ表示切り替え 
$(function() {
  
  // チェックボックス操作時　実行　
  $('input[name="checkbox"]').on('change',function() {
 
    // チェックボタンの状態を取得 
    var polygonFlg = $('#polygon').prop('checked');
    var lineFlg = $('#line').prop('checked');
    var pointFlg = $('#point').prop('checked');

    map.getLayers().forEach(function(layer){
      
      var layerTitle = layer.getProperties().title;
      
      // チェックボタン　ポリゴン 
      if (layerTitle == "porygon"){

        if(polygonFlg == false){
          
          layer.setVisible(false);
        } else {
          layer.setVisible(true);
        }

      // チェックボタン　ライン 
      } else if (layerTitle == "line") {

        if(lineFlg == false){
          layer.setVisible(false);
        }else {
          layer.setVisible(true);
        }

      // チェックボタン　ポイント
      } else if (layerTitle == "point"){

        if(pointFlg == false){
          layer.setVisible(false);
        }else {
          layer.setVisible(true);
        }

      } else {

        return;

      } 
    });
  });

});

//　属性情報変更　処理
$(function() {
  $('#editFeatureInfo').on('click', function() {

    // 編集属性情報保持　変数 
    var featureInfo = {};

    // 選択中　属性情報取得
    var features = select.getFeatures();
    console.log(features);
    var originalData = features.item(0).getProperties();

    // 選択中　属性情報　id・テーブル名取得 
    var data = features.item(0);
    console.log(data.getId);
    var id = data.getId().split( '.' );

    for(let j = 0; j <id.length; j++){
      if(j === 0 ){
        // idまたは、テーブル名がない場合
        if(id[j] == "" || id[j] == null){
          return;
        }
        featureInfo["tableName"] = id[j];

      } else {
        featureInfo["gid"] = id[j];
      }
    }
    

    for(const id of idList){
      var editedInfo = document.getElementById(id).value;
      featureInfo[id] = editedInfo;
    }

    // 属性情報編集　処理 
    var result = window.confirm( "ID: " + id[1] +  "のデータを上書きしますか？");
    if(result){

      $.ajax({
        type: 'POST',
        url: 'http://localhost:1234/savefeature',
        dataType: 'json',
        data: featureInfo,

      //jax　処理成功 
      }).success(function(data) {

        alert('データの上書きが完了しました。')

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
            var limitcharNum = limitCharNum(id);;

            // 属性情報表示　HTML作成（1行） 
            var html ="（" +limitcharNum+  "）<input type=\"text\" id=\"" + id +"\" name=\"" + id +"\" class = \"input\"　>"
            idList.push(id);
          
            // 属性情報表示　HTML作成（行に追加） 
            x = x + (`${key}: ${value}` + html + '<br>');
          }
        }
        document.getElementById('info').innerHTML = x;

        return;

      // ajax　処理失敗 
      }).error(function(XMLHttpRequest, textStatus, errorThrown) {
        alert('上書きが失敗しました。');
    　　console.log("XMLHttpRequest : " + XMLHttpRequest.status);
    　　console.log("textStatus     : " + textStatus);
    　　console.log("errorThrown    : " + errorThrown.message);
        return;
        
      });

    } else {
      alert('データの上書きを中止しました。')
      return;
    }
    
  });

});



//　図形削除　処理
$(function() {
  $('#deleteShape').on('click', function() {

    // 削除図形　id・テーブル名保持　変数 
    var featureInfo = {};

    // 選択中　属性情報　id・テーブル名取得 
    var features = select.getFeatures();
    console.log(features);
    var data = features.item(0);
    var id = data.getId().split( '.' );

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

    console.log(featureInfo);

    // 削除アラート
    var result = window.confirm( "ID: " + id[1] +  "のデータを本当に削除しますか？");

    if(result){
      $.ajax({
        type: 'POST',
        url: 'http://localhost:1234/delete',
        dataType: 'json',
        data: featureInfo,

      // ajax 処理成功
      }).success(function(data) {
        alert('データを削除しました');
        return;

      // ajax 処理失敗 
      }).error(function(XMLHttpRequest, textStatus, errorThrown) {
        alert('データの削除に失敗しました');
    　　console.log("XMLHttpRequest : " + XMLHttpRequest.status);
    　　console.log("textStatus     : " + textStatus);
    　　console.log("errorThrown    : " + errorThrown.message);
        return;
      });

    } else {
      
      alert('図形の削除を中止しました。')
      return;
    }


  });
});




// デフォルト設定を切る
function removeModify(point,line, porygon){

  map.removeInteraction(point);
  map.removeInteraction(line);
  map.removeInteraction(porygon);

};

// 属性情報　非表示
function noShowFeatureInfo(){

  // 属性情報　編集ボタン　非表示
  document.getElementById("botton").style.visibility = "hidden"; 

  // 属性情報　非表示
  document.getElementById('info').innerHTML = "";

};

// 文字制限表示
function limitCharNum(id){

  var charNum;

 // 文字制限　表示作成 
  if(id == "n03_001"){
    charNum = "8文字以内";
  
  } else if(id == "n03_004"){
    charNum = "14文字以内";
  
  } else if(id == "n03_007"){
    charNum = "5文字以内";
  
  }else{
    charNum = "10文字以内";
  
  }

  return charNum;


};



// 入力文字数バリデーション　フラグ判定
function checkCharNum(id, count){

  // 文字数制限　変数
  var limitNum5 = 5;
  var limitNum8 = 8;
  var limitNum10 = 10;
  var limitNum14 = 14;
  // 文字数バリデーション

  if(id == "n03_001"){
    if (count <= limitNum8) {
      unableFlg1 = false;

    } else {
      unableFlg1 = true;

    }
  } else if(id == "n03_002"){
    if (count <= limitNum10) {
      unableFlg2 = false;
      
    } else {
      unableFlg2 = true;
    }

  } else if(id == "n03_003"){
    if (count <= limitNum10) {
      unableFlg3 = false;
  
    } else {
      unableFlg3 = true;

    }
        
  }else if(id == "n03_004"){
    if (count <= limitNum14) {
      unableFlg4 = false;

          
    } else {
      unableFlg4 = true;
 
    }
        
  } else if(id == "n03_005"){
    if (count <= limitNum10) {
      unableFlg5 = false;

          
    } else {
      unableFlg5 = true;

    }
        
  } else if(id == "n03_006"){
    if (count <= limitNum10) {
      unableFlg6 = false;

          
    } else {
      unableFlg6 = true;
    }
        
  } else if(id == "n03_007"){
    if (count <= limitNum5) {
      unableFlg7 = false;

    } else {
      unableFlg7 = true;
  
    }
        
  }

  // 更新ボタン　表示　非表示
  if(unableFlg1 == false && unableFlg2 == false && unableFlg3 == false 
    && unableFlg4 == false && unableFlg5 == false && unableFlg6 == false && unableFlg7 == false ){
            
    // ボタン表示 
    $("#editFeatureInfo").prop('disabled', false).removeClass('disabled');
  }else {
  
  // ボタン非表示 
    $("#editFeatureInfo").prop('disabled', true).addClass('disabled');
  }

}


