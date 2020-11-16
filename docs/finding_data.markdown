# Finding Data

All searching is done through the `where` method.

The `where` method takes search objects as arguments.

The search object can take a few forms depending on what you want to find:

```typescript
{name: 'kevin'} // Will be expanded to is (see next line)
{name: {is: 'kevin'}} // name is kevin
{name: {isnot: 'kevin'}} // name is not kevin
{name: {matches: /kev/}} // name matches the pattern /kev/
{height: {gt: 100}} // height is greater than 100
{height: {lt: 90}} // height is less than 90
{eyes: {is: [1, 2]}} // eyes is 1 OR 2
{friends: {includes: 'kevin'}}  //friends array includes kevin

// Run a function to compare objects
{name: (entry, field) => {
  return entry[field] == "david"
}}

let results = database.where({name: 'david'}); // where name is david
results.length // 1
results[0].height // 105

results = database.where({name: (entry, field) => {
  return entry[field] == "david"
}})
results.length // 1
results[0].height // 105

const david = database.findOne({name: 'david'})
david.height // 105

results = database.where({friends: {includes: 'jorge'}})
results.length // 2
```

Each additional search object refines the search before it so for example to find all minions under 100cm with 2 eyes:

```typescript
results = database.where({height: {lt: 100}}, {eyes: 2})
results.length // 1
results[0].name // jorge
```

You can refine a search later if you need to by using `refineSearch`

```typescript
results = database.where({height: {lt: 100}})
results.length // 4
results2 = database.refineSearch(results, {eyes: 2})
results2.length //1
```

If you need all entries from the database you can fetch them through .all()

```typescript
results = database.all()
results.length // 8
```

If you want to find all the unique values for a field you can use .unique()

```javascript
results = database.unique('eyes')
results.length // 2
results // [1, 2]
```

If you want to provide your own filter method you can supply a function in the search.
```typescript
// A filter function takes 2 arguments.
// - the current entry
// - the field being filtered

results = database.where({eyes: (entry, field) => {
  return (entry[field] % 2 === 0)
}})
results.length // 5
 ```
