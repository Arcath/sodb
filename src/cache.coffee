#
# Caching Module
#
module.exports =
  class Cache
    cache: {}
    enabled: null

    #
    # constructor(enabled)
    #
    # enabled - boolean value for if the cache should cache
    #
    # Creates a new empty cache and set the enabled variable
    #
    constructor: (@enabled) ->
      @cache = {}

    #
    # hit(key, cacheVersion, createValue)
    #
    # key - key to store value under
    # cacheVersion - the version of the cache
    # createValue - function to create the value if it is not in the cache
    #
    # Calls #findOrCreate if the cache is enabled otherwise it runs createValue()
    #
    hit: (key, cacheVersion, createValue) ->
      if @enabled
        @findOrCreate(key, cacheVersion, createValue)
      else
        return createValue()

    #
    # findOrCreate(key, cacheVersion, createValue)
    #
    # key - key to store value under
    # cacheVersion - the version of the cache
    # createValue - function to create the value if it is not in the cache
    #
    # if the value does not exist OR the cacheVersion does not match run createValue otherwise return the cached value.
    #
    findOrCreate: (key, cacheVersion, createValue) ->
      if typeof @cache[key] is 'undefined' or @cache[key][1] != cacheVersion
        value = createValue()
        @cache[key] = [value, cacheVersion]
        return value
      else
        return @cache[key][0]
