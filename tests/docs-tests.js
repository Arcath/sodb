path = require('path');

sodb = require(path.join(__dirname, '..'));
expect = require('chai').expect;

db = new sodb();

describe('Code Used in the Docs', function(){
  it('should work like in the readme', function(){
    tdb = new sodb();

    tdb.add({name: 'bob', gender: 'm'});

    bob = tdb.findOne({name: 'bob'});
    expect(bob.gender).to.equal('m');
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

    expect(db.count()).to.equal(8);
  });

  it('should find the data', function(){
    results = db.where({name: 'david'});
    expect(results.length).to.equal(1);
    expect(results[0].height).to.equal(105);

    results = db.where({name: {func: function(field, objects){
      return objects.filter(function(entry){
        return entry[field] == "david"
      })
    }}})
    expect(results.length).to.equal(1);
    expect(results[0].height).to.equal(105);

    david = db.findOne({name: 'david'})
    expect(david.height).to.equal(105)

    results = db.where({height: {lt: 100}}, {eyes: 2});
    expect(results.length).to.equal(1);
    expect(results[0].name).to.equal('jorge');

    results = db.where({height: {lt: 100}});
    expect(results.length).to.equal(4);
    results2 = db.refineSearch(results, {eyes: 2});
    expect(results2.length).to.equal(1);

    results = db.where({friends: {includes: 'jorge'}})
    expect(results.length).to.equal(2);

    results = db.all()
    expect(results.length).to.equal(8)

    results = db.unique('eyes')
    expect(results.length).to.equal(2)

    db.addCompare('multiple', function(field, value, objects){
      return objects.filter(function(entry){
        return (entry[field] % value == 0)
      })
    })

    results = db.where({eyes: {multiple: 2}})
    expect(results.length).to.equal(5)
  });

  it('should sort the data', function(){
    heightOrder = db.order({eyes: 2}, 'height');
    expect(heightOrder[0].name).to.equal('jorge');
    expect(heightOrder.reverse()[0].name).to.equal('tim');
  })

  it('should update the data', function(){
    david = db.where({name: 'david'})[0];
    expect(david.name).to.equal('david');
    expect(david.changed()).to.equal(false);
    david.name = 'dave';
    expect(david.changed()).to.equal(true);

    db.update(david)

    results = db.where({name: 'dave'})
    expect(results.length).to.equal(1)
    results = db.where({name: 'david'})
    expect(results.length).to.equal(0)
  });

  it('should remove data', function(){
    dave = db.where({name: 'dave'})[0]
    expect(david.name).to.equal('dave');
    expect(db.count()).to.equal(8);
    db.remove(dave);
    expect(db.count()).to.equal(7);
  })
});
