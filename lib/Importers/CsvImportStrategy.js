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
   * @param {Object} file
   * @param {Function} lineProcessorCallback
   * @param {String} handler
   */
  import (bucket, file, lineProcessorCallback, handler) {
    return new Promise(resolve => {
      const options = {
        columns: true,
        auto_parse: true,
        escape: '',
        trim: true
      }
      var parser = parse(options)
      var numErrors = 0
      var appId
      const obj = s3.getObject({ Bucket: bucket, Key: file.key })
      obj.createReadStream()
        .pipe(parser)
        .pipe(
          through2.obj(function (chunk, enc, cb) {
            let event
            try {
              const result = lineProcessorCallback(chunk)
              event = result.event
              appId = result.appId
            } catch (err) {
              console.warn('caught data malformed')
              numErrors++
            }
            var params = {
              FunctionName: handler,
              InvocationType: 'Event',
              Payload: JSON.stringify(event)
            }

            lambda.invoke(params, (err, res) => {
              if (err) {
                console.warn('csv error', err)
                numErrors++
              }
              this.push(chunk)
              cb()
            })
          })
        )
        .on('data', data => {})
        .on('end', () => {
          resolve({ status: 'finished CSV', errors: numErrors, appId: appId })
        })
    })
  }
}
