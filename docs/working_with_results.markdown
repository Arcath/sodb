# Working With Results

## Ordering

sodb can order your results ascendingly (_protip_ use `.reverse()` to get descending).

```javascript
heightOrder = db.order({eyes: 2}, 'height');
heightOrder[0].name // jorge
heightOrder.reverse()[0].name // tim
```

If you are using caching your sorts are cached too.
