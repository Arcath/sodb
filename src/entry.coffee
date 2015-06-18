module.exports =
  class Entry
    ___id: null

    constructor: (@object, @___id) ->
      for key in Object.keys(@object)
        this[key] = @object[key]

    changed: ->
      changed = false
      for key in Object.keys(@object)
        changed = this[key] == @object[key] unless changed

      return changed

    updateObject: ->
      for key in Object.keys(@object)
        @object[key] = this[key]
