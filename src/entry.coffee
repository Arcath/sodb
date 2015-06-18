module.exports =
  class Entry
    ___id: null

    constructor: (@object, @___id) ->
      for key in Object.keys(@object)
        this[key] = @object[key]
