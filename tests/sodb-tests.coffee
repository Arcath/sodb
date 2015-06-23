path = require 'path'

expect = require('chai').expect

if process.coverage == true
  sodb = require path.join(__dirname, '..', 'lib-cov', 'sodb.js')
else
  sodb = require path.join(__dirname, '..')

for caching in [true, false]
  describe "sodb with caching #{caching}", ->
    [db] = []

    before ->
      db = new sodb({cache: caching})

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

    describe 'updating records', ->
      it 'should update a record from an entry', ->
        entry = db.where({name: 'david'})[0]
        expect(entry.changed()).to.equal false
        entry.name = 'dave'
        expect(entry.changed()).to.equal true

        results = db.where({name: 'dave'})
        expect(results.length).to.equal 0

        db.update(entry)

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
