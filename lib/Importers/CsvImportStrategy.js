const AWS = require('aws-sdk')
const s3 = new AWS.S3()
var lambda = new AWS.Lambda()
const parse = require('csv-parser')
const through2 = require('through2')

module.exports = class CsvImportStrategy {
  /**
   * Handle data extraction from file
   * Create a read stream of csv file format
   * Process chunk by chunk through parser each line is a js object
   * Delegate persisting to handler lamba
   * @param {String} bucket
   * @param {String} key
   * @param {Function} lineProcessorCallback
   * @param {String} handler
   */
  import (bucket, key, lineProcessorCallback, handler) {
    return new Promise(resolve => {
      const options = {
        columns: true,
        auto_parse: true,
        escape: '',
        trim: true
      }
      var parser = parse(options)

      s3.getObject({ Bucket: bucket, Key: key })
        .createReadStream()
        .pipe(parser)
        .pipe(
          through2.obj(function (chunk, enc, cb) {
            const event = lineProcessorCallback(chunk)
            var params = {
              FunctionName: handler,
              InvocationType: 'Event',
              Payload: JSON.stringify(event)
            }

            lambda.invoke(params, (err, res) => {
              if (err) {
                console.log('Lambda invoke error', err)
              }
              this.push(chunk)
              cb()
            })
          })
        )
        .on('data', data => {})
        .on('end', () => {
          resolve('finished CSV')
        })
    })
  }
}
