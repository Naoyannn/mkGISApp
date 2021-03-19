// 1. expressモジュールをロードし、インスタンス化してappに代入。
var express = require("express");
const bodyParser = require('body-parser');
var app = express();
var {Client} = require('pg');
var client;

// pathモジュールをロードし、pathに代入
const path = require('path');
const e = require("express");

// 2-1. listen()メソッドを実行して1234番ポートで待ち受け。
var server = app.listen(1234, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000000 }));

// 2-2. 1234番ポートに接続したらpublicフォルダの内容を公開する。
app.use(express.static(path.join(__dirname, 'public')));


//　属性情報登録処理
app.post("/savefeature", (req, res) => {

    var ope = "update"
    connectServer(ope, req, res);
});


//　図形削除処理
app.post("/delete", (req, res) => {

    var ope = "delete"
    connectServer(ope, req, res);

});


// サーバー通信メソッド
function connectServer(ope, req, res){

    // サーバー
    client = new Client({
        database: "gisdb",
        user: "postgres",
        password: "53320706",
        host: "localhost",
        port: 5433,
    });

    // 受信データ
    var str = req.body;
    
    //　接続テーブル名取得
    let tableName = str.tableName;

    //　データユニークID
    let gid = str.gid;

    // SQLクエリ
    var query;

    if(ope == "update"){

        //結合済みクエリ
        var queryAll;

        // クエリ作成　結合
        for (const [key, value] of Object.entries(str)) {
           
            resitCharNumLimit(key, value);
    
            if(key != "tableName" && key != "gid"){
                if(value != "" && value != null && typeof(value) == "string"){
                        
                    if(query == null){
                        query = "SET " + key + "=" + "'" + value + "'"; 
                    } else {
                        query = query + ", " + key + "=" + "'" + value + "'"; 
                    } 
                }
            }
        }
    
        if(query == ""){
            return;
        }
        
        queryAll = "UPDATE " + "\"" + tableName + "\"" + query + "WHERE gid = " + gid;

        connect(str, res, queryAll);

    } else if(ope == "delete"){

        query = "DELETE FROM " + "\"" + tableName + "\"" + "WHERE gid = " + gid;
        connect(str, res, query);

    }
}

//　サーバー通信実施処理
function connect(str, res, query){
    console.log(query);
    client.connect((err) => {
        if (err) {
            console.log('error connecting: ' + err.stack);
            return;
        } else {
            client.query(query, function (err, result) {
                client.end();
                res.send(str);
            });
        }
    });
    
}


// 登録文字数　バリデーション
function resitCharNumLimit(key, value){

    if(key == "n03_001" && value.length > 8){
    
        throw(e);
    } else if(key == "n03_002" && value.length > 10) {
        throw(e);

    } else if(key == "n03_003" && value.length > 10) {
        throw(e);

    } else if(key == "n03_004" && value.length > 14) {
        throw(e);

    } else if(key == "n03_005" && value.length > 10) {
        throw(e);

    } else if(key == "n03_006" && value.length > 10) {
        throw(e);

    } else if(key == "n03_007" && value.length > 5) {
        throw(e);

    }

}