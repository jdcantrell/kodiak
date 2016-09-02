var path = require('path');

module.exports = {
  entry: {
    'static/js/edit': './src/edit',
    'static/themes/simple/simple': './static/themes/simple/src/simple',
  },
  output: {
    path: './',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel',
        include: [
          path.join(__dirname, 'src'),
          path.join(__dirname, 'static/themes'),
        ],
        exclude: /node_modules/
      }
    ]
  }
};
