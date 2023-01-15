const withPlugins = require("next-compose-plugins"); 
const withCSS = require("@zeit/next-css");
// const optimizedImages = require('next-optimized-images');
// const withImages = require('next-images');

module.exports = withPlugins(
  [
    //withCSS
    withCSS,
  ],
  {
    webpack(config, options) {
      config.module.rules.push({
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 800000,
          },
        },
      });
      return config;
    },
    webpack5: false,
  }
);
