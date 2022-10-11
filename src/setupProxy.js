const {createProxyMiddleware} =  require("http-proxy-middleware");

const {config} = require("../src/config");

const proxy = {
    target: config.serverUrl,
    changeOrigin: true,
};

module.exports = function (app) {
    app.use(["/api/**"], createProxyMiddleware(proxy));
}