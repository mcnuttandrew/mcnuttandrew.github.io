module.exports = {
  entry: {
    app: './src/app.js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        query: {
          presets: ['es2017']
        }
      }
    ]
  },
  output: {
    filename: 'bundle.js'
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'  // eslint-disable-line
};
