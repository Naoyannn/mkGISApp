// 1. expressモジュールをロードし、インスタンス化してappに代入。
var express = require("express");
var app = express();
var {Client} = require('pg');

// pathモジュールをロードし、pathに代入
const path = require('path');
const { error } = require("console");
const { nextTick } = require("process");
const e = require("express");

// 2-1. listen()メソッドを実行して1234番ポートで待ち受け。
var server = app.listen(1234, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000000 }));

// 2-2. 1234番ポートに接続したらpublicフォルダの内容を公開する。
app.use(express.static(path.join(__dirname, 'public')));

// エラーポップアップ入力
var errorText;

//　属性情報登録処理
app.post("/savefeature", (req, res) => {

    try{
        var ope = "update"

        connectServer(ope, req, res);

    }
    catch(next){

        res.send(next) ;

    }
});

//　図形削除処理
app.post("/delete", (req, res) => {

    try{
        var ope = "delete"

        connectServer(ope, req, res);

    }
    catch(e){

        res.send(next) ;

    }
});

// サーバー通信メソッド
function connectServer(ope, req, res){

    try{

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

            query = makeUpdateSql(str, gid, tableName)
            connect(str, res, query);

        } else if(ope == "delete"){

            query = makeDeleteSql(gid, tableName);
            connect(str, res, query);

        }
    } catch(e) {

        if(errorText == null ||errorText ==""){

            errorText = "サーバー通信に失敗しました";

        }
        throw(errorText);
    }
}

function makeUpdateSql(str, gid, tableName){
    
    var makingQuery;
    var queryAll;
    
    try{
        // クエリ作成　結合
        for (const [key, value] of Object.entries(str)) {
        
            resitCharNumLimit(key, value);

            if(key != "tableName" && key != "gid"){
                if(value != "" && value != null && typeof(value) == "string"){
                        
                    if(makingQuery == null){
                        makingQuery = "SET " + key + "=" + "'" + value + "'"; 
                    } else {
                        makingQuery = makingQuery + ", " + key + "=" + "'" + value + "'"; 
                    } 
                }
            }
        }

    if(makingQuery == ""){
        throw new Error("クエリの作成に失敗しました")
    }
    
    queryAll = "UPDATE " + "\"" + tableName + "\"" + makingQuery + "WHERE gid = " + gid;

    return queryAll;

    }
    catch(e){

        if(errorText == null ||errorText ==""){

            errorText = "クエリの作成に失敗しました";

        }
        throw(errorText);
    }
}

function makeDeleteSql(gid, tableName){
    
    try{
        var queryAll;

        queryAll = "DELETE FROM " + "\"" + tableName + "\"" + "WHERE gid = " + gid;
        return queryAll;

    }
    catch{
        if(errorText == null ||errorText ==""){

            errorText = "クエリの作成に失敗しました";

        }
        throw(errorText);
    }
}

//　サーバー通信実施処理
function connect(str, res, query){

    try{

        // サーバー
        var client = new Client({
            database: "gisdb",
            user: "postgres",
            password: "53320706",
            host: "localhost",
            port: 5433,
        });    

        client.connect((err) => {
            if (err) {
                console.log('error connecting: ' + err.stack);
                throw new Error("SQLの通信に失敗しました")
            } else {
                client.query(query, function (err, result) {
                    if(err){
                        console.log('error connecting: ' + err.stack);
                        throw new Error("クエリの実行に失敗しました")
                    }
                    client.end();
                    res.send(str);
                });
            }
        });
    }

    catch(e){

        if(errorText == null ||errorText ==""){

            errorText = "サーバー通信実施に失敗しました";

        }
        throw(errorText);
    }
}

// 登録文字数　バリデーション
function resitCharNumLimit(key, value){

    try{

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
    
        } else if(key == "p30_001" && value.length > 10) {
            throw(e);

        } else if(key == "p30_002" && value.length > 10) {
            throw(e);

        } else if(key == "p30_003" && value.length > 10) {
            throw(e);
    
        } else if(key == "p30_004" && value.length > 10) {
            throw(e);
    
        } else if(key == "p30_005" && value.length > 254) {
            throw(e);
    
        } else if(key == "p30_006" && value.length > 254) {
            throw(e);
    
        } else if(key == "c23_001" && value.length > 5) {
            throw(e);
    
        } else if(key == "c23_002" && value.length > 1) {
            throw(e);
    
        } else if(key == "c23_003" && value.length > 4) {
            throw(e);
    
        } else if(key == "c23_004" && value.length > 46) {
            throw(e);
    
        } else if(key == "c23_005" && value.length > 1) {
            throw(e);
    
        } else if(key == "c23_006" && value.length > 10) {
            throw(e);
    
        } else if(key == "c23_007" && value.length > 5) {
            throw(e);
    
        }

    }
    catch(e){

        if(errorText == null ||errorText ==""){

            errorText = "入力文字数が制限をこえています"

        }
        throw(errorText);
    } 
}