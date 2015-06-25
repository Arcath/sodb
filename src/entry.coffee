module.exports =
  class Entry
    ___id: null

    #
    # constructor(object,id)
    #
    # object - the Object for this entry
    # id - the id to assign to it
    #
    # Assigns all the keys of object to this instance and sents the ID
    #
    constructor: (@object, @___id) ->
      for key in Object.keys(@object)
        this[key] = @object[key]

    #
    # changed()
    #
    # compares this instance to the object to see if it has changed
    #
    changed: ->
      changed = false
      for key in Object.keys(@object)
        unless this[key] == @object[key]
          changed = true

      return changed

    #
    # updateObject()
    #
    # sets all the object values to the ones on this instance (resets changed())
    #
    updateObject: ->
      for key in Object.keys(@object)
        @object[key] = this[key]
