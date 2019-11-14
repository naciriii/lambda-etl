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
   * @param {String} key
   * @param {Function} lineProcessorCallback
   * @param {String} handler
   */
  import (bucket, key, lineProcessorCallback, handler) {
    return new Promise(resolve => {
      s3.getObject({
        Bucket: bucket,
        Key: key
      }).createReadStream()
        .pipe(streamArray.withParser())
        .pipe(
          through2.obj(function (chunk, enc, cb) {
            const event = lineProcessorCallback(chunk)
            var params = {
              FunctionName: 'slsApi-' + process.env.STAGE + '-' + handler,
              InvocationType: 'Event',
              Payload: JSON.stringify(event)
            }
            lambda.invoke(params, (err, res) => {
              if (err) {
                console.log('Lambda invoke error ', err)
              }
              this.push(chunk)
              cb()
            })
          }))
        .on('data', (data) => {
        })
        .on('end', () => {
          resolve('finished JSON')
        })
    })
  }
}
