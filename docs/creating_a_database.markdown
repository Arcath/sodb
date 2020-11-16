# Creating a Database

As the name implies sodb (Single Object Database) only needs to be created and assigned to a variable, to do this require sodb and create a new sodb:

```typescript
import db from 'sodb'

interface Minion{
  name: string
  height: number
  eyes: number
  friends: string[]
}

const database = db<Minion>()
```

That's It! You now have a working database with no data in it.

There is no need to define data structures etc... simply add objects to the database and it becomes searchable.

```javascript
database.add({name: 'david', height: 105, eyes: 2, friends: ['stuart', 'jerry']});
database.add({name: 'stuart', height: 94, eyes: 1, friends: ['david', 'jorge']});
database.add({name: 'jerry', height: 105, eyes: 2, friends: ['david', 'jorge']});
database.add({name: 'jorge', height: 96, eyes: 2, friends: ['stuart', 'jerry']});
database.add({name: 'tim', height: 120, eyes: 2, friends: ['mark']});
database.add({name: 'mark', height: 105, eyes: 2, friends: ['tim']});
database.add({name: 'phil', height: 95, eyes: 1, friends: ['kevin']});
database.add({name: 'kevin', height: 6, eyes: 1, friends: ['phil']});
```

Your database now has 8 _records_ in it which can be [searched](finding_data.markdown) for, updated and removed at will.

_minion data from http://visual.ly/whos-who-minions_
