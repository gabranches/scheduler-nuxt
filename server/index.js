const express = require('express')
const consola = require('consola')
require('dotenv').config()
const { Nuxt, Builder } = require('nuxt')
const app = express()
var cors = require('cors')
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Enable CORS
  // app.use(cors())
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    arrayOfValidOrigins = [
      'http://localhost:3000'
    ]
    // In case you want to accept requests from everywhere, set:
    // res.setHeader('Access-Control-Allow-Origin', '*');
    if (arrayOfValidOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // Here allow all the HTTP methods you want
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,HEAD,PUT,OPTIONS');
    // Here you allow the headers for the HTTP requests to your server
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
