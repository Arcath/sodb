import {cacheKeyExists} from '@arcath/utils'
import {SHA1} from 'crypto-js'

import {db, fromJson} from './db'

describe('DB', () => {
  it('should find one by id', () => {
    const name = "test"

    const database = db<{name: string}>()

    const id = database.add({name})

    const record = database.findOneById(id)

    expect(record).not.toBeUndefined()
    expect(record!.__id).toBe(id)
    expect(record!.name).toBe(name)

    const missing = database.findOneById(2)
    
    expect(missing).toBeUndefined()

    const nid = database.add({name: 'test 2'})

    const nRecord = database.findOneById(nid)

    expect(nRecord).not.toBeUndefined()

    nRecord!.name = 'test3'

    database.update(nRecord!)

    expect(database.findOneById(nid)!.name).toBe('test3')

    database.remove(nid)

    const removed = database.findOneById(nid)

    expect(removed).toBeUndefined()
  })

  it('should run searches', () => {
    interface Minion{
      name: string
      age: number
      eyes: number
      likes: string[]
    }

    const records: Minion[] = [
      {name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']},
      {name: 'tim', age: 30, eyes: 2, likes: ['helping']},
      {name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']}
    ]

    const database = db<Minion>(records)

    const tims = database.where({name: 'tim'})

    expect(tims).toHaveLength(1)

    const oldMinions = database.where({age: {gt: 25}})

    expect(oldMinions).toHaveLength(2)

    const olderMinions = database.where({age: {gte: 30}})
    
    expect(olderMinions).toHaveLength(2)

    const youngMinions = database.where({age: {lt: 25}})

    expect(youngMinions).toHaveLength(1)

    const youngerMinions = database.where({age: {lte: 20}})

    expect(youngerMinions).toHaveLength(1)

    const notTims = database.where({name: {isnot: 'tim'}})

    expect(notTims).toHaveLength(2)

    const oldest = database.max('age')

    expect(oldest.name).toBe('tim')

    const youngest = database.min('age')

    expect(youngest.name).toBe('stuart')
  })

  it('should support custom compares', () => {
    interface Minion{
      name: string
      age: number
      eyes: number
      likes: string[]
    }

    const records: Minion[] = [
      {name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']},
      {name: 'tim', age: 30, eyes: 2, likes: ['helping']},
      {name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']}
    ]

    const database = db<Minion>(records)

    const tims = database.where({name: (entry, field) => {
      return entry[field] === 'tim'
    }})

    expect(tims).toHaveLength(1)
  })

  it('should manage records', () => {
    interface Minion{
      name: string
      age: number
      eyes: number
      likes: string[]
    }

    const records: Minion[] = [
      {name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']},
      {name: 'tim', age: 30, eyes: 2, likes: ['helping']},
      {name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']}
    ]

    const database = db<Minion>(records, {index: 'name'})

    const kevin = database.lookup('kevin')!

    expect(database.changed(kevin)).toBe(false)

    database.update(kevin)

    kevin.age = 31

    expect(database.changed(kevin)).toBe(true)


    expect(database.count()).toBe(3)

    database.remove(kevin)

    expect(database.count()).toBe(2)
  })

  it('should support caching', () => {
    interface Minion{
      name: string
      age: number
      eyes: number
      likes: string[]
    }

    const records: Minion[] = [
      {name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']},
      {name: 'tim', age: 30, eyes: 2, likes: ['helping']},
      {name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']}
    ]

    const database = db<Minion>(records, {
      cache: true
    })

    const searchObject = {name: 'tim'}

    const key = "sodb-" + SHA1(JSON.stringify([searchObject])).toString()

    const searchResult = database.where(searchObject)

    expect(searchResult.length).toBe(1)

    expect(database.count()).toBe(3)

    expect(cacheKeyExists(key)).toBe(true)
  })

  it('should support indexing', () => {
    interface Minion{
      name: string
      age: number
      eyes: number
      likes: string[]
    }

    const records: Minion[] = [
      {name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']},
      {name: 'tim', age: 30, eyes: 2, likes: ['helping']},
      {name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']}
    ]

    const database = db<Minion>(records, {
      cache: true,
      index: 'name'
    })

    const kevin = database.lookup('kevin')

    expect(kevin).not.toBeUndefined()
    expect(kevin!.name).toBe('kevin')

    const fake = database.lookup('fake')

    expect(fake).toBeUndefined()
  })

  it('should export and import', () => {
    interface Minion{
      name: string
      age: number
      eyes: number
      likes: string[]
    }

    const records: Minion[] = [
      {name: 'kevin', age: 30, eyes: 2, likes: ['bananas', 'helping']},
      {name: 'tim', age: 30, eyes: 2, likes: ['helping']},
      {name: 'stuart', age: 20, eyes: 2, likes: ['bananas', 'helping']}
    ]

    const database = db<Minion>(records)

    database.remove(1)

    expect(database.count()).toBe(2)
    expect(database.count()).toBe(2)

    const asJson = database.toJson()

    const config = JSON.parse(asJson)

    expect(config.entries).toHaveLength(3)

    const restored = fromJson<Minion>(asJson)

    expect(restored.count()).toBe(2)
  })
})