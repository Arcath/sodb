import db from './db'

describe("Docs tests", () => {
  it('should work like the readme', () => {
    interface Record{
      name: string
      gender: string
    }
    
    const {add, findOne} = db<Record>()
    
    add({name: 'bob', gender: 'm'})
    
    const bob = findOne({name: 'bob'})
    expect(bob.gender).toBe('m')
  })

  it('should work like the docs', () => {
    interface Minion{
      name: string
      height: number
      eyes: number
      friends: string[]
    }
    
    const database = db<Minion>()

    database.add({name: 'david', height: 105, eyes: 2, friends: ['stuart', 'jerry']})
    database.add({name: 'stuart', height: 94, eyes: 1, friends: ['david', 'jorge']})
    database.add({name: 'jerry', height: 105, eyes: 2, friends: ['david', 'jorge']})
    database.add({name: 'jorge', height: 96, eyes: 2, friends: ['stuart', 'jerry']})
    database.add({name: 'tim', height: 120, eyes: 2, friends: ['mark']})
    database.add({name: 'mark', height: 105, eyes: 2, friends: ['tim']})
    database.add({name: 'phil', height: 95, eyes: 1, friends: ['kevin']})
    database.add({name: 'kevin', height: 6, eyes: 1, friends: ['phil']})

    let results = database.where({name: 'david'}); // where name is david
    expect(results.length).toBe(1)
    expect(results[0].height).toBe(105)

    results = database.where({name: (entry, field) => {
      return entry[field] == "david"
    }})
    expect(results.length).toBe(1)
    expect(results[0].height).toBe(105)

    let david = database.findOne({name: 'david'})
    expect(david.height).toBe(105)

    results = database.where({friends: {includes: 'jorge'}})
    expect(results.length).toBe(2)

    results = database.where({height: {lt: 100}}, {eyes: 2})
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('jorge')

    results = database.where({height: {lt: 100}})
    expect(results.length).toBe(4)
    let results2 = database.refineSearch(results, {eyes: 2})
    expect(results2.length).toBe(1)

    results = database.all()
    expect(results.length).toBe(8)

    let unique = database.unique('eyes')
    expect(unique.length)
    expect(unique).toStrictEqual([2, 1])

    results = database.where({eyes: (entry, field) => {
      return (entry[field] % 2 === 0)
    }})
    expect(results.length).toBe(5)

    const heightOrder = database.orderBy('height', {eyes: 2});
    expect(heightOrder[0].name).toBe('jorge')
    expect(heightOrder.reverse()[0].name).toBe('tim')

    david = database.findOne({name: 'david'})
    expect(database.changed(david)).toBe(false)
    david.name = 'dave'
    expect(database.changed(david)).toBe(true)

    database.update(david)

    results = database.where({name: 'dave'})
    expect(results.length).toBe(1)
    results = database.where({name: 'david'})
    expect(results.length).toBe(0)

    const dave = database.where({name: 'dave'})[0]
    expect(database.count()).toBe(8)
    database.remove(dave)
    expect(database.count()).toBe(7)
  })

  it('should work like the indexing example', () => {
    interface Minion{
      name: string
      height: number
      eyes: number
      friends: string[]
    }

    const database = db<Minion>([], {index: 'name'})
    database.add({name: 'david', height: 105, eyes: 2, friends: ['stuart', 'jerry']});
    database.add({name: 'stuart', height: 94, eyes: 1, friends: ['david', 'jorge']});

    let david = database.lookup('david')

    expect(david!.name).toBe('david')
  })
})