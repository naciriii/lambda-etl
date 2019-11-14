const AbstractImportService = require('../../')
const chai = require('chai')
const sinon = require('sinon')
const assert = chai.assert

describe('Import Service test suite', function () {
  it('Should not be able to instanciate abstract class', function () {
    assert.Throw(function () {
      const ais = new AbstractImportService()
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
  it('Should call correct methods', function() {
    let c = new class extends AbstractImportService {

    }
      let getImportHandlerSpy = sinon.spy(c,'getImportHandler')
      let getLineProcessorCallbackSpy = sinon.spy(c,'getLineProcessorCallback')
      let getStrategySpy = sinon.spy(c,'getStrategy')
      c.importData("fakeBucket","fakeKey.json")
      assert.isTrue(getImportHandlerSpy.calledOnce)
      assert.isTrue(getLineProcessorCallbackSpy.calledOnceWithExactly('json'))
      assert.isTrue(getStrategySpy.calledOnceWithExactly('json'))





  })
})
