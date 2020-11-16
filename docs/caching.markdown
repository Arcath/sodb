# Caching

sodb supports caching of responses.

The cache creates a hash of your search object (using [object-hash](https://www.npmjs.com/package/object-hash)) and then stores the results in an object using that hash as a key. The cache gets busted whenever an entry is added, updated or removed.

To use caching set the cache option to `true` when creating your database.

```javascript
database = db([], {cache: true})
```

Thats it! sodb works exactly the same only slightly faster.

The performance gain isn't huge but if your running the same query a lot its worth it.
