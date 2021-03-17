// 1. expressモジュールをロードし、インスタンス化してappに代入。
var express = require("express");
const bodyParser = require('body-parser');
var app = express();
var {Client} = require('pg');


// pathモジュールをロードし、pathに代入
const path = require('path');
const e = require("express");

// 2-1. listen()メソッドを実行して1234番ポートで待ち受け。
var server = app.listen(1234, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

// 2-2. 1234番ポートに接続したらpublicフォルダの内容を公開する。
app.use(express.static(path.join(__dirname, 'public')));

//Ajax-1
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000000 }));

app.post("/savefeature", (req, res) => {

    var client = new Client({
        database: "gisdb",
        user: "postgres",
        password: "53320706",
        host: "localhost",
        port: 5433,
    });

    var str = req.body;

    let tableName = str.tableName;
    let gid = str.gid;
    
    var query = "";
    var queryAll;
    
    for (const [key, value] of Object.entries(str)) {
        if(key != "tableName" && key != "gid"){
            if(value != "" && value != null && typeof(value) == "string"){
                    
                if(query == ""){
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
    
    console.log(queryAll);
    client.connect((err) => {
        if (err) {
            console.log('error connecting: ' + err.stack);
            return;
        } else {
            client.query(queryAll, function (err, result) {
            
                client.end();
                console.log("Update success");
                res.send(str);
            
            });
        }
    });
});

app.post("/delete", (req, res) => {

    var client = new Client({
        database: "gisdb",
        user: "postgres",
        password: "53320706",
        host: "localhost",
        port: 5433,
    });

    var str = req.body;
    let tableName = str.tableName;
    let gid = str.gid;

    console.log(tableName);
    console.log(gid);

    query = "DELETE FROM " + "\"" + tableName + "\"" + "WHERE gid = " + gid;

    console.log("delete");

    console.log(query);
    client.connect((err) => {
        if (err) {
            console.log('error connecting: ' + err.stack);
            return;
        } else {
            client.query(query, function (err, result) {
            
                client.end();
                console.log("Delete success");
                res.send(str);
            
            });
        }
    });



});