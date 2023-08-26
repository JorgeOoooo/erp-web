const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");

function resolve(dir) {
  return path.join(__dirname, dir);
}

// vue.config.js
module.exports = {
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  configureWebpack: (config) => {
    // 生产环境取消 console.log
    if (process.env.NODE_ENV === "production") {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
    }
    config.performance = {
      //入口起点的最大体积
      maxEntrypointSize: 50000000,
      //生成文件的最大体积
      maxAssetSize: 30000000,
    };
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set("@$", resolve("src"))
      .set("@api", resolve("src/api"))
      .set("@assets", resolve("src/assets"))
      .set("@comp", resolve("src/components"))
      .set("@views", resolve("src/views"));
    // 生产环境，开启js\css压缩
    if (process.env.NODE_ENV === "production") {
      config.plugin("compressionPlugin").use(
        new CompressionPlugin({
          test: /\.(js|css|less)$/, // 匹配文件名
          threshold: 10240, // 对超过10k的数据压缩
          deleteOriginalAssets: false, // 删除源文件
        })
      );
    }
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          "primary-color": "#1890FF",
          "link-color": "#1890FF",
          "border-radius-base": "4px",
        },
        javascriptEnabled: true,
      },
    },
  },
  devServer: {
    open: false,
    host: "0.0.0.0",
    port: 8000,
    hot: true,
    https: false,
    hotOnly: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    proxy: {
      "/jshERP-boot": {
        // target: "http://101.34.52.227:9999",
        target: "http://10.10.134.172:9999",
        secure: false,
        changeOrigin: true,
      },
    },
  },
  lintOnSave: undefined,
};
