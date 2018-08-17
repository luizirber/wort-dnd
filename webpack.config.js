const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./index.js",
  plugins: [
    new HtmlWebpackPlugin({
      title: 'wort DnD'
    })
  ],
  module: {
    rules: [
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {test: /\.wasm$/, type: 'webassembly/experimental'},
      {test: /\.svg$/, loader: 'svg-inline-loader'}
    ]
  },
  output: {
    path: path.resolve(__dirname, "dist-ipfs"),
    filename: "index.js",
  },
  node: {
    zlib: true
  },
  mode: "development",
  target: "web"
};