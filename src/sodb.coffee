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
    # order(search.., sort)
    #
    # search - search objects
    # sort - the field to sort by
    #
    # Runs a where query and then sorts the results
    #
    order: ->
      args = Array.prototype.slice.call(arguments)
      sort = args.pop()

      results = @where.apply(this, args)
      @cache.hit hash.sha1([args, sort]), @dbRevision, ->
        results.sort (a, b) ->
          if a[sort] > b[sort]
            return 1
          else if a[sort] < b[sort]
            return -1
          else
            return 0

    #
    # findResults(search)
    #
    # search - array of search objects
    #
    # Finds the search results for the given search array.
    # Only called if the cache needs a new value.
    #
    findResults: (search) ->
      results = @runSearch(@objects, search)

      return results.map @unref

    #
    # runSearch(results, search)
    #
    # results - the array of objects to search
    # search - array of search objects
    #
    runSearch: (results, search) ->
      for condition in search
        field = Object.keys(condition)[0]
        compare = Object.keys(condition[field])[0]
        results = @runCondition(field, compare, condition[field][compare], results)

      return results

    #
    # refineSearch(results, search...)
    #
    # results - results from a previous sodb query
    # search... - search objects
    #
    refineSearch: ->
      args = Array.prototype.slice.call(arguments)
      results = args.shift()
      search = args.map(@expandQuery)

      refined = @runSearch(results, @expandQuery(search))

      return refined.map @unref

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
    # all()
    #
    # returns all entries in the database via the cache and @findAll()
    #
    all: ->
      @cache.hit hash.sha1('find-all'), @dbRevision, => @findAll()

    #
    # findAll()
    #
    # finds all the records in the db and returns them
    #
    findAll: ->
      results = []
      for object in @objects
        results.push @unref(object) if object

      return results

    #
    # unique(field)
    #
    # returns an array of unique values for field via the cache
    #
    unique: (field) ->
      @cache.hit hash.sha1("unique-#{field}"), @dbRevision, => @findUnique(field)

    #
    # findUnique(field)
    #
    # finds all the unique values for field.
    #
    findUnique: (field) ->
      results = []
      for object in @objects
        if object
          if results.indexOf(object[field]) == -1 and object[field] != undefined
            results.push object[field]

      return results

    #
    # addCompare(name, function(field, value, entries))
    #
    # Adds a compare that can be quickly used like any other
    #
    addCompare: (name, func) ->
      Compares[name] = func

    #
    # toJSON()
    #
    # Returns a JSON string of the @objects array
    #
    toJSON: ->
      JSON.stringify({objects: @objects, lastInsertId: @lastInsertId})

    #
    # #buildFromJSON(json, options)
    #
    # json - json string to parse
    # options - the options object for SODB, see SODB.new
    #
    # Class Method, called as sodb.buildFromJSON(json). Builds a new database and returns it.
    #
    @buildFromJSON: (json, options = {}) ->
      data = JSON.parse(json)
      db = new sodb(options)
      for object in data.objects
        unless object == null
          db.objects[object.___id] = object

      db.lastInsertId = data.lastInsertId

      return db
