require('../node_modules/dotenv').config()
const express = require('../node_modules/express')
const app = express()
const cors = require('../node_modules/cors')
const {SERVER_PORT} = process.env
const {} = require('./controller.js')
const {seed} = require('./seed.js')
const {} = require('./s3.js')

app.use(express.json())
app.use(cors())

// Dev 
//app.post(`/seed`, seed)

app.listen(SERVER_PORT, () => console.log(`${SERVER_PORT}`))