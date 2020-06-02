const AWS = require('aws-sdk')
const s3 = new AWS.S3()
var lambda = new AWS.Lambda()
const streamArray = require('stream-json/streamers/StreamArray')
const through2 = require('through2')

module.exports = class JsonImportStrategy {
  /**
   * Handle data extraction from file
   * Create a read stream of json array file format
   * Process chunk by chunk through parser where each line is a js object
   * Delegate persisting to handler lambda
   * @param {String} bucket
   * @param {Object} file
   * @param {Function} lineProcessorCallback
   * @param {String} handler
   */
  import (bucket, file, lineProcessorCallback, handler) {    
    return new Promise(resolve => {
      var numErrors = 0
      const obj = s3.getObject({
        Bucket: bucket,
        Key: file.key
      })
      obj.createReadStream()
        .pipe(streamArray.withParser())
        .pipe(
          through2.obj(function (chunk, enc, cb) {
            let event
            try {
              const result = lineProcessorCallback(chunk)
              event = result.event
            } catch (err) {
              console.warn('caught data malformed', err)
              numErrors++
            }

            var params = {
              FunctionName: handler,
              InvocationType: 'Event',
              Payload: JSON.stringify(event)
            }
            lambda.invoke(params, (err, res) => {
              if (err) {
                console.warn('json error', err)
                numErrors++
              }
              this.push(chunk)
              cb()
            })
          }))
        .on('data', (data) => {
        })
        .on('end', () => {
          resolve({ status: 'finished JSON', errors: numErrors })
        })
    })
  }
}
