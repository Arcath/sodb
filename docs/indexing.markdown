# Indexing

When creating a database an index field can be defined which builds a hash table for faster lookups.

For example:

```js
var db = new SODB({index: 'name'})
db.add({name: 'david', height: 105, eyes: 2, friends: ['stuart', 'jerry']});
db.add({name: 'stuart', height: 94, eyes: 1, friends: ['david', 'jorge']});

var david = db.indexLookup('david')
```