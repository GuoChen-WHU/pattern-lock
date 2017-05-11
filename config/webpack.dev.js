var path = require('path');
var webpack = require('webpack');

var rootPath = path.resolve(__dirname, '..');

module.exports = {
  devtool: 'source-map',
  entry: [
    path.join(rootPath, 'pattern-lock.js'),
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:8080'
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  output: {
    path: rootPath,
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      exclude: '/node_modules/'
    }]
  }
};
