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
var selectedShape;

//選択した地物データのKeyリスト
var selectedGeoKeyList;

//MAP
var map;

// 変更実行可能フラグ 
var unableFlg1, unableFlg2, unableFlg3, unableFlg4, unableFlg5, unableFlg6, unableFlg7;

// 文字数制限　グローバル変数
var limitNum1 = 1;
var limitNum4 = 4;
var limitNum5 = 5;
var limitNum8 = 8;
var limitNum10 = 10;
var limitNum14 = 14;
var limitNum46 = 46;
var limitNum254 = 254;
var limitNumSmallinit = 32767;

// レイヤソース
var porygonVectorSource;
var lineVectorSource;
var pointVectorSource;

// 選択レイヤタイプ
var typeSelect;

// 描画、スナップ、移動　変数
var draw, snap, translate, pointModify, lineModify, porygonModify; 

// メイン処理
function Main(){

  try{

      // ベースMAP
    var osm = new TileLayer({
      source: new OSM(),
    });

    // ポリゴンレイヤ読み込み
    porygonVectorSource = new VectorSource({
      format: new GeoJSON(),

      url: function () {
        return (
          'http://localhost:8080/geoserver/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=gisdb%3An03-200101_27-g_administrativeboundary&' +
          'outputFormat=application/json&srsname=EPSG:4326&'
        );
      },
    });

    //　ベースマップがない場合エラー
    if(porygonVectorSource == null){
      throw('No Base Map');
    }

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
    lineVectorSource = new VectorSource({
      format: new GeoJSON(),
      url: function () {
        return (
          'http://localhost:8080/geoserver/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=gisdb%3Ac23-06_27-g_coastline&' +
          'outputFormat=application/json&srsname=EPSG:4326&'
        );
      },

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
    pointVectorSource = new VectorSource({
      format: new GeoJSON(),

      url: function () {
        return (
          'http://localhost:8080/geoserver/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename=gisdb%3Ap30-13_27&' +
          'outputFormat=application/json&srsname=EPSG:4326&'
        );
      },
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
    var center = olProj.transform([135.529326, 34.713113], 'EPSG:4326', 'EPSG:3857');

    // マップ調整 
    var view = new View({
      zoom: 10,
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

    // ドロップダウン　選択 
    typeSelect = document.getElementById('type');

    // ドロップダウンリスト　選択時　実行処理
    typeSelect.onchange = function () {
      removeInteraction();
      addInteractions();
    };

    addInteractions();

  } catch(e) {

    alert(e);
    console.error(e);

  }
};

// ドロップダウン　選択・変更時に作動 
function addInteractions() {

  // ドロップダウン　選択項目内容取得
  var chosenOpe = typeSelect.value;
  
  if (chosenOpe !== 'MoveObj' && chosenOpe !== 'Delete' && chosenOpe !== 'Data') {  

    // データ変更ボタン　非表示　
    document.getElementById("botton").style.visibility = "hidden"; 

    // データ情報　非表示　
    document.getElementById('info').innerHTML = "";
    
    // 描画修正 
    if(chosenOpe == 'Modify'){
      // 描画編集 デフォに設定 
      pointModify = new Modify({source: pointVectorSource}); 
      lineModify = new Modify({source: lineVectorSource});
      porygonModify = new Modify({source: porygonVectorSource}); 
      map.addInteraction(pointModify);
      map.addInteraction(lineModify);
      map.addInteraction(porygonModify);

      snap = new Snap({
        source: porygonVectorSource, lineVectorSource, pointVectorSource,
      });　
      map.addInteraction(snap);

    // ポイント　描画処理　
    } else　if(chosenOpe == 'Point') {

      draw = new Draw({　
        source: pointVectorSource,
        type: 'Point',
      });
      map.addInteraction(draw);
      
      snap = new Snap({source: pointVectorSource});　
      map.addInteraction(snap);

    // ライン　描画処理　
    } else if(chosenOpe == 'MultiLineString'){
    
      draw = new Draw({　
        source: lineVectorSource,
        type: 'MultiLineString',
      });
      map.addInteraction(draw);
      
      snap = new Snap({source: lineVectorSource});　
      map.addInteraction(snap);

    //　ポリゴン　描画処理
    } else if(chosenOpe == 'MultiPolygon'){
      
      draw = new Draw({　
        source: porygonVectorSource,
        type: 'MultiPolygon',
      });
      map.addInteraction(draw);
      
      snap = new Snap({source: porygonVectorSource});　
      map.addInteraction(snap);

    }

  }else {

    // 図形の選択　
    selectedShape = new Select({
      condition: click,
    });
    map.addInteraction(selectedShape);

    // 属性データ　表示　変更処理
    if(chosenOpe == 'Data'){

      selectedShape.on('select', function (e) {

        selectedGeoKeyList  = new Array()

        // 属性データ　取得
        var selectedData = selectedShape.getFeatures();

        var attributeData;

        if(selectedData.item(0) != null){
          // Feature データチェック
          if(selectedData.item(0).getProperties() != null){
            attributeData = selectedData.item(0).getProperties();
            if(Object.keys(attributeData).length > 1){

                // 表示HTML（全文）変数 
              var fullHtml = ''; 
              var i = 0;
              for (const [key, value] of Object.entries(attributeData)) { 
  
                if(i === 0){
                  i++;
                  continue;
                } else {
  
                  // 入力可能文字数表示（idによって文字数を変更）
                  var limitcharNum = limitCharNum(key);
  
                  /// 属性情報表示　HTML作成（1行） 
                  var html ="（" +limitcharNum+  "）<input type=\"text\" id=\"" + key +"\" name=\"" + key +"\" class = \"input\"　>"
                  selectedGeoKeyList.push(key);
                  
                  // 属性情報表示　HTML作成（全文） 
                  fullHtml = fullHtml + (`${key}: ${value}` + html + '<br>');
                }
              } 
  
              // 属性情報表示 
              document.getElementById('info').innerHTML = fullHtml;
  
              // 属性情報　編集ボタン表示 
              document.getElementById("botton").style.visibility = "visible"; 
  
            } else {
              
              fullHtml = makeNewFeatureInfo(attributeData);
  
              // 属性情報入力欄表示
              document.getElementById('info').innerHTML = fullHtml;
  
              // 属性情報　編集ボタン表示 
              document.getElementById("botton").style.visibility = "visible"; 
  
            }
          }
          
        } else {
          selectedData.clear();
          noShowFeatureInfo();
        }
      });

    // 図形　移動処理 
    }else if(chosenOpe == 'MoveObj'){

      noShowFeatureInfo();

      // 図形移動 
      translate = new Translate({
        features: selectedShape.getFeatures()
      });

      map.addInteraction(translate);

    // 描画図形　削除処理 
    } else if(chosenOpe == 'Delete'){ 

      noShowFeatureInfo();
      // 描画削除
      selectedShape.getFeatures().on('add', function(feature){

        // データ選択
        var selectedData = selectedShape.getFeatures();
        var attributeData = selectedData.item(0).getProperties();  

        if(Object.keys(attributeData).length > 1){

          alert("DBに登録されている図形です。図形情報削除ボタンで削除してください");
          selectedData.clear();
          return;
        }

        var alertResult = confirm("描画を削除しますか？");

        if(alertResult){

          selectedShape.getLayer(feature.element).getSource().removeFeature(feature.element);
          feature.target.remove(feature.element);
          selectedData.clear();
          var alertResult = confirm("描画を削除しました。");

        } else {

          alert("描画を中止しました。");
          selectedData.clear();
          return;

        }
      });
    }
  }
}

// レイヤ表示切り替え 処理
$(function() {
      
  // チェックボックス操作時　実行　
  $('input[name="checkbox"]').on('change',function() {
    try{
        
      // チェックボタンの状態を取得 
      var polygonFlg = $('#polygon').prop('checked');
      var lineFlg = $('#line').prop('checked');
      var pointFlg = $('#point').prop('checked');

      // レイヤを取得
      var layer = map.getLayers();

      if(layer == null){
        throw new Error("レイヤが存在しません")
      }

      layer.forEach(function(layer){
        
        var layerTitle = layer.getProperties().title;
        
        // チェックボタン　ポリゴン 
        if (layerTitle == "porygon"){

          if(polygonFlg == false){

            var type = "MultiPolygon";
            unselectCheckBoxt(layer, type, selectedShape, typeSelect);

          } else {
            layer.setVisible(true);
            $("#MultiPolygon").prop('disabled', false).removeClass('disabled'); 
          }

        // チェックボタン　ライン 
        } else if (layerTitle == "line") {

          if(lineFlg == false){
            var type = "MultiLineString";
            unselectCheckBoxt(layer, type, selectedShape, typeSelect);

          }else {
            layer.setVisible(true);
            $("#MultiLineString").prop('disabled', false).removeClass('disabled'); 
          }

        // チェックボタン　ポイント
        } else if (layerTitle == "point"){

          if(pointFlg == false){

            var type = "Point";
            unselectCheckBoxt(layer, type, selectedShape, typeSelect);

          }else {
            layer.setVisible(true);
            $("#Point").prop('disabled', false).removeClass('disabled'); 
          }

        } else {

          return;
        } 
      });

      if(polygonFlg === false && lineFlg === false && pointFlg === false){

        $("#type").prop("selectedIndex", 0);
        $("#Data").prop('disabled', true).addClass('disabled');
        $("#MoveObj").prop('disabled', true).addClass('disabled');
        $("#Modify").prop('disabled', true).addClass('disabled');
        $("#Delete").prop('disabled', true).addClass('disabled');
        removeInteraction();
        
      } else {
        $("#Data").prop('disabled', false).removeClass('disabled'); 
        $("#MoveObj").prop('disabled', false).removeClass('disabled'); 
        $("#Modify").prop('disabled', false).removeClass('disabled'); 
        $("#Delete").prop('disabled', false).removeClass('disabled'); 

      }
    } 
    catch(e) {

      alert(e);
      console.error(e);
      return;

    }
  });
});


//　チェックボックス未選択時　選択解除
function unselectCheckBoxt(layer, type, selectedShape, typeSelect){

  if(selectedShape != null){
    if(selectedShape.getFeatures() != null){
      if(selectedShape.getFeatures().item(0) != null){
        if(selectedShape.getFeatures().item(0).getProperties() != null){
          var selectedType = selectedShape.getFeatures().item(0).getProperties().geometry.constructor.name;
          if (selectedType == type){
            selectedShape.getFeatures().clear();
            noShowFeatureInfo();
          }
        }
      }
    }
  }

  layer.setVisible(false);
  $("#"+type).prop('disabled', true).addClass('disabled');
  if(typeSelect.value == type){
    $("#type").prop("selectedIndex", 0);
    map.removeInteraction(draw);
  }
}

// マップインタラクション解除
function removeInteraction(){

  map.removeInteraction(pointModify);
  map.removeInteraction(lineModify);
  map.removeInteraction(porygonModify);
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  map.removeInteraction(selectedShape);
  map.removeInteraction(translate);

}

//　属性情報変更　処理
$(function() {
  $('#editFeatureInfo').on('click', function() {

    try{

      // 編集属性情報保持　変数 
      var featureInfo = {};

      // 選択中　属性情報取得
      var features = selectedShape.getFeatures();
      var originalData = features.item(0).getProperties();

      // 選択中　属性情報　id・テーブル名取得 
      var data = features.item(0);
      if(data == null){
        throw("属性情報が存在しません");
      }
  
      if(data.getId() == null || data.getId() ==""){

        throw("DBに元データが存在しません。図形を新規登録して下さい")

      } else {

        // ID とテーブル名を取得
        var uidTableNameList = data.getId().split( '.' );

      }

      for(let j = 0; j <uidTableNameList.length; j++){
        if(j == 0 ){
          //テーブル名がない場合
          if(uidTableNameList[j] == "" || uidTableNameList[j] == null){
            throw("テーブルが存在しません");
          }
          featureInfo["tableName"] = uidTableNameList[j];

        } else {
          featureInfo["gid"] = uidTableNameList[j];
        }
      }
      
      for(const id of selectedGeoKeyList){

        if(document.getElementById(id).value == null){
          continue;
        }
        var editedInfo = document.getElementById(id).value;
        
        featureInfo[id] = editedInfo;
      }

      // 属性情報編集　処理 
      var result = window.confirm( "ID: " + uidTableNameList[1] +  "のデータを上書きしますか？");
      if(result){

        $.ajax({
          type: 'POST',
          url: 'http://localhost:1234/savefeature',
          dataType: 'json',
          data: featureInfo,

        //jax　処理成功 
        }).success(function(data) {

          alert('データの上書きが完了しました。');
          refreshSource();
          // 属性情報・図形情報更新処理後　属性情報再表示処理
          viewAfUpdate(features, data, originalData)

        // ajax　処理失敗 
        }).error(function(XMLHttpRequest) {

          alert(XMLHttpRequest.responseText);
          alert('上書きが失敗しました。');
          return;  
          
        });

      } else {
        alert('データの上書きを中止しました。');
        
      }
    }
    catch(e) {

      alert(e);
      console.error(e);
      return;

    }
  });
});

//　図形削除　処理
$(function() {
  $('#deleteShape').on('click', function() {

    try{
      // 削除図形　id・テーブル名保持　変数 
      var featureInfo = {};

      // 選択中　属性情報　id・テーブル名取得 
      var features = selectedShape.getFeatures();
      var attributeData = features.item(0);

      if(attributeData == null){
        throw("属性情報が存在しません")
      }

      if(attributeData.getId() == null || attributeData.getId() ==""){

        throw("DBに元データが存在しません。削除できません");

      } else {

        var uidTableNameList = attributeData.getId().split( '.' );

      }

      for(let j = 0; j <uidTableNameList.length; j++){
        if(j == 0 ){
          //テーブル名がない場合
          if(uidTableNameList[j] == "" || uidTableNameList[j] == null){
            alert("テーブルが存在しません");
            throw("テーブルが存在しません");
          }
          featureInfo["tableName"] = uidTableNameList[j];

        } else {
          featureInfo["gid"] = uidTableNameList[j];
        }
      }

      // 削除アラート
      var result = window.confirm( "ID: " + uidTableNameList[1] +  "のデータを本当に削除しますか？");

      if(result){
        $.ajax({
          type: 'POST',
          url: 'http://localhost:1234/delete',
          dataType: 'json',
          data: featureInfo,

        // ajax 処理成功
        }).success(function(data) {
          alert('データを削除しました');
          noShowFeatureInfo();
          features.clear();
          refreshSource()

        // ajax 処理失敗 
        }).error(function(XMLHttpRequest) {
          alert(XMLHttpRequest.responseText);
          alert('データの削除に失敗しました');
          return;
        });

      } else {
        
        alert('図形の削除を中止しました。');
        return;
      }
    }
    catch(e) {
      alert(e);
      console.error(e);
      return;
    }
  });
});

//　図形新規登録　処理
$(function() {
  $('#saveShape').on('click', function() {

    try{

      // 編集属性情報保持　変数 
      var featureInfo = {};

      // 選択中　属性情報取得
      var features = selectedShape.getFeatures();
      var featureItemData = features.item(0);
      var originalData = featureItemData.getProperties();
      var layerType = originalData.geometry.constructor.name;
      var tableName;

      // 選択中　属性情報　id・テーブル名取得 
      var data = features.item(0);
      if(data == null){
        throw("属性情報が存在しません");
      }
   
      // レイヤタイプによって、保存先テーブル名を決定
    
      if (layerType == "MultiPolygon"){

        tableName = "n03-200101_27-g_administrativeboundary";
  
      } else if (layerType == "MultiLineString"){

        tableName = "c23-06_27-g_coastline"
  
      } else if (layerType == "Point"){

        tableName = "p30-13_27"

      } else {
  
        throw("対象テーブルが存在しません")

      }
      
      // テーブル名をオブジェクトに格納
      featureInfo["tableName"] = tableName;

      const geoJsonObject = new GeoJSON();
      var geoInfoJson = geoJsonObject.writeFeatureObject(featureItemData);
      
      // 地理情報をオブジェクトに格納
      featureInfo["geom"] = geoInfoJson;
      
      // 入力データをオブジェクトに格納
      for(const id of selectedGeoKeyList){

        if(document.getElementById(id).value == null){
          continue;
        }
        var editedInfo = document.getElementById(id).value;
        
        featureInfo[id] = editedInfo;
      }

      // 属性情報編集　処理 
      var result = window.confirm( "新規図形を保存しますか？");
      if(result){

        $.ajax({
          type: 'POST',
          url: 'http://localhost:1234/saveNewGeometry',
          dataType: 'json',
          data: featureInfo,

        //jax　処理成功 
        }).success(function(data) {

          alert('新規保存が完了しました。');
          noShowFeatureInfo();
          refreshSource()
          features.clear();

        // ajax　処理失敗 
        }).error(function(XMLHttpRequest) {

          alert(XMLHttpRequest.responseText);
          alert('新規登録が失敗しました。');
          return;  
          
        });

      } else {
        alert('新規登録を中止しました。');
        return;
        
      }
    }
    catch(e) {

      alert(e);
      console.error(e);
      return;

    }
  });
});

//　図形情報更新　処理
$(function() {
  $('#updateShape').on('click', function() {

    try{

      // 編集属性情報保持　変数 
      var featureInfo = {};

      // 選択中　属性情報取得
      var features = selectedShape.getFeatures();
      var featureItemData = features.item(0);

      // 選択中　属性情報　id・テーブル名取得 
      var data = features.item(0);
      if(data == null){
        throw("属性情報が存在しません");
      }
  
      if(data.getId() == null || data.getId() ==""){

        throw("DBに元データが存在しません。図形を新規登録して下さい")

      } else {

        // Gid　テーブル名取得
        var uidTableNameList = data.getId().split( '.' );

      }

      for(let j = 0; j <uidTableNameList.length; j++){
        if(j == 0 ){
          //テーブル名がない場合
          if(uidTableNameList[j] == "" || uidTableNameList[j] == null){
            throw("テーブルが存在しません");
          }
          featureInfo["tableName"] = uidTableNameList[j];

        } else {
          featureInfo["gid"] = uidTableNameList[j];
        }
      }
      
      for(const id of selectedGeoKeyList){

        if(document.getElementById(id).value == null){
          continue;
        }
        var editedInfo = document.getElementById(id).value;
        
        featureInfo[id] = editedInfo;
      }

      const geoJsonObject = new GeoJSON();
      var geoInfoJson = geoJsonObject.writeFeatureObject(featureItemData);
      
      // 地理情報をオブジェクトに格納
      featureInfo["geom"] = geoInfoJson;
      
      // 入力データをオブジェクトに格納
      for(const id of selectedGeoKeyList){

        if(document.getElementById(id).value == null){
          continue;
        }
        var editedInfo = document.getElementById(id).value;
        
        featureInfo[id] = editedInfo;
      }

      // 属性情報編集　処理 
      var result = window.confirm( "図形情報を更新しますか？");
      if(result){

        $.ajax({
          type: 'POST',
          url: 'http://localhost:1234/updateShape',
          dataType: 'json',
          data: featureInfo,

        //jax　処理成功 
        }).success(function(data) {

          alert('図形情報更新が完了しました。')
          noShowFeatureInfo();
          refreshSource()
          features.clear();

        // ajax　処理失敗 
        }).error(function(XMLHttpRequest) {

          alert(XMLHttpRequest.responseText);
          alert('図形情報更新が失敗しました。');
          return;
          
        });
      } else {
        alert('図形情報更新を中止しました。');
        
      }
    }
    catch(e) {

      alert(e);
      console.error(e);
      return;

    }
  });
});

// 属性情報　非表示　メソッド
function noShowFeatureInfo(){

  // 属性情報　編集ボタン　非表示
  document.getElementById("botton").style.visibility = "hidden"; 

  // 属性情報　非表示
  document.getElementById('info').innerHTML = "";

};

// 新規描画　属性情報入力HTML表示
function makeNewFeatureInfo(attributeData){

  var fullHtml;
  var porygonColumBase = "n03_00";
  var lineColumBase = "c23_00";
  var pointColumBase = "p30_00";

  try{

    if(attributeData.geometry.constructor.name == "MultiPolygon"){

      fullHtml = makeFullHtml(porygonColumBase);
  
      return fullHtml;
  
    } else if(attributeData.geometry.constructor.name == "MultiLineString"){
  
      fullHtml = makeFullHtml(lineColumBase);
  
      return fullHtml;
  
    } else if(attributeData.geometry.constructor.name == "Point"){
  
      fullHtml = makeFullHtml(pointColumBase);
  
      return fullHtml;
  
    } else {
  
      throw('レイヤが存在しません。');
  
    }
  }

  catch{
    
    console.error(e);
    alert(e);
    return;
    
  }
}

function makeFullHtml(ColumBase){

  var fullHtml = "";

  for(var i = 1; i < 8; i++){

    var columKey = ColumBase + i;

    var limitcharNum = limitCharNum(columKey);

    var html =columKey +":（" +limitcharNum+  "）<input type=\"text\" id=\"" + columKey +"\" name=\"" + columKey +"\" class = \"input\"　>"
    selectedGeoKeyList.push(columKey);
        
    // 属性情報表示　HTML作成（全文） 
    fullHtml = fullHtml + (html + '<br>');
  
  }

  return fullHtml;

}

// 属性情報・図形情報更新処理後　属性情報再表示
function viewAfUpdate(features, data, originalData){

  var fullHtml = ''; 
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
      var limitcharNum = limitCharNum(id);

      // 属性情報表示　HTML作成（1行） 
      var html ="（" +limitcharNum+  "）<input type=\"text\" id=\"" + id +"\" name=\"" + id +"\" class = \"input\"　>"
      selectedGeoKeyList.push(id);
    
      // 属性情報表示　HTML作成（行に追加） 
      fullHtml = fullHtml + (`${key}: ${value}` + html + '<br>');
    }
  }
  document.getElementById('info').innerHTML = fullHtml;
  refreshSource();
}

// デフォルト設定を切断　メソッド
function refreshSource(){

  porygonVectorSource.refresh();
  lineVectorSource.refresh();
  pointVectorSource.refresh();

};

// 文字制限表示　メソッド
function limitCharNum(id){

  try{
    var restrictCharNum;
    var withinLetter = "文字以内";

    if(id == null){
      throw('保存先Keyが存在しません');
    }

    // 文字制限　表示作成 
    else if(id == "n03_001"){
      restrictCharNum = limitNum8 + withinLetter;
    
    } else if(id == "n03_002"){
      restrictCharNum = limitNum10 + withinLetter;
    
    } else if(id == "n03_003"){
      restrictCharNum = limitNum10 + withinLetter;
    
    } else if(id == "n03_004"){
      restrictCharNum = limitNum14 + withinLetter;
    
    } else if(id == "n03_005"){
      restrictCharNum = limitNum10 + withinLetter;
    
    } else if(id == "n03_006"){
      restrictCharNum = limitNum10 + withinLetter;
    
    } else if(id == "n03_007"){
      restrictCharNum = limitNum5 + withinLetter;
    
    } else if(id == "p30_001"){
      restrictCharNum = limitNum10 + withinLetter;
    
    } else if(id == "p30_002"){
      restrictCharNum = limitNum10 + withinLetter;
    
    } else if(id == "p30_003"){
      restrictCharNum = limitNum14 + withinLetter;
    
    } else if(id == "p30_004"){
      restrictCharNum = limitNum10 + withinLetter;
    
    } else if(id == "p30_005"){
      restrictCharNum = limitNum254 + withinLetter;
    
    } else if(id == "p30_006"){
      restrictCharNum = limitNum254 + withinLetter;
    
    } else if(id == "p30_007"){
      restrictCharNum = "任意文字数";
    
    }else if(id == "c23_001"){
      restrictCharNum = limitNum5 + withinLetter;
    
    } else if(id == "c23_002"){
      restrictCharNum = limitNum1 + withinLetter;
    
    } else if(id == "c23_003"){
      restrictCharNum = limitNum4 + withinLetter;
    
    } else if(id == "c23_004"){
      restrictCharNum = limitNum46 + withinLetter;
    
    } else if(id == "c23_005"){
      restrictCharNum = limitNum1 + withinLetter;
    
    } else if(id == "c23_006"){
      restrictCharNum = limitNum10 + withinLetter;
    
    } else if(id == "c23_007"){
      restrictCharNum = limitNum5 + withinLetter;
    
    }
    return restrictCharNum;

  }
  catch(e){

    console.error(e);
    alert(e);
    return;

  }
};

// 入力文字数バリデーション　フラグ判定 メソッド
function checkCharNum(id, count){

  try{

    // 文字数バリデーション
    if(id == null){    

      throw('保存先Keyが存在しません');

    } else if(id == "n03_001"){
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
        unableFlg3 = false
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
    } else if(id == "p30_001"){
      if (count <= limitNum10) {
        unableFlg1 = false;
      } else {
        unableFlg1 = true;
      }  
    } else if(id == "p30_002"){
      if (count <= limitNum10) {
        unableFlg2 = false;
      } else {
        unableFlg2 = true;
      }
    } else if(id == "p30_003"){
      if (count <= limitNum10) {
        unableFlg3 = false;
      } else {
        unableFlg3 = true;
      } 
    } else if(id == "p30_004"){
      if (count <= limitNum10) {
        unableFlg4 = false;
      } else {
        unableFlg4 = true;
      } 
    } else if(id == "p30_005"){
      if (count <= limitNum254) {
        unableFlg5 = false;
      } else {
        unableFlg5 = true;
      }  
    } else if(id == "p30_006"){
      if (count <= limitNum254) {
        unableFlg6 = false;
      } else {
        unableFlg6 = true;
      }  
    } else if(id == "p30_007"){
      if (count <= limitNumSmallinit) {
        unableFlg7 = false;
      } else {
        unableFlg7 = true;
      }  
    } else if(id == "c23_001"){
      if (count <= limitNum5) {
        unableFlg1 = false;
      } else {
        unableFlg1 = true;
      } 
    } else if(id == "c23_002"){
      if (count <= limitNum1) {
        unableFlg2 = false;
      } else {
        unableFlg2 = true;
      } 
    } else if(id == "c23_003"){
      if (count <= limitNum4) {
        unableFlg3 = false;
      } else {
        unableFlg3 = true;
      }
    } else if(id == "c23_004"){
      if (count <= limitNum46) {
        unableFlg4 = false;
      } else {
        unableFlg4 = true;
      }    
    } else if(id == "c23_005"){
      if (count <= limitNum1) {
        unableFlg5 = false;
      } else {
        unableFlg5 = true;
      }    
    } else if(id == "c23_006"){
      if (count <= limitNum10) {
        unableFlg6 = false;
      } else {
        unableFlg6 = true; 
      }    
    } else if(id == "c23_007"){
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
      $("#saveShape").prop('disabled', false).removeClass('disabled');
      $("#updateShape").prop('disabled', false).removeClass('disabled');
    }else {
    
    // ボタン非表示 
      $("#editFeatureInfo").prop('disabled', true).addClass('disabled');
      $("#saveShape").prop('disabled', true).addClass('disabled');
      $("#updateShape").prop('disabled', true).addClass('disabled');
      
    }

  }

  catch(e) {

    console.error(e);
    alert(e);
    return;
  }
}

// 属性情報　編集　バリデーション　処理 
$(function(){

  var count;

  // 入力バリデーション（ポリゴンレイヤ）
  $('#inputForm').on('change',function(){

    try{

      for(var k =0; k<7 ;k++){
        var formData = $(this[k]);
        var formDataKey = formData[0].id;
        var formDataValue = formData[0].value;
        count = formDataValue.length;
  
        const limitLetter = "文字以内で入力してください"
  
        // 入力文字数バリデーション　フラグ判定
        checkCharNum(formDataKey, count);
        
        // 文字数制限オーバー　注意表示 
        $('#inputForm').validate({
          rules: {
            n03_001: {
              maxlength : limitNum8,
            },
            n03_002: {
              maxlength : limitNum10,
            },
            n03_003: {
              maxlength : limitNum10,
            },
            n03_004: {
              maxlength : limitNum14,
            },
            n03_005: {
              maxlength : limitNum10,
            },
            n03_006: {
              maxlength : limitNum10,
            },
            n03_007: {
              maxlength : limitNum5,
            },
            p30_001: {
              maxlength : limitNum10,
            },
            p30_002: {
              maxlength : limitNum10,
            },
            p30_003: {
              maxlength : limitNum10,
            },
            p30_004: {
              maxlength : limitNum10,
            },
            p30_005: {
              maxlength : limitNum254,
            },
            p30_006: {
              maxlength : limitNum254,
            },
            c23_001: {
              maxlength : limitNum5,
            },
            c23_002: {
              maxlength : limitNum1,
            },
            c23_003: {
              maxlength : limitNum4,
            },
            c23_004: {
              maxlength : limitNum46,
            },
            c23_005: {
              maxlength : limitNum1
            },
            c23_006: {
              maxlength : limitNum10,
            },
            c23_007: {
              maxlength : limitNum5,
            },
          },
          messages: {
            n03_001:{
              maxlength: limitNum8 +limitLetter
            },
            n03_002:{
              maxlength: limitNum10 + limitLetter
            },
            n03_003:{
              maxlength: limitNum10 +limitLetter
            },
            n03_004:{
              maxlength: limitNum14 + limitLetter
            },
            n03_005:{
              maxlength: limitNum10 + limitLetter
            },
            n03_006:{
              maxlength: limitNum10 + limitLetter
            },
            n03_007: {
              maxlength : limitNum5 + limitLetter
            },
            p30_001:{
              maxlength: limitNum10 + limitLetter
            },
            p30_002:{
              maxlength: limitNum10 + limitLetter
            },
            p30_003:{
              maxlength: limitNum10 + limitLetter
            },
            p30_004:{
              maxlength: limitNum10 + limitLetter
            },
            p30_005:{
              maxlength: limitNum254+ limitLetter
            },
            p30_006:{
              maxlength: limitNum254 + limitLetter
            },
            c23_001:{
              maxlength: limitNum5 + limitLetter
            },
            c23_002:{
              maxlength: limitNum1 + limitLetter
            },
            c23_003:{
              maxlength: limitNum4 + limitLetter
            },
            c23_004:{
              maxlength: limitNum46 + limitLetter
            },
            c23_005:{
              maxlength: limitNum1 + limitLetter
            },
            c23_006:{
              maxlength: limitNum10 + limitLetter
            },
            c23_007: {
              maxlength : limitNum5 + limitLetter
            },
          },
        });
      }
    } 
    catch(e) {

      console.error(e);
      return;
    }  
  });
});

//　画面ロード時　実行処理
window.onload = () => {

  Main();
  
}