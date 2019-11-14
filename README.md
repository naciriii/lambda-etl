[![Build Status](https://travis-ci.org/naciriii/lambda-etl.svg?branch=master)](https://travis-ci.org/naciriii/lambda-etl)
# lambda-etl
This module is used along with aws lambda / Serverless Framework to perform ETL
## How Does It Work?
This module provide an extendable abstract class, thus the child class will override some of the provided methods:

``` getImportHandler() ```

 Which handle result data after parsing and processing line (persisting to database for example).

``` getLineProcessorCallback() ```

 Which handle the logic how to process each line after parsing (adapting result to DTO, or transform data before passing to the handler).

 ## Getting Started

### Installation

    $ npm i lambda-etl

### Example
#### Initialization
```js
const AbstractImportService = require('lambda-etl')

class MyCustomImportService extends AbstractImportService {
  /**
     * @returns {String} Lambda ARN  or Lambda FullName
     */
  getImportHandler () {
    return 'MyServerlessMsa-devStage-handlePersistRowToDb'
  }

  /**
   * @returns {Function} Parsed File line transformation and formatting
   */
  getLineProcessorCallback (extension) {
    if (extension === 'json') {
      // create custom http event for json files for example
      return function createHttpEvent (parsedChunk) {
        return {
          body: parsedChunk.data,
          pathParameters: { id: parsedChunk.id }

        }
      }
    }
    return function defaultEvent (parsedChunk) {
      return {
        body: parsedChunk
      }
    }
  }
}
```
#### Usage
```js
let importService = new MyCustomImportService()
let bucketName = "uploads"
let filname = "data.json"
importService.importData(bucketName, filename))
```




