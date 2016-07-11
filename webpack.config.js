var path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './src/main',
  output: {
    path: './dist',
    filename: 'kodiak.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        },
        include: path.join(__dirname, 'src'),
        explude: /node_modules/
      }
    ]
  }
};
