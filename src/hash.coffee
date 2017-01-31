SHA1 = require 'crypto-js/sha1'

module.exports =
  sha1: (object) ->
    string = JSON.stringify(object)

    hash = SHA1(string)

    return hash.toString()
