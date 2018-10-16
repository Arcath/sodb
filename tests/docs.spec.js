path = require('path');

sodb = require(path.join(__dirname, '..'));

const SODB = sodb.SODB
const buildFromJSON = sodb.buildFromJSON

let db

describe('Code Used in the Docs', function(){
  beforeAll(function(){
    db = new SODB({cache: true});
  })

  it('should work like in the readme', function(){
    tdb = new SODB();

    tdb.add({name: 'bob', gender: 'm'});

    bob = tdb.findOne({name: 'bob'});
    expect(bob.gender).toBe('m');
  })

  it('should add the data', function(){
    db.add({name: 'david', height: 105, eyes: 2, friends: ['stuart', 'jerry']});
    db.add({name: 'stuart', height: 94, eyes: 1, friends: ['david', 'jorge']});
    db.add({name: 'jerry', height: 105, eyes: 2, friends: ['david', 'jorge']});
    db.add({name: 'jorge', height: 96, eyes: 2, friends: ['stuart', 'jerry']});
    db.add({name: 'tim', height: 120, eyes: 2, friends: ['mark']});
    db.add({name: 'mark', height: 105, eyes: 2, friends: ['tim']});
    db.add({name: 'phil', height: 95, eyes: 1, friends: ['kevin']});
    db.add({name: 'kevin', height: 6, eyes: 1, friends: ['phil']});

    expect(db.count()).toBe(8);
  });

  it('should find the data', function(){
    results = db.where({name: 'david'});
    expect(results.length).toBe(1);
    expect(results[0].height).toBe(105);

    results = db.where({name: {func: function(field, objects){
      return objects.filter(function(entry){
        return entry[field] == "david"
      })
    }}})
    expect(results.length).toBe(1);
    expect(results[0].height).toBe(105);

    david = db.findOne({name: 'david'})
    expect(david.height).toBe(105)

    results = db.where({height: {lt: 100}}, {eyes: 2});
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('jorge');

    results = db.where({height: {lt: 100}});
    expect(results.length).toBe(4);
    results2 = db.refineSearch(results, {eyes: 2});
    expect(results2.length).toBe(1);

    results = db.where({friends: {includes: 'jorge'}})
    expect(results.length).toBe(2);

    results = db.all()
    expect(results.length).toBe(8)

    results = db.unique('eyes')
    expect(results.length).toBe(2)

    db.addCompare('multiple', function(field, value, objects){
      return objects.filter(function(entry){
        return (entry[field] % value == 0)
      })
    })

    results = db.where({eyes: {multiple: 2}})
    expect(results.length).toBe(5)

    restuls = db.where(
      {height: {gt: 7}},
      {eyes: {isnot: 1}},
      {name: {matches: /a/}},
      {friends: {defined: true}},
      {height: {gte: 94}},
      {height: {lte: 94}},
      {friends: {defined: false}}
    )

    results = db.where(
      {eyes: {is: [2, 1]}}
    )

    let json = db.toJSON()

    let tdb = buildFromJSON(json)
    tdb.get(1)
    tdb.getLast()
  });

  it('should sort the data', function(){
    heightOrder = db.order('height', {eyes: 2});

    expect(heightOrder[0].name).toBe('jorge');
    expect(heightOrder.reverse()[0].name).toBe('tim');
  })

  it('should update the data', function(){
    david = db.where({name: 'david'})[0];
    expect(david.name).toBe('david');
    expect(david.changed()).toBe(false);
    david.name = 'dave';
    expect(david.changed()).toBe(true);

    db.update(david)

    results = db.where({name: 'dave'})
    expect(results.length).toBe(1)
    results = db.where({name: 'david'})
    expect(results.length).toBe(0)
  });

  it('should remove data', function(){
    dave = db.where({name: 'dave'})[0]
    expect(david.name).toBe('dave');
    expect(db.count()).toBe(8);
    db.remove(dave);
    expect(db.count()).toBe(7);
  })

  it('should support indexing', function(){
    var tdb = new SODB({index: 'name'})
    tdb.add({name: 'david', height: 105, eyes: 2, friends: ['stuart', 'jerry']});
    tdb.add({name: 'stuart', height: 94, eyes: 1, friends: ['david', 'jorge']});

    expect(tdb.indexLookup('david').height).toBe(105)
    expect(tdb.indexLookup('phil')).toBe(undefined)    
  })
});
