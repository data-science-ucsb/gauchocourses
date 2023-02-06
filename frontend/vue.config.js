// const proxy_url = 'http://alphagauchocourses-staging.azurewebsites.net';
const proxy_url = 'http://localhost:8088';

// vue.config.js
module.exports = {
  devServer: {
    host: 'localhost',
    port: 8080,
    proxy: {
      /* When on the dev server, this will proxy requests to the Spring Boot backend.
      The port needs to match server.port on application-dev.properties. (https://cli.vuejs.org/config/#devserver-proxy) */
      '/remote': {
        target: proxy_url,
        ws: true,
        changeOrigin: true
      },
      '/oauth2/authorization/google': {
        target: proxy_url,
        changeOrigin: true
      },
      '/logout': {
        target: proxy_url,
        changeOrigin: true
      },
      '/api': {
        target: proxy_url,
        ws: true,
        changeOrigin: true
      },
      '/students': {
        target: proxy_url,
        ws: true,
        changeOrigin: true
      }
    }
  },

  // Change build paths to make them Maven compatible (https://cli.vuejs.org/config/)
  outputDir: 'target/dist',
  assetsDir: 'static'
};
