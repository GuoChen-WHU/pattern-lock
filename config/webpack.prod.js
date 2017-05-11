var path = require('path');
var webpack = require('webpack');

var rootPath = path.resolve(__dirname, '..');

module.exports = {
  entry: {
    app: path.join(rootPath, 'pattern-lock.js')
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  output: {
    path: rootPath,
    filename: 'pattern-lock.min.js'
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
