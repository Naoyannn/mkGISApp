// 1. expressモジュールをロードし、インスタンス化してappに代入。
var express = require("express");
var app = express();

// pathモジュールをロードし、pathに代入
const path = require('path');

// 2-1. listen()メソッドを実行して1234番ポートで待ち受け。
var server = app.listen(1234, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

// 2-2. 1234番ポートに接続したらpublicフォルダの内容を公開する。
app.use(express.static(path.join(__dirname, 'public')));