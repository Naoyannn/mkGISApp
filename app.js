// 1. expressモジュールをロードし、インスタンス化してappに代入。
var express = require("express");
const bodyParser = require('body-parser');
var app = express();
var {Client} = require('pg');

var client = new Client({
    database: "gisdb",
    user: "postgres",
    password: "53320706",
    host: "localhost",
    port: 5433,
});

// pathモジュールをロードし、pathに代入
const path = require('path');
const e = require("express");

// 2-1. listen()メソッドを実行して1234番ポートで待ち受け。
var server = app.listen(1234, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

// 2-2. 1234番ポートに接続したらpublicフォルダの内容を公開する。
app.use(express.static(path.join(__dirname, 'public')));

client.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    } else {

        console.log('Postgress connect success');

        var q ='SELECT n03_004 FROM "n03-200101_27-g_administrativeboundary" WHERE gid = 1';
        client.query(q, function (err, result) {

            console.log(result); //コンソール上での確認用なため、この1文は必須ではない。
            client.end();
        });

    }
    
    
});



//Ajax-1
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.post("/", (req, res) => {


    var str = req.body;
    
    // pgPool.connect( function(err, client) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       client.query('SELECT n03_001 FROM n03-200101_27-g_administrativeboundary', function (err, result) {

    //         console.log(result); //コンソール上での確認用なため、この1文は必須ではない。
    //         client.end();
    //       });
    //     }
    // });

    res.send(str);

});