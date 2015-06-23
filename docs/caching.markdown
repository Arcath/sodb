# Caching

sodb supports caching of responses.

The cache creates a hash of your search object (using [object-hash](https://www.npmjs.com/package/object-hash)) and then stores the results in a object using that hash as a key. The cache gets busted off the `dbRevision` number which gets incremented on every add/update/remove.

To use caching set the cache option to `true` when creating your database.

```javascript
db = new sodb({cache: true})
```

Thats it! sodb works exactly the same only slightly faster.

The performance gain isn't huge but if your running the same query a lot its worth it.
