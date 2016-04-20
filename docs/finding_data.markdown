# Finding Data

All searching is done through the `where` method.

The `where` method takes search objects as arguments.

The search object can take a few forms depending on what you want to find:

```javascript
{name: 'kevin'} // Will be expanded to is (see next line)
{name: {is: 'kevin'}} // name is kevin
{name: {isnot: 'kevin'}} // name is not kevin
{name: {matches: /kev/}} // name matches the pattern /kev/
{height: {gt: 100}} // height is greater than 100
{height: {lt: 90}} // height is less than 90
{eyes: {is: [1, 2]}} // eyes is 1 OR 2
{friends: {includes: 'kevin'}}  //friends array includes kevin

// Run a function to compare objects
{name: {func: function(field, objects){
  return objects.filter(function(entry){
    return entry[field] == "david"
  })
}}}

results = db.where({name: 'david'}); // where name is david
results.length // 1
results[0].height // 105

results = db.where({name: {func: function(field, objects){
  return objects.filter(function(entry){
    return entry[field] == "david"
  })
}}})
results.length // 1
results[0].height // 105

david = db.findOne({name: 'david'})
david.height // 105

results = db.where({friends: {includes: 'jorge'}})
results.length // 2
```

Each additional search object refines the search before it so for example to find all minions under 100cm with 2 eyes:

```javascript
results = db.where({height: {lt: 100}}, {eyes: 2})
results.length // 1
results[0].name // jorge
```

You can refine a search later if you need to by using `refineSearch`

```javascript
results = db.where({height: {lt: 100}})
results.length // 4
results2 = db.refineSearch(results, {eyes: 2})
results2.length //1
```

If you need all entries from the database you can fetch them through .all()

```javascript
results = db.all()
results.length // 8
```

If you want to find all the unique values for a field you can use .unique()

```javascript
results = db.unique('eyes')
results.length // 2
results // [1, 2]
```
