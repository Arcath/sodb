export class Cache{
  cache: {[key: string]: [any, number]}
  enabled: boolean


  constructor(enabled: boolean){
    this.cache = {}
    this.enabled = enabled
  }
  
  /**
   * Returns the supplied key from the cache or gets it.
   * @param key The cache key to lookup
   * @param cacheVersion The cache version number
   * @param createValue A function that returns the value that should be stored
   */
  hit<K = any>(key: string, cacheVersion: number, createValue: () => K): K{
    if(this.enabled){
      return this.findOrCreate(key, cacheVersion, createValue)
    }else{
      return createValue()
    }
  }

  /**
   * Returns the supplied key or creates it. Called by `hit` if the cache is enabled.
   * @param key The cache key to lookup
   * @param cacheVersion The cache version number
   * @param createValue A function that returns the value that should be stored
   */
  findOrCreate(key: string, cacheVersion: number, createValue: () => any){
    if(typeof this.cache[key] === 'undefined' || this.cache[key][1] != cacheVersion){
      const value = createValue()
      this.cache[key] = [value, cacheVersion]
      return value
    }else{
      return this.cache[key][0]
    }
  }
}