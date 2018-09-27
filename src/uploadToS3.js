const AWS = require('aws-sdk')
const ERROR = require('./error')
const fs = require('fs')

function uploadToS3(option) {
    return new Promise((resolve, reject) => {
        try {
            const bucket = process.env.BUCKET_NAME
            let filepath = option.filepath

            if (!filepath) {
                let filename = `${option.prefix ? `${option.prefix}_` : ``}${option.name ? option.name : new Date().getTime()}`
                filepath = `${filename}.${option.format === `jpeg` ? `jpg` : option.format}`
            }

            if(process.env.LOCALDEV){
                fs.writeFileSync(filepath, option.buffer)
                return resolve(filepath)
            }

            let s3 = new AWS.S3({
                params: {
                    Bucket: bucket,
                    Key: filepath,
                    Body: option.buffer,
                    ContentType: `image/${option.format === `jpg` ? `jpeg` : option.format}`,
                    ContentLength: Buffer.byteLength(option.buffer, `binary`),
                    ACL: `public-read`
                },
                options: { partSize: 5 * 1024 * 1024, queueSize: 10 }   // 5 MB
            })

            s3.upload()
                .send(function (error, data) {
                    if (error) {
                        return reject(ERROR(error))
                    }

                    return resolve(data.Location)
                })
            
        } catch (error) {
            return reject(ERROR(error))
        }
    })
}

module.exports = uploadToS3