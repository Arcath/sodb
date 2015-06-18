Compares = require './compares'
Entry = require './entry'

module.exports =
  #
  #  Main class which is exported when this module is required
  #
  class sodb
    objects: [] # New instances have no objects
    lastInsertId: -1

    #
    #  add(object)
    #
    #  object - the object you want to add to the database
    #
    add: (object) ->
      @lastInsertId += 1
      newId = @lastInsertId
      @objects[newId] = new Entry(object, newId)
      return @unref @objects[newId]

    #
    # where(search..)
    #
    # serach - search objects
    #
    where: ->
      args = Array.prototype.slice.call(arguments)
      search = args.map(@expandQuery)
      results = @objects

      for condition in search
        field = Object.keys(condition)[0]
        compare = Object.keys(condition[field])[0]
        results = @runCondition(field, compare, condition[field][compare], results)

      return results.map @unref

    #
    # unref(entry)
    #
    # entry - an instance of Entry
    #
    # Creates a new instance of Entry copying the supplied, stops updates outside of the database from applying to objects
    #
    unref: (entry) ->
      new Entry(entry.object, entry.___id)

    #
    # runCondition(field, compare, value, objects)
    #
    # field - the field to compare
    # compare - the compare method to use
    # value - the value to compare to
    # objects - the object list to filter
    #
    runCondition: (field, compare, value, objects) ->
      if value.constructor == Array
        found = []
        for orCondition in value
          results = @runCondition(field, compare, orCondition, objects)
          found = @join(found, results)

        return found
      else
        return Compares[compare](field, value, objects)

    #
    # join(current, additions)
    #
    # current & additions - arrays to join
    #
    # Joins arrays by excluding duplicate sodb ids
    #
    join: (current, additions) ->
      ids = current.map (value) ->
        return value.___id

      for entry in additions
        current.push(entry) if ids.indexOf(entry.___id) == -1

      return current

    #
    # expandQuery(search)
    #
    # search - a search object
    #
    # fill in missing is calls
    #
    expandQuery: (search) ->
      for key in Object.keys(search)
        unless search[key].constructor == Object
          search[key] = {is: search[key]}

      return search

    #
    # update(entry)
    #
    # entry - an instance of Entry
    #
    update: (entry) ->
      if entry.changed()
        entry.updateObject()
        @objects[entry.___id] = entry

      return entry

    #
    # remove(entry)
    #
    # entry - an instance of Entry
    #
    remove: (entry) ->
      delete @objects[entry.___id]

    #
    # count()
    #
    # Checks the cache and then returns a count
    #
    count: ->
      count = 0
      for object in @objects
        count += 1 if object

      return count
