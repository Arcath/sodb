# Creating a Database

As the name implies sodb (Single Object Database) only needs to be created and assigned to a variable, to do this require sodb and create a new sodb:

```javascript
sodb = require('sodb');

db = new sodb()
```

Thats It! You now have a working database with no data in it.

There is no need to define data structures etc... simply add objects to the database and it becomes searchable.

```javascript
db.add({name: 'david', height: 105, eyes: 2, friends: ['stuart', 'jerry']});
db.add({name: 'stuart', height: 94, eyes: 1, friends: ['david', 'jorge']});
db.add({name: 'jerry', height: 105, eyes: 2, friends: ['david', 'jorge']});
db.add({name: 'jorge', height: 96, eyes: 2, friends: ['stuart', 'jerry']});
db.add({name: 'tim', height: 120, eyes: 2, friends: ['mark']});
db.add({name: 'mark', height: 105, eyes: 2, friends: ['tim']});
db.add({name: 'phil', height: 95, eyes: 1, friends: ['kevin']});
db.add({name: 'kevin', height: 6, eyes: 1, friends: ['phil']});
```

Your database now has 8 _records_ in it which can be [searched](finding_data.markdown) for, updated and removed at will.

_minion data from http://visual.ly/whos-who-minions_
