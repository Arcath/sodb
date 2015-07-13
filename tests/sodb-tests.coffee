path = require 'path'

expect = require('chai').expect

sodb = require path.join(__dirname, '..', 'src', 'sodb')

cacheValue = true

for caching in [true, false]
  describe "sodb with caching #{caching}", ->
    [db] = []

    before ->
      db = new sodb({cache: cacheValue})

    after ->
      cacheValue = false

    it 'should have no entires in a new db', ->
      expect(db.objects.length).to.equal 0

    it 'should have the cache set', ->
      expect(db.options.cache).to.equal cacheValue

    if caching
      it 'should have a dbrevision of 0', ->
        expect(db.dbRevision).to.equal 0

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

      it 'should find one', ->
        kevin = db.findOne({name: 'kevin'})
        expect(kevin.age).to.equal 30

    describe 'compares', ->
      it 'should support greater than', ->
        results = db.where({eyes: 2}, {age: {gt: 25}})
        expect(results.length).to.equal 1
        expect(results[0].age).to.equal 30

      it 'should support less than', ->
        results = db.where({eyes: 2}, {age: {lt: 25}})
        expect(results.length).to.equal 1
        expect(results[0].age).to.equal 20

      it 'should support greater than or equal', ->
        results = db.where({eyes: 2}, {age: {gte: 25}})
        expect(results.length).to.equal 1
        expect(results[0].age).to.equal 30

      it 'should support less than or equal', ->
        results = db.where({eyes: 2}, {age: {lte: 25}})
        expect(results.length).to.equal 1
        expect(results[0].age).to.equal 20

      it 'should support isnot', ->
        results = db.where({name: {isnot: 'kevin'}})
        expect(results.length).to.equal 2

    describe 'result manipulation', ->
      it 'should order by', ->
        results = db.where({name: {isnot: 'something new'}})
        ordered = db.order({name: {isnot: 'something new'}}, "name")

        expect(results[0].___id).not.to.equal ordered[0].___id

    describe 'updating records', ->
      it 'should update a record from an entry', ->
        entry = db.where({name: 'david'})[0]
        expect(entry.changed()).to.equal false
        entry.name = 'dave'
        expect(entry.changed()).to.equal true

        results = db.where({name: 'dave'})
        expect(results.length).to.equal 0

        if cacheValue
          dbrev = db.dbRevision

        db.update(entry)

        if cacheValue
          expect(db.dbRevision).to.equal dbrev + 1

        results = db.where({name: 'dave'})
        expect(results.length).to.equal 1

    describe 'deleteing records', ->
      [toDelete] = []
      beforeEach ->
        db.add({name: 'bob'})
        toDelete = db.lastInsertId

      it 'should delete a record', ->
        results = db.where({___id: toDelete})
        expect(results.length).to.equal 1
        db.remove(results[0])

        results = db.where({___id: toDelete})
        expect(results.length).to.equal 0
        expect(db.objects.length).to.equal 4
        expect(db.count()).to.equal 3

      if caching
        it 'should have a dbrevision of not 0', ->
          expect(db.dbRevision).not.to.equal 0

describe 'JSON', ->
  [db, json] = []

  before ->
    db = new sodb()
    db.add({foo: 'bar'})
    db.add({foo: 'widget'})
    db.add({foo: 'deleted'})

    record = db.findOne({foo: 'deleted'})
    db.remove record

  it 'should dump to json', ->
    json = db.toJSON()
    expect(json).to.equal '[{"object":{"foo":"bar"},"___id":0,"foo":"bar"},{"object":{"foo":"widget"},"___id":1,"foo":"widget"},null]'

  it 'should _restore_ from json', ->
    ndb = sodb.buildFromJSON(json)

    expect(ndb.count()).to.equal(2)
    expect(ndb.objects.length).to.equal(3)
