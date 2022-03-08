require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')
const { SERVER_PORT } = process.env
const { createItem, createUser, getAllItems, getItemImage, getFilteredItems, getUrlLink, 
        coinbaseCallback, getCoinbaseAccount, coinbaseTransaction, getFormData,
        returnIsSignedIn, getItemInfo, getCurrentUser, returnItemOwner, editItem, deleteItem, 
        addImages } = require('./controller.js')
const {seed} = require('./seed.js')
const { generateImageURL } = require("./s3.js")

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));
app.use(cors())

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/index.html'))
})
app.get('/signUp', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/signUp.html'))
})

app.get('/itemPage', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/item.html'))
})

app.get('/s3URL', async (req, res) => {
    console.log('works')
    const url = await generateImageURL()
    console.log({url})
    res.status(200).send({url})
})
app.get('/items', getAllItems)
app.get('/getItemImage/:id', getItemImage)
app.get('/getFilteredItems', getFilteredItems)
app.get('/isSignedIn', returnIsSignedIn)
app.get('/itemPage/:id', getItemInfo)
app.get('/getCurrentUser', getCurrentUser)
app.get('/getItemOwner/:id', returnItemOwner)
app.post('/createItem', createItem)
app.post(`/createUser`, createUser)
app.post('/addImages', addImages)
app.put("/editItem", editItem)
app.delete("/deleteItem/:id", deleteItem)


// COINBASE ----------------------------------

app.get('/getLink', getUrlLink)
app.get("/callback", coinbaseCallback)

app.get("/account", getCoinbaseAccount)
app.get("/transferMoney", coinbaseTransaction)
app.get("/getFormData", getFormData)

// --------------------------------------------------------------------

app.use(express.static(path.join(__dirname, '../client')))


// Dev 
// app.post(`/seed`, seed)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Online - ${port}`))