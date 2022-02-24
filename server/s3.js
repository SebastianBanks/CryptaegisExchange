require('dotenv').config()
const fs = require('fs')
const AWS = require('aws-sdk')

const uuid = require("uuid").v4

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

// const params = {
//     "credentials": {
//         "accessKeyId": process.env.AWS_ACCESS_KEY,
//         "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY
//     },
//     "acl": "public-read",
//     "endpoint": "s3.us-west-2.amazonaws.com",
//     "sslEnabled": false,
//     "forcePathStyle": true,
//     "signitureVersion": "v4"
// }

const s3 = new AWS.S3({
    region: region,
    apiVersion: '2006-03-01',
    //endpoint: "http://localhost:3000",
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    // sslEnabled: false,
    forcePathStyle: true,
    signatureVersion: "v4"
})
// const s3 = new AWS (params)

module.exports.generateImageURL = async function generateImageURL() {
    const imgName = `${uuid()}`
    console.log(imgName)

    const params = ({
        Bucket: bucketName,
        Key: imgName,
        Expires: 5
    })

    console.log(params)


    
    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    console.log(`uploadUrl: ${uploadURL}`)
    return uploadURL
}

 
