import {SHA1} from 'crypto-js'
import {cacheKey, resetCache, defaults, DeepPartial, keys} from '@arcath/utils'

interface DB<T>{
  add: (object: T) => number
  update: (object: WithIndex<T>) => void
  remove: (id: number | WithIndex<T>) => void

  all: () => WithIndex<T>[]

  lookup: (value: Primative) => WithIndex<T>

  findOneById: (id: number) => WithIndex<T> | undefined
  findOne: (...searches: SearchObject<T>[]) => WithIndex<T>

  where: (...searches: SearchObject<T>[]) => WithIndex<T>[]
  orderBy: <K extends keyof T>(field: K, ...searches: SearchObject<T>[]) => WithIndex<T>[]

  refineSearch: (objects: WithIndex<T>[], ...searches: SearchObject<T>[]) => WithIndex<T>[]

  unique: <K extends keyof T>(field: K) => T[K][]

  changed: (object: WithIndex<T>) => boolean

  count: () => number

  toJson: () => string
}

type Primative = 
  string |
  boolean |
  number |
  Primative[]

type WithIndex<T> = T & {__id: number}

type SearchObject<T> = {[P in keyof T]?: SearchQuery<T, P>}

type SearchQuery<T, P extends keyof T> = 
  T[P] |
  {[S in keyof Filters<T>]?: T[P]} |
  {[S in keyof ArrayFilters<T>]?: Primative} |
  FilterFunction<T, P>


interface Filters<T>{
  is: FilterFunction<T>
  isnot: FilterFunction<T>
  gt: FilterFunction<T>
  lt: FilterFunction<T>
  gte: FilterFunction<T>
  lte: FilterFunction<T>
}

interface ArrayFilters<T>{
  includes: ArrayFilterFunction<T>
}

type FilterFunction<T, K extends keyof T = keyof T> = (entry: T, field: K, value: T[K]) => boolean
type ArrayFilterFunction<T, K extends keyof T = keyof T> = (entry: T, field: K, value: Primative) => boolean

interface DBOptions<T>{
  /** Should the results of searches be cached? */
  cache: boolean
  /** The field to index on */
  index?: keyof T
}

const defaultOptions: DBOptions<{}> = {
  cache: false,
  index: undefined
}

export const db = <T extends {}>(entries: T[] = [], dbOptions: DeepPartial<DBOptions<T>> = {}): DB<T> => {
  let lastInsertId = -1

  const index: {[value: string]: number} = {}

  const options = defaults(dbOptions, defaultOptions)

  const storeIndex = (entry: T, i: number) => {
    index[(entry[options.index!] as any)] = i
  }

  if(options.index){
    entries.forEach((entry, i) => {
      storeIndex(entry, i)
    })
  }

  const compareFunction = <K extends keyof T>(filter: (options: {entry: T, field: K, value: T[K]}) => boolean) => {
    return (entry: T, field: K, value: T[K]) => {
      return filter({entry, field, value})
    }
  }

  const arrayCompareFunction = <K extends keyof T>(filter: (options: {entry: T, field: K, value: Primative}) => boolean) => {
    return (entry: T, field: K, value: Primative) => {
      return filter({entry, field, value})
    }
  }
  
  const is = compareFunction(({entry, field, value}) => {
    return entry[field] === value
  })

  const isnot = compareFunction(({entry, field, value}) => {
    return entry[field] !== value
  })

  const gt = compareFunction(({entry, field, value}) => {
    return entry[field] > value
  })

  const lt = compareFunction(({entry, field, value}) => {
    return entry[field] < value
  })

  const gte = compareFunction(({entry, field, value}) => {
    return entry[field] >= value
  })

  const lte = compareFunction(({entry, field, value}) => {
    return entry[field] <= value
  })

  const includes = arrayCompareFunction(({entry, field, value}) => {
    return (entry[field] as any).includes(value)
  })

  const compares: Filters<T> & ArrayFilters<T> = {
    is,
    isnot,
    gt,
    gte,
    lt,
    lte,
    includes
  }

  const add = (entry: T) => {
    lastInsertId += 1

    entries[lastInsertId] = entry

    if(options.index){
      storeIndex(entry, lastInsertId)
    }

    resetCache()

    return lastInsertId
  }

  const update = (entry: WithIndex<T>) => {
    if(changed(entry)){
      entries[entry.__id] = entry

      resetCache()
    }
  }

  const remove = (id: number | WithIndex<T>) => {
    if(typeof id === 'number'){
      delete entries[(id as number)]
    }else{
      delete entries[id.__id]
    }

    resetCache()
  }

  const all = () => {
    // This is a reduce instead of a map as map will return the empty records whereas reduce wont
    return entries.reduce<WithIndex<T>[]>((results, entry, i) => {
      results.push(addIndex(i))

      return results
    }, [])
  }

  const findOneById = (id: number) => {
    if(!entries[id]){
      return undefined
    }

    return addIndex(id)
  }

  const lookup = (value: Primative) => {
    return addIndex(index[value as any])
  }

  const findOne = (...searchObject: SearchObject<T>[]): WithIndex<T> => {
    return where(...searchObject)[0]
  }

  const where = (...searchObject: SearchObject<T>[]): WithIndex<T>[] => {
    const objects = entries.map((entry, id) => addIndex(id))

    if(!options.cache){
      return search(searchObject, objects)
    }
    
    const key = "sodb-" + SHA1(JSON.stringify(searchObject)).toString()

    return cacheKey(key, () => search(searchObject, objects))
  }

  const orderBy = <K extends keyof T>(field: K, ...searchObject: SearchObject<T>[]): WithIndex<T>[] => {
    const results = where(...searchObject)

    const key = "sodb-" + SHA1(JSON.stringify(searchObject)).toString() + "-order-" + field

    return cacheKey(key, () => {
      return results.sort((a, b) => {
        if(a[field] > b[field]){
          return 1
        }else if(a[field] < b[field]){
          return -1
        }else{
          return 0
        }
      })
    })
  }

  const refineSearch = (objects: WithIndex<T>[], ...searchObject: SearchObject<T>[]) => {
    return search(searchObject, objects)
  }

  const unique = <K extends keyof T>(field: K) => {
    return entries.reduce((unique, entry) => {
      if(!unique.includes(entry[field])){
        unique.push(entry[field])
      }

      return unique
    }, ([] as T[K][]))
  }

  const search = (search: SearchObject<T>[], objects: WithIndex<T>[]): WithIndex<T>[] => {
    return search.reduce((results, search) => {
      const {fn, value, field} = getCompare(search)

      return results.filter((entry) => {
        return fn(entry, field, value)
      })
    }, objects)
  }

  const getCompare = (search: SearchObject<T>): {method: keyof Filters<T>, value: any, field: keyof T, fn: FilterFunction<T>}  => {
    let method: keyof Filters<T>
    let value: any
    let fn = is
    const field = (Object.keys(search) as (keyof T)[])[0]

    if(typeof search[field] === "object"){
      method = (Object.keys(search[field] as any) as (keyof Filters<T>)[])[0]
      value = (search[field] as any)[method]
      fn = compares[method]
    }else if(typeof search[field] === 'function'){
      method = "is" // This isn't used
      fn = (search[field] as any)
    }else{
      method = "is"
      value = search[field]
    }

    return {
      method,
      value,
      field,
      fn
    }
  }

  const addIndex = (id: number) => {
    return Object.assign({__id: id}, entries[id])
  }

  const changed = (object: WithIndex<T>): boolean => {
    const base = entries[object.__id]

    return keys(base).reduce<boolean>((changed, key) => {
      if(changed){
        // Early return if an earlier property has changed
        return changed
      }

      changed = base[key] !== object[key]

      return changed
    }, false)
  }

  const count = () => {
    const getCount = () => {
      return all().length
    }

    if(options.cache){
      return cacheKey('sodb-count', () => getCount())
    }

    return getCount()
  }

  const toJson = (): string => {
    console.dir(entries)

    return JSON.stringify({
      options,
      entries
    })
  }

  return {
    add,
    update,
    remove,
    all,
    lookup,
    findOneById,
    findOne,
    where,
    orderBy,
    refineSearch,
    unique,
    changed,
    count,
    toJson
  }
}

export const fromJson = <T>(json: string): DB<T> => {
  const config = JSON.parse(json)

  const database = db<T>(config.entries, config.options)

  config.entries.forEach((entry: T, i: number) => {
    if(entry === null){
      database.remove(i)
    }
  })

  return database
}

export default db