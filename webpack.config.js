const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './bootstrap.js',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'wort DnD'
    })
  ],
  module: {
    rules: [
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {test: /\.wasm$/, type: 'webassembly/experimental'}
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bootstrap.js'
  },
  mode: 'development'
}
