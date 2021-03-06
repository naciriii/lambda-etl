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
After Setting up aws credentials 
```js
export AWS_ACCESS_KEY_ID="Your AWS Access Key ID"
export AWS_SECRET_ACCESS_KEY="Your AWS Secret Access Key"
export AWS_REGION="us-east-1"
```

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
   * @param {Object} file file to import
   * Initialize ETL process based on ImportTrack Model or whatever
   */
  async init(file) {
    /**
     * Initialize a new Row with file information and start time
     */
    return this.ImportModel.create({fileSize: file.size, filname: file.name, startedAt: Date.now()})
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

   /**
   * @param {Object} status result status of etl process
   * Initialize ETL process based on ImportTrack Model or whatever
   */
  async finish(status) {
    /**
     * Update DB ETL track row and mark as finished and log errors number 
     * if any
     */ 
    return this.ImportModel.update({finishedAt: Date.now(), errors: status.errors})
  }
}
```
#### Usage
```js
let importService = new MyCustomImportService(new MyImportTrackModel())
let bucketName = "uploads"
let filname = "data.json"
importService.importData(bucketName, filename)
```




