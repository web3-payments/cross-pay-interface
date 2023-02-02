require('dotenv').config()

const dev = {
    serverUrl:  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
    contextRoot: process.env.REACT_APP_API_CONTEXT_ROOT || '/api/v1'
}

const prod = {
    serverUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
    contextRoot: process.env.REACT_APP_API_CONTEXT_ROOT || 'http://localhost:8080/api/v1'
}

console.log(process.env.NODE_ENV);

const config = process.env.NODE_ENV === "production" ? prod : dev;

module.exports = { config };