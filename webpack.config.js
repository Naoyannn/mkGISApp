const path = require('path');

module.exports = {
    entry: ['@babel/polyfill', __dirname + "/src/js/index.js"], //ビルドするファイル
    output: {
        filename: 'testy.js', //ビルドした後のファイル名
        path: path.join(__dirname, '/public/js') //ビルドしたファイルを吐き出す場所
    },
    module: {
        rules: [
            // {
            //   test: ビルド対象のファイルを指定
            //   includes: ビルド対象に含めるファイルを指定
            //   exclude: ビルド対象に除外するファイルを指定
            //   loader: loaderを指定
            //   query: loader に渡したいクエリパラメータを指定
            // },
            {
                // test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query://loaderに渡したいクエリパラメータを指定します
                {
                    presets: ["@babel/preset-env"]
                }
            }
        ]
    }
};