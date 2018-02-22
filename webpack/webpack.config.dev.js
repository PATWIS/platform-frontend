const merge = require("webpack-merge");
const webpack = require("webpack");

const configCommon = require("./webpack.config.common");
const paths = require("./paths");

module.exports = merge(configCommon, {
  devServer: {
    contentBase: paths.dist,
    host: "localhost",
    port: 9090,
    https: true,
    hot: true,
    overlay: true,
    historyApiFallback: true,
    proxy: {
      "/node": {
        target: "http://localhost:8545",
        pathRewrite: { "^/node": "" },
      },
      "/api/signature": {
        target: "http://localhost:5000",
        pathRewrite: { "^/api/signature": "" },
      },
      "/api/wallet": {
        target: "http://localhost:5001",
        pathRewrite: { "^/api/wallet": "" },
      },
      "/api/user": {
        target: "http://localhost:5002",
        pathRewrite: { "^/api/user": "" },
      },
      "/api/kyc": {
        target: "http://localhost:5003",
        pathRewrite: { "^/api/kyc": "" },
      },
    },
  },
  entry: [
    "react-hot-loader/patch",
    "webpack-dev-server/client?http://localhost:9090",
    "webpack/hot/only-dev-server",
  ],
  plugins: [new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        // there is a lof of duplication with prod config but merge.smart fails
        // when using oneOf so for now we can leave it like this
        oneOf: [
          {
            test: /\.module.scss$/,
            use: [
              {
                loader: "style-loader",
              },
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1,
                  modules: true,
                  localIdentName: "[name]__[local]___[hash:base64:5]",
                  camelCase: "dashesOnly",
                },
              },
              { loader: "sass-loader" },
            ],
          },
          {
            test: /\.scss$/,
            use: [
              {
                loader: "style-loader",
              },
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1,
                  modules: false,
                  localIdentName: "[name]__[local]___[hash:base64:5]",
                  camelCase: "dashesOnly",
                },
              },
              { loader: "sass-loader" },
            ],
          },
          {
            test: /\.(tsx?)$/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  plugins: ["react-hot-loader/babel"],
                },
              },
              {
                loader: "awesome-typescript-loader",
                options: {
                  configFileName: "./tsconfig.dev.json",
                  useCache: true,
                },
              },
            ],
            include: paths.app,
          },
          {
            test: /\.(jpg|png|svg)$/,
            loader: "url-loader",
            options: {
              limit: 25000,
              publicPath: "/",
            },
          },
          {
            test: /\.(woff2|woff|ttf|eot|otf)$/,
            loader: "file-loader",
            options: {
              name: "fonts/[hash].[ext]",
            },
          },
        ],
      },
    ],
  },
});
