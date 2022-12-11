const {createProxyMiddleware} =  require("http-proxy-middleware");

const {config} = require("../src/config");

const proxy = {
    target: process.env.REACT_APP_AWS_URL,
    changeOrigin: true,
};

module.exports = function (app) {
    app.use(["/api/**"], createProxyMiddleware(proxy));
}