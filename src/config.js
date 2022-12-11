const dev = {
    serverUrl: "http://ec2-52-47-173-175.eu-west-3.compute.amazonaws.com:8080",
    contextRoot: "/api/v1"
}

const prod = {
    serverUrl: "http://localhost:8080",
    contextRoot: "/api/v1"
}

console.log(process.env.NODE_ENV);

const config = process.env.NODE_ENV === "production" ? prod : dev;

module.exports = { config };