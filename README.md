[![Build Status](https://travis-ci.org/naciriii/lambda-etl.svg?branch=master)](https://travis-ci.org/naciriii/lambda-etl)
# lambda-etl
This module is using along with aws lambda / Serverless Framework to perform ETL
## How Does It Work?
This module provide an extendable abstract class, thus the child class will override some of the provided method:

```getImportHandler()```

 Which handle result data after parsing and processing line (persisting to database for example).

  and

```getLineProcessorCallback()```

 Which handle the logic how to process each line after parsing (adapting result to DTO, or transform data before passing to the handler).

