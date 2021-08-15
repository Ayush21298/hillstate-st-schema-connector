require('dotenv').config()

const http = require('http')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const hostname = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

const app = express()

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const server = http.createServer(app)

server.listen(port, hostname, () => {
console.log(`Server running at http://${hostname}:${port}/`)
})
