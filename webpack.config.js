const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let config = {
  devServer:
    {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 3000
    },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }]
  }
};

let templateConfig = Object.assign({}, config, {
  entry: './src/wrapper.js',
  output: {
    libraryTarget: 'var',
    library: 'showAppTemplate',
    path: path.resolve(__dirname, 'dist'),
    filename: 'app-template.js',
  }
});
let standaloneConfig = Object.assign({}, config, {
  entry: './src/index.jsx',
  output:
    {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
  plugins: [new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: 'index.html',
    inject: 'body'
  })]
});

// Return Array of Configurations
module.exports = [
  templateConfig, standaloneConfig,
];