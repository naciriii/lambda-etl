const CsvStrategy = require('./Importers/CsvImportStrategy')
const JsonStrategy = require('./Importers/JsonImportStrategy')

module.exports = class AbstractImportService {
  constructor () {
    if (this.constructor === AbstractImportService) {
      throw new Error('cannot instanciate Abstract class')
    }
  }

  /**
   * Factory method to return import handler (callback or function to execute with the result data)
   * Method to execute after extracting each row of the imported file
   * Return handler to delegate processing and loading to dynamodb after getting line
   * from csv/json
   */
  getImportHandler () {}

  /**
   * Factory method to get overrided by child classes based on customized logic
   * Returns Event body how to process each line from csv/json
   * Based on data extraction result, describe how each data type should be processed
   * Usually to commonize the data in order to load to ddb later
   * @param {String} extension
   */
  getLineProcessorCallback (extension) {}

  /**
   *
   * @param {String} type
   * Return the strategy of processing imported file either csv or json
   * Stream the file and process line by line through JSON/CSV parser
   */
  getStrategy (type) {
    let strategy
    switch (type) {
      case 'csv':
        strategy = new CsvStrategy()
        break
      case 'json':
        strategy = new JsonStrategy()
        break
    }
    return strategy
  }

  /**
 *
 * @param {String} bucket
 * @param {String} key
 * Template Method that respresents the algorithm /steps to follow
 * to perform ETL
 * 1- Extract
 * 2- Transform
 * 3- Load
 */
  importData (bucket, key) {
    const strategy = this.getStrategy(key.split('.')[1].trim())
    const handler = this.getImportHandler()
    const lineProcessorCallback = this.getLineProcessorCallback(key.split('.')[1].trim())
    const res = strategy.import(bucket, key, lineProcessorCallback, handler)
    return res
  }
}
