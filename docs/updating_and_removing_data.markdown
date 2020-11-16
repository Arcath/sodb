# Updating and Removing Data

## Updating

Updating data is easily done through the `update` method.

```javascript
david = database.findOne({name: 'david'})
david.name = 'dave'
database.changed(david) // true

database.update(david)

results = database.where({name: 'dave'})
results.length // 1
results = database.where({name: 'david'})
results.length // 0
```

Update takes an instance of Entry and overwrites the entry in the database with the new one.

## Remove

Remove works much the same as Update taking an entry and removing it from the database.

```typescript
dave = database.where({name: 'dave'})[0]
database.count() // 8
database.remove(dave)
database.count() // 7
```
