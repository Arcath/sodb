path = require 'path'
expect = require('chai').expect

if process.coverage == true
  Cache = require path.join(__dirname, '..', 'lib-cov', 'cache.js')
else
  Cache = require path.join(__dirname, '..', 'lib', 'cache.js')


cache = new Cache(true)

describe 'cache', ->
  it 'should store something if it is not there', ->
    expect(cache.cache['test-1']).to.equal undefined

    result = cache.hit 'test-1', 'a', ->
      'result'

    expect(result).to.equal 'result'
    expect(cache.cache['test-1'][0]).to.equal 'result'

  it 'should return a value from the cache if the key does not change', ->
    result = cache.hit 'test-1', 'a', ->
      'fail'

    expect(result).to.equal 'result'
    expect(cache.cache['test-1'][0]).to.equal 'result'

  it 'should return a value from the function if the key does change', ->
    result = cache.hit 'test-1', 'b', ->
      'new-result'

    expect(result).to.equal 'new-result'
    expect(cache.cache['test-1'][0]).to.equal 'new-result'

  it 'should not cache if disabled', ->
    disabledCache = new Cache(false)

    result = disabledCache.hit 'test-1', 'c', ->
      'passed'

    expect(result).to.equal 'passed'
    expect(disabledCache.cache['test-1']).to.equal undefined
