# Creating a Database

As the name implies sodb (Single Object Database) only needs to be created and assigned to a variable, to do this require sodb and create a new sodb:

```javascript
sodb = require('sodb');

db = new sodb()
```

Thats It! You now have a working database with no data in it.

There is no need to define data structures etc... simply add objects to the database and it becomes searchable.

```javascript
db.add({name: 'david', age: 10, eyes: 1});
db.add({name: 'stuart', age: 20, eyes: 2});
db.add({name: 'kevin', age: 30, eyes: 2});
```
