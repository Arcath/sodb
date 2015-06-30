Cache = require './cache'
Compares = require './compares'
Entry = require './entry'

hash = require 'object-hash'

module.exports =
  #
  #  Main class which is exported when this module is required
  #
  class sodb
    objects: null
    lastInsertId: -1
    cache: null
    options: null

    #
    # constructor(options)
    #
    # options - a hash of options currently takes:
    #         - cache - true/false use caching features
    #
    constructor: (@options = {}) ->
      @objects = []
      @options.cache ||= false
      @dbRevision = 0

      @cache = new Cache(@options.cache)

    #
    #  add(object)
    #
    #  object - the object you want to add to the database
    #
    add: (object) ->
      @lastInsertId += 1
      newId = @lastInsertId
      @objects[newId] = new Entry(object, newId)

      if @options.cache
        @dbRevision += 1

      return @unref @objects[newId]

    #
    # where(search..)
    #
    # serach - search objects
    #
    # Builds the search array and then checks the cache for the given search object
    #
    where: ->
      args = Array.prototype.slice.call(arguments)
      search = args.map(@expandQuery)

      @cache.hit hash.sha1(search), @dbRevision, => @findResults(search)

    #
    # findResults(search)
    #
    # search - array of search objects
    #
    # Finds the search results for the given search array.
    # Only called if the cache needs a new value.
    #
    findResults: (search) ->
      results = @objects

      for condition in search
        field = Object.keys(condition)[0]
        compare = Object.keys(condition[field])[0]
        results = @runCondition(field, compare, condition[field][compare], results)

      return results.map @unref

    #
    # findOne(search...)
    #
    # serach - search objects
    #
    # returns the first result from where() called with the same args
    #
    findOne: ->
      @where.apply(this, arguments)[0]

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

        if @options.cache
          @dbRevision += 1

      return entry

    #
    # remove(entry)
    #
    # entry - an instance of Entry
    #
    remove: (entry) ->
      delete @objects[entry.___id]

      if @options.cache
        @dbRevision += 1

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

    #
    # toJSON()
    #
    # Returns a JSON string of the @objects array
    #
    toJSON: ->
      JSON.stringify(@objects)

    #
    # #buildFromJSON(json)
    #
    # json - json string to parse
    #
    # Class Method, called as sodb.buildFromJSON(json). Builds a new database and returns it.
    #
    @buildFromJSON: (json) ->
      objects = JSON.parse(json)
      db = new sodb()
      for object in objects
        if object == null
          db.objects.push null
        else
          db.objects[object.___id] = object

      return db
