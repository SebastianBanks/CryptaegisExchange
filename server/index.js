require('dotenv').config()
const express = require('../node_modules/express')
const app = express()
const cors = require('../node_modules/cors')
const {SERVER_PORT} = process.env
const {} = require('./controller.js')
const {seed} = require('./seed.js')

const multer = require('multer')
const upload = multer({dest: "uploads/"})
const { s3, generateImageURL, uploadFile } = require("./s3.js")



app.use(express.json())
app.use(cors())

app.get('/s3URL', (req, res) => {
    const url = generateImageURL()
    console.log(url)
    res.status(200).send(url)
})

app.post('image', upload.single("image"), async (req, res) => {
    console.log(req.file)

    const result = uploadFile(req.file)
    console.log(result)

    res.send({
        status: "success",
        message: "File uploaded successfully",
        data: req.file,
      })
})



// Dev 
//app.post(`/seed`, seed)

app.listen(SERVER_PORT, () => console.log(`${SERVER_PORT}`))