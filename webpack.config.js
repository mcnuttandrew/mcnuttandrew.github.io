// const {resolve} = require('path');
const isProd = process.env.NODE_ENV === 'production'; // eslint-disable-line
// const path = require('path');
const webpack = require('webpack');

const entry = {
  app: './src/app.js'
};

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new webpack.optimize.UglifyJsPlugin()
];

const moduleConfig = {
  rules: [
    {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader',
        'autoprefixer-loader'
      ]
    },
    {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [/node_modules/],
      query: {
        presets: ['es2017']
      }
    },
    {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'file-loader?name=public/fonts/[name].[ext]'
    }
  ]
};

const prodConfig = {
  entry,
  module: moduleConfig,
  output: {
    filename: 'bundle.js'
  },
  plugins
};

const devConfig = {
  entry,
  module: moduleConfig,
  devServer: {
    stats: {
      warnings: false
    }
  },
  output: {
    filename: 'bundle.js'
  },

  devtool: 'source-maps'
};

module.exports = isProd ? prodConfig : devConfig;
