# Typescript

From version 2.0.0 onwards SODB fully supports typescript.

When creating your database SODB takes a type option that describes the _record_.

```ts
import {SODB} from 'sodb'

let db = new SODB<{name: string, age: number}>()

db.findOne({name: 'dave'}) // Would have type Entry<{name: string, age: number}>
```