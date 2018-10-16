import {Cache} from '../src/cache'

const cache = new Cache(true)

describe('cache', () => {
  it('should store something if it is not there', () => {
    expect(cache.cache['test-1']).toBe(undefined)

    let result = cache.hit('test-1', 1, () => {
      return 'result'
    })

    expect(result).toBe('result')
    expect(cache.cache['test-1'][0]).toBe('result')
  })

  it('should return a value from the cache if the key does not change', () => {
    let result = cache.hit('test-1', 1, () => {
      return 'fail'
    })

    expect(result).toBe('result')
    expect(cache.cache['test-1'][0]).toBe('result')
  })

  it('should return a value from the function if the key does change', () => {
    let result = cache.hit('test-1', 2, () => {
      return 'new-result'
    })

    expect(result).toBe('new-result')
    expect(cache.cache['test-1'][0]).toBe('new-result')
  })

  it('should not cache if disabled', () => {
    let disabledCache = new Cache(false)

    let result = disabledCache.hit('test-1', 3, () => {
      return 'passed'
    })

    expect(result).toBe('passed')
    expect(disabledCache.cache['test-1']).toBe(undefined)
  })
})
