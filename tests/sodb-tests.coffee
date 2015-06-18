path = require 'path'

expect = require('chai').expect
sodb = require path.join(__dirname, '..')

db = new sodb()

describe 'sodb', ->
  it 'should have no entires in a new db', ->
    expect(db.objects.length).to.equal 0

  describe 'adding records', ->
    it 'should add an id property', ->
      db.add({name: 'david', age: 10, eyes: 1})
      expect(db.lastInsertId).to.equal 0

  describe 'the search object', ->
    it 'should expand queries', ->
      search = {name: 'bob'}
      expect(db.expandQuery(search)).to.deep.equal {name: {is: 'bob'}}

  describe 'finding records', ->
    before ->
      db.add({name: 'stuart', age: 20, eyes: 2})
      db.add({name: 'kevin', age: 30, eyes: 2})

      expect(db.lastInsertId).to.equal 2

    it 'should find records', ->
      results = db.where({name: 'kevin'})
      expect(results[0].age).to.equal 30
      expect(results.length).to.equal 1

    it 'should find records using and', ->
      results = db.where({eyes: 2}, {age: 30})
      expect(results[0].age).to.equal 30
      expect(results.length).to.equal 1

    it 'should find records using or', ->
      results = db.where({name: ['kevin', 'david']})
      expect(results.length).to.equal 2

  describe 'compares', ->
    it 'should support greater than', ->
      results = db.where({eyes: 2}, {age: {gt: 25}})
      expect(results.length).to.equal 1
      expect(results[0].age).to.equal 30

    it 'should support less than', ->
      results = db.where({eyes: 2}, {age: {lt: 25}})
      expect(results.length).to.equal 1
      expect(results[0].age).to.equal 20
