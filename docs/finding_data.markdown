# Finding Data

All searching is done through the `where` method.

The `where` method takes search objects as arguments.

The search object can take a few forms depending on what you want to find:

```javascript
{name: 'kevin'} // Will be expanded to is (see next line)
{name: {is: 'kevin'}} // name is kevin
{height: {gt: 100}} // height is greater than 100
{height: {lt: 90}} // height is less than 90
{eyes: {is: [1, 2]}} // eyes is 1 OR 2

results = db.where({name: 'david'}); // where name is david
results.length // 1
results[0].height // 105

david = db.findOne({name: 'david'})
david.height // 105
```

Each additional search object refines the search before it so for example to find all minions under 100cm with 2 eyes:

```javascript
results = db.where({height: {lt: 100}}, {eyes: 2})
results.length // 1
results[0].name // jorge
```
