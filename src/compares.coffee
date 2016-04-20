#
# Comparison methods
#
# All compare methods take the same arguments:
#
# field - the field to test
# value - the value to compare to
# objects - all the entries
#
module.exports =
  is: (field, value, objects) ->
    objects.filter (entry) ->
      (entry[field] == value)

  gt: (field, value, objects) ->
    objects.filter (entry) ->
      (entry[field] > value)

  lt: (field, value, objects) ->
    objects.filter (entry) ->
      (entry[field] < value)

  gte: (field, value, objects) ->
    objects.filter (entry) ->
      (entry[field] >= value)

  lte: (field, value, objects) ->
    objects.filter (entry) ->
      (entry[field] <= value)

  isnot: (field, value, objects) ->
    objects.filter (entry) ->
      (entry[field] != value)

  includes: (field, value, objects) ->
    objects.filter (entry) ->
      (entry[field].indexOf(value) != -1)

  matches: (field, value, objects) ->
    objects.filter (entry) ->
      (value.test entry[field])

  func: (field, value, objects) ->
    value(field, objects)
