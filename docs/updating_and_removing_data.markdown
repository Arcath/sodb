# Updating and Removing Data

## Updating

Updating data is easily done through the `update` method.

```javascript
david = db.where({name: 'david'})[0]
david.name = 'dave'
david.changed() // true

db.update(david)

results = db.where({name: 'dave'})
results.length // 1
results = db.where({name: 'david'})
results.length // 0
```

Update takes an instance of Entry and overwrites the entry in the database with the new one.

## Remove

Remove works much the same as Update taking an entry and removing it from the database.

```javascript
dave = db.where({name: 'dave'})[0]
db.count() // 8
db.remove(dave)
db.count() // 7
```
