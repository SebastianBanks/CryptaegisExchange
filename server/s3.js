require('dotenv').config
const fs = require('fs')
const AWS = require('aws-sdk')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECURITY_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

module.exports = {
    imageUpload: (file) => {
        const fileContent = fs.readFileSync(file)

        const params = {
            Bucket: bucketName,
            Body: 'cat.jpg', // what you want to save in S3
            Key: fileContent
        }

        return s3.upload(params).promise()
    }
}