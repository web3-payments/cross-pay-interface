const dev = {
    serverUrl: "http://localhost:8080",
    contextRoot: "/api/v1"
}

const prod = {
    serverUrl: "http://localhost:8080",
    contextRoot: "/api/v1"
}

console.log(process.env.NODE_ENV);

const config = process.env.NODE_ENV === "production" ? prod : dev;

module.exports = { config };