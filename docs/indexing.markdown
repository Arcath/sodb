# Indexing

When creating a database an index field can be defined which builds a hash table for faster lookups.

For example:

```js
const database = db([], {index: 'name'})
database.add({name: 'david', height: 105, eyes: 2, friends: ['stuart', 'jerry']});
database.add({name: 'stuart', height: 94, eyes: 1, friends: ['david', 'jorge']});

let david = database.lookup('david')
```