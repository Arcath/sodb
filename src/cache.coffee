#
# Caching Module
#
module.exports =
  class Cache
    cache: {}
    enabled: null

    constructor: (@enabled) ->
      @cache = {}

    hit: (key, dbHash, createValue) ->
      if @enabled
        @findOrCreate(key, dbHash, createValue)
      else
        return createValue()

    findOrCreate: (key, dbHash, createValue) ->
      if typeof @cache[key] is 'undefined'
        value = createValue()
        @cache[key] = [value, dbHash]
        return value
      else
        if @cache[key][1] == dbHash
          return @cache[key][0]
        else
          value = createValue()
          @cache[key] = [value, dbHash]
          return value
