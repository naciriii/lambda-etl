const AbstractImportService = require('../../')
const chai = require('chai')
const sinon = require('sinon')
const assert = chai.assert
const AWS = require('aws-sdk')
const fs = require('fs')
const JsonStrategy = require('../../lib/Importers/JsonImportStrategy')


describe('Import Service test suite', function () {
  it('Should not be able to instanciate abstract class', function () {
    assert.Throw(function () {
      new AbstractImportService()
    }, Error, 'cannot instanciate Abstract class')
  })

  it('Should have extended methods', function() {
      let c = new class extends AbstractImportService {
      

      }
      assert.typeOf(c.getImportHandler, 'function')
      assert.typeOf(c.getLineProcessorCallback, 'function')
      assert.typeOf(c.getStrategy, 'function')
      assert.typeOf(c.importData, 'function')
      

  })
  it('Should call correct methods', async function() {
    this.timeout(5000)
    sinon.stub(AWS.Request.prototype, 'send').returns('done')
    sinon.stub(AWS.S3.prototype,'makeRequest').returns({
      createReadStream: () => {
        return fs.createReadStream('./test/fixtures/FakeJson.json')
      }
    })
    let lambdaStub= sinon.stub(AWS.Lambda.prototype,'makeRequest').callsFake(function(action, param, cb) {
      return cb(null,true)
    })


    let c = new class extends AbstractImportService {
      async init(file) {
        return true
        
      }
      async finish(res) {
        return res
      }
      getImportHandler() {
        return "FakeLambdaProcessor"
      }
      getLineProcessorCallback(extension) {
        return function (chunk) {
          return {event: {
            id: chunk.value.id
          }

          }
        }
      }
     
    

    }
      let getImportHandlerSpy = sinon.spy(c,'getImportHandler')
      let getLineProcessorCallbackSpy = sinon.spy(c,'getLineProcessorCallback')
      let getStrategySpy = sinon.spy(c,'getStrategy')
      let initStub = sinon.spy(c, 'init')
      let finishStub = sinon.spy(c, 'finish')

      
      let res = await c.importData("fakeBucket",{key: 'FakeKey.json',eTag: 'testKeyId', size: '500'})
      assert.isTrue(getStrategySpy.calledOnceWithExactly('json'))
      assert.isTrue(getImportHandlerSpy.called, "Import Handler Was not called")
      assert.isTrue(getLineProcessorCallbackSpy.calledOnceWithExactly('json'))
      assert.instanceOf(c.strategy, JsonStrategy, 'It doesn\'t select correct Strategy based on extension')
      
      assert.isTrue(initStub.called)
      assert.isTrue(finishStub.called)



  })
})
