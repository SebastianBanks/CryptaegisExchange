require('dotenv').config()
const express = require('../node_modules/express')
const app = express()
const cors = require('../node_modules/cors')
const {SERVER_PORT} = process.env
const { createItem, createUser, getAllItems, getItemImage } = require('./controller.js')
const {seed} = require('./seed.js')

const { generateImageURL } = require("./s3.js")

app.use(express.json())
app.use(express.static('front'))
app.use(cors())

app.get('/s3URL', async (req, res) => {
    console.log('works')
    const url = await generateImageURL()
    console.log({url})
    res.status(200).send({url})
})
app.get('/items', getAllItems)
app.get('/getItemImage/:id', getItemImage)

app.post('/createItem', createItem)
app.post(`/createUser`, createUser)






// Dev 
//app.post(`/seed`, seed)

app.listen(SERVER_PORT, () => console.log(`${SERVER_PORT}`))