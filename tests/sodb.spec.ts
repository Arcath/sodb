import {SODB, buildFromJSON} from '../src/sodb'
import {getCompares} from '../src/compares'
import {Entry} from '../src/entry'

const Compares = getCompares()
const caches = [true, false]

caches.forEach((caching) => {
  let db: SODB<{
    name: string
    age: number
    eyes: number
    likes: string[]
  }>

  beforeEach(() => {
    db = new SODB({cache: caching})
  })

  it('should have no entries in a new db (caching: ' + JSON.stringify(caching) + ')', () => {
    expect(db.objects.length).toBe(0)
  })

  it('should have caching set to the caching (caching: ' + JSON.stringify(caching) + ')', () => {
    expect(db.options.cache).toBe(caching)
  })

  if(caching){
    it('should have a dbRevision of 0', () => {
      expect(db.dbRevision).toBe(0)
    })
  }

  it('should add an id property', () => {
    db.add({name: 'david', age: 10, eyes: 1, likes: ['bananas', 'helping']})
    expect(db.lastInsertId).toBe(0)
  })

  it('should expand search objects', () => {
    let search = {name: 'bob'}
    let expanded = db.expandQuery(search)

    expect(expanded.compareFunc).toBe('is')
    expect(expanded.field).toBe('name')
    expect(expanded.value).toBe('bob')
  })

  it('should load objects from options', () => {
    const testDb = new SODB({cache: false, data: [
      {name: 'bob'},
      {name: 'steve'}
    ]})

    expect(testDb.all().length).toBe(2)
  })

  describe('finding records', () => {
    beforeEach(() => {
      db = new SODB({cache: caching})

      db.add({name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'tim', age: 30, eyes: 2, likes: ['helping']})
      db.add({name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']})
    })

    it('should find records', () => {
      let results = db.where({name: 'kevin'})
      
      expect(results[0].age).toBe(30)
      expect(results.length).toBe(1)
    })

    it('should find records using and', () => {
      let results = db.where({eyes: 2}, {age: 30})

      expect(results[0].age).toBe(30)
      expect(results.length).toBe(2)
    })

    it('should find records using or', () => {
      let results = db.where({likes: {includes: ['bananas', 'helping']}})

      expect(results.length).toBe(3)
    })

    it('should find one', () => {
      let kevin = db.findOne({name: 'kevin'})

      expect(kevin.age).toBe(30)
    })

    it('should return all records', () => {
      let results = db.all()

      expect(results.length).toBe(db.count())
    })

    it('should return unique records', () => {
      let results = db.unique('age')

      expect(results.length).toBe(2)
    })

    it('should get by id', () => {
      let record = db.get(2)

      expect(record.name).toBe('stuart')
    })

    it('should get the last record', () => {
      let record = db.getLast()

      expect(record.name).toBe('stuart')
    })
  })

  describe('Index', () => {
    it('should create an index', () => {
      db = new SODB({cache: caching, index: 'name'})

      db.add({name: 'tim', age: 30, eyes: 2, likes: ['bananas', 'helping']})

      let result = db.indexLookup('tim')

      if(result){
        expect(result.age).toBe(30)
      }

      result = db.indexLookup('phil')

      expect(result).toBe(undefined)
    })
  })

  describe('Compares', () => {
    let records: Entry<{
      name: string
      age: number
      likes: string[]
    }>[]

    beforeAll(() => {
      records = [
        new Entry({name: 'bob', age: 10, likes: ['bananas', 'helping']}, 0),
        new Entry({name: 'tim', age: 20, likes: ['helping']}, 1),
        new Entry({name: 'phil', age: 30, likes: ['bananas', 'dancing']}, 2)
      ]
    })

    it('should support is', () => {
      let results = Compares.is('name', 'bob', records)

      expect(results.length).toBe(1)
    })

    it('should support greater than', () => {
      let results = Compares.gt('age', 20, records)

      expect(results.length).toBe(1)
    })

    it('should support greater than or equal', () => {
      let results = Compares.gte('age', 20, records)

      expect(results.length).toBe(2)
    })

    it('should support less than', () => {
      let results = Compares.lt('age', 20, records)

      expect(results.length).toBe(1)
    })

    it('should support less than or equal', () => {
      let results = Compares.lte('age', 20, records)

      expect(results.length).toBe(2)
    })

    it('should support isnot', () => {
      let results = Compares.isnot('name', 'bob', records)

      expect(results.length).toBe(2)
    })

    it('should support includes', () => {
      let results = Compares.includes('likes', 'dancing', records)

      expect(results.length).toBe(1)
    })

    it('should support matches', () => {
      let results = Compares.matches('name', /bo/, records)

      expect(results.length).toBe(1)
    })

    it('should support a function', () => {
      let results = Compares.func('name', (field: string, objects: Entry<{
        name: string
        age: number
        likes: string[]
      }>) => {
        return objects.filter((entry: Entry<{
          name: string
          age: number
          likes: string[]
        }>) => {
          return true
        })
      }, records)

      expect(results.length).toBe(records.length)
    })

    it('should support defined', () => {
      let results = Compares.defined('name', true, records)

      expect(results.length).toBe(records.length)
    })
  })

  describe('Custom Compares', () => {
    it('should let you add a compare', () => {
      db.add({name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'tim', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']})

      db.addCompare('multiple', (field, value, objects) => {
        return objects.filter((entry) => {
          return (entry[field] % value === 0)
        })
      })

      let results = db.where({age: {multiple: 2}})

      expect(results.length).toBe(3)
    })
  })

  describe('Result Manipulation', () => {
    it('should order by', () => {
      db.add({name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'tim', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'phil', age: 40, eyes: 2, likes: ['bananas', 'helping']})

      let ordered = db.order("age", {name: {isnot: 'something new'}})

      expect(ordered[0].___id).toBe(2)
    })
  })

  describe('Updating records', () => {
    it('should update a record', () => {
      db.add({name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'tim', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']})

      let entry = db.get(0)

      expect(entry.changed()).toBe(false)

      if(caching){
        let rev = db.dbRevision
        db.update(entry)
        expect(db.dbRevision).toBe(rev)
      }

      entry.name = 'kelvin'
      expect(entry.changed()).toBe(true)

      if(caching){
        expect(db.dbRevision).toBe(3)
      }

      db.update(entry)

      if(caching){
        expect(db.dbRevision).toBe(4)
      }
    })
  })

  describe('Deleteing records', () => {
    beforeEach(() => {
      db.add({name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'tim', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']})
    })

    it('should delete a record', () => {
      let results = db.where({___id: db.lastInsertId})
      expect(results.length).toBe(1)


      if(caching){
        expect(db.dbRevision).toBe(3)
      }

      db.remove(results[0])

      results = db.where({___id: db.lastInsertId})
      expect(results.length).toBe(0)

      if(caching){
        expect(db.dbRevision).toBe(4)
      }
    })
  })

  describe('Result manipulation', () => {
    beforeEach(() => {
      db.add({name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'tim', age: 30, eyes: 2, likes: ['bananas', 'helping']})
      db.add({name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']})
    })

    it('should let you refine a search', () => {
      let results = db.where({eyes: 2})

      expect(results.length).toBe(3)

      let old = db.refineSearch(results, {age: 30})

      expect(old.length).toBe(2)
    })
  })
})

describe('JSON', () => {
  let db: SODB<{
    foo: string
  }>
  let json: string

  beforeAll(() => {
    db = new SODB()

    db.add({foo: 'bar'})
    db.add({foo: 'deleted'})
    db.add({foo: 'widget'})

    let record = db.findOne({foo: 'deleted'})
    db.remove(record)
    expect(db.count()).toBe(2)
  })

  it('should dump to JSON', () => {
    json = db.toJSON()

    expect(json).toBe('{\"objects\":[{\"object\":{\"foo\":\"bar\"},\"___id\":0,\"foo\":\"bar\"},null,{\"object\":{\"foo\":\"widget\"},\"___id\":2,\"foo\":\"widget\"}],\"lastInsertId\":2}')
  })

  it('should restore from JSON', () => {
    let ndb = buildFromJSON<{foo: string}>(json, {cache: false})

    expect(ndb.count()).toBe(2)
    expect(ndb.objects.length).toBe(3)
    expect(ndb.where({foo: 'bar'}).length).toBe(1)
  })
})