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
        db.add({name: 'david', age: 10, eyes: 1, likes: ['bananas', 'helping']})
        expect(db.lastInsertId).to.equal 0

    describe 'the search object', ->
      it 'should expand queries', ->
        search = {name: 'bob'}
        expect(db.expandQuery(search)).to.deep.equal {name: {is: 'bob'}}

    describe 'finding records', ->
      before ->
        db.add({name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']})
        db.add({name: 'tim', age: 30, eyes: 2, likes: ['bananas', 'helping']})
        db.add({name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']})

        expect(db.lastInsertId).to.equal 3

      it 'should find records', ->
        results = db.where({name: 'kevin'})
        expect(results[0].age).to.equal 30
        expect(results.length).to.equal 1

      it 'should find records using and', ->
        results = db.where({eyes: 2}, {age: 30})
        expect(results[0].age).to.equal 30
        expect(results.length).to.equal 2

      it 'should find records using or', ->
        results = db.where({name: ['kevin', 'david']})
        expect(results.length).to.equal 2

      it 'should find one', ->
        kevin = db.findOne({name: 'kevin'})
        expect(kevin.age).to.equal 30

      it 'should return all records', ->
        results = db.all()
        expect(results.length).to.equal db.count()

      it 'should return unique records', ->
        results = db.unique('age')
        expect(results.length).to.equal 3

    describe 'compares', ->
      it 'should support greater than', ->
        results = db.where({eyes: 2}, {age: {gt: 25}})
        expect(results.length).to.equal 2
        expect(results[0].age).to.equal 30

      it 'should support less than', ->
        results = db.where({eyes: 2}, {age: {lt: 25}})
        expect(results.length).to.equal 1
        expect(results[0].age).to.equal 20

      it 'should support greater than or equal', ->
        results = db.where({eyes: 2}, {age: {gte: 25}})
        expect(results.length).to.equal 2
        expect(results[0].age).to.equal 30

      it 'should support less than or equal', ->
        results = db.where({eyes: 2}, {age: {lte: 25}})
        expect(results.length).to.equal 1
        expect(results[0].age).to.equal 20

      it 'should support isnot', ->
        results = db.where({name: {isnot: 'kevin'}})
        expect(results.length).to.equal 3

      it 'should support includes', ->
        results = db.where({likes: {includes: 'bananas'}})
        expect(results.length).to.equal 4

      it 'should support matches', ->
        results = db.where({name: {matches: /kev/}})
        expect(results.length).to.equal 1

    describe 'result manipulation', ->
      it 'should order by', ->
        ordered = db.order({name: {isnot: 'something new'}}, "age")

        expect(ordered[1].___id).to.equal 3

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

      it 'should add additional fields', ->
        entry = db.where({name: 'dave'})[0]
        expect(entry.changed()).to.equal false
        entry.foo = 'new'
        expect(entry.changed()).to.equal true

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
        expect(db.objects.length).to.equal 5
        expect(db.count()).to.equal 4

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
    expect(db.count()).to.equal 2

  it 'should dump to json', ->
    json = db.toJSON()
    expect(json).to.equal '{"objects":[{"object":{"foo":"bar"},"___id":0,"foo":"bar"},{"object":{"foo":"widget"},"___id":1,"foo":"widget"},null],"lastInsertId":2}'

  it 'should _restore_ from json', ->
    ndb = sodb.buildFromJSON(json)

    expect(ndb.count()).to.equal(db.count())
    expect(ndb.objects.length).to.equal(2)
    expect(ndb.where({'foo': 'bar'}))
