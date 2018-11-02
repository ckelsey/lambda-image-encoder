const Sharp = require('sharp')
const path = require('path')

const getBuffer = require('./getBuffer')
const getMeta = require('./getMeta')
const uploadToS3 = require('./uploadToS3')
const validator = require('./validator')
const variants = require('./variants')
const ERROR = require('./error')

const defaultOptions = [
    {
        "quality": 70,
        "max": 8192,
        "format": "jpg",
        "prefix": "large"
    },
    {
        "quality": 60,
        "scale": 0.3,
        "format": "jpg",
        "prefix": "small"
    },
    {
        "quality": 60,
        "width": 400,
        "format": "jpg",
        "prefix": "thumb",
        "normalize": true
    }
]

exports.handler = (event, context, callback) => {

    event.imageData = {}
    event.imageOptions = event.imageOptions || defaultOptions

    try {
        event.imageOptions = JSON.parse(event.imageOptions)
    } catch (error) { }

    console.log("IMAGE URL", event.imageUrl)
    console.log("IMAGE OPTIONS", event.imageOptions)

    function finish(status, body) {
        let message = {
            "isBase64Encoded": false,
            "statusCode": status,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-type": "application/json"
            },
            "body": typeof body === `string` ? body : JSON.stringify(body)
        }

        let error = status === 200 ? null : typeof body === `string` ? body : JSON.stringify(body)
        let resp = status !== 200 ? null : message

        return callback(error, resp)
    }

    const run = (imageBuffer) => {
        event.imageData.buffer = imageBuffer

        Sharp(event.imageData.buffer)
            .metadata()
            .then(meta => {
                getMeta(meta, event.imageData.buffer)
                    .then((res) => {
                        console.log('IMAGE METADATA', res)
                        
                        event.imageData.meta = res

                        if (!validator(event.imageData.meta.exif)) {
                            finish(400, {
                                success: false,
                                message: `No Ansel metadata`,
                                results: event
                            })
                        }

                        variants(event)
                            .then(results => {
                                let urls = []
                                
                                if (process.env.LOCALDEV) {
                                    return callback(results)
                                }

                                results.imageOptions.forEach((option) => {
                                    uploadToS3(option)
                                        .then(url => {
                                            urls.push(url)

                                            if (urls.length === results.imageOptions.length) {
                                                return finish(200, urls)
                                            }
                                        })
                                        .catch(error => finish(500, ERROR(error)))
                                })

                            })
                            .catch(error => finish(500, ERROR(error)))
                    })
                    .catch(error => finish(500, ERROR(error)))

            })
            .catch(error => finish(500, ERROR(error)))
    }

    if (!event.imageUrl) {
        return finish(400, `no image url`)
    }

    try {
        let filename = path.basename(event.imageUrl)
        let ext = path.extname(event.imageUrl)

        filename = filename.split(ext)[0]
        event.imageData.filename = filename

        getBuffer(event.imageUrl)
            .then(buffer => run(buffer))
            .catch(error => finish(500, ERROR(error)))

    } catch (error) {
        return finish(500, ERROR(error))
    }
};