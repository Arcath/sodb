import {Cache} from './cache'
import {getCompares, CompareFunction, Compares} from './compares'
import {Entry, DefaultObject} from './entry'
import {Hash} from './hash'

export interface SODBOptions{
  cache: boolean
  index?: string
}

export type SearchInputs =
  string |
  number |
  boolean |
  string[] |
  number[]

export interface Search{
  [key: string]: SearchInputs | SearchObject
}

interface SearchObject{
  [key: string]: SearchInputs
}

export type SearchInput = Search[]

interface ExpandedSearch{
  field: string
  compareFunc: string
  value: SearchInputs
}

export class SODB<T = DefaultObject>{
  objects: Entry<T>[]
  lastInsertId: number
  cache: Cache
  options: SODBOptions
  index: {[key: string]: number}
  dbRevision: number
  compares: Compares<T>

  constructor(options: SODBOptions = {
    cache: false
  }){
    this.objects = []
    this.options = options
    this.dbRevision = 0
    this.index = {}
    this.lastInsertId = -1

    this.cache = new Cache(this.options.cache)
    this.compares = getCompares<T>()
  }


  /**
   * Adds an object to the database, incrementing the revision number and adding it to the index if enabled.
   * 
   * @param object The objet to add
   */
  add(object: T){
    this.lastInsertId += 1
    let newId = this.lastInsertId
    
    this.objects[newId] = new Entry(object, newId)

    if(this.options.cache){
      this.dbRevision += 1
    }
    
    if(this.options.index){
      this.index[(object as any)[this.options.index]] = newId
    }

    return this.unref(this.objects[newId])
  }

  /**
   * Find an object from the database
   * 
   * @param args a series of objects of type `Search`
   */
  where(...args: SearchInput){
    const search = args.map(this.expandQuery)

    return this.cache.hit(Hash.sha1(search), this.dbRevision, () => { return this.findResults(search) })
  }

  /**
   * Runs a find and sorts the results
   * 
   * @param search See `where` `args`
   * @param sort The field name to sort by
   */
  order(sort: string, ...search: SearchInput){
    let results = this.where(...search)

    return this.cache.hit(Hash.sha1([search, sort]), this.dbRevision, () => {
      return results.sort((a, b) => {
        if(a[sort] > b[sort]){
          return 1
        }else if(a[sort] < b[sort]){
          return -1
        }else{
          return 0
        }
      })
    })
  }

  /**
   * Performs the search and results an unrefed array of results.
   * 
   * @param search See `where` `args`
   */
  findResults(search: ExpandedSearch[]){
    const results = this.runSearch(this.objects, search)

    return results.map(this.unref)
  }

  runSearch(results: Entry<T>[], searches: ExpandedSearch[]){
    searches.forEach((search) => {
      results = this.runCondition(search.field, search.compareFunc, search.value, results)
    })

    return results
  }

  /**
   * Takes an exisitng set of results and refines them.
   * 
   * @param results The current set of results
   * @param args See `where` `args`
   */
  refineSearch(results: Entry<T>[], ...args: SearchInput){
    let search = args.map(this.expandQuery)

    let refined = this.runSearch(results, search)

    return refined.map(this.unref)
  }

  /**
   * Runs `where` and returns the first result
   * 
   * @param search See `where` `args`
   */
  findOne(...search: SearchInput){
    return this.where(...search)[0]
  }

  indexLookup(key: string){
    if(this.objects[this.index[key]]){
      return this.unref(this.objects[this.index[key]])
    }

    return undefined
  }

  unref(entry: Entry<T>){
    return new Entry(entry.object, entry.___id)
  }

  /**
   * 
   * @param field The field to compare
   * @param compare The compare function to use
   * @param value the value to comapre against
   * @param objects The list of objects to compare against
   */
  runCondition(field: string, compare: string, value: SearchInputs, objects: Entry<T>[]){
    let func = this.compares[compare]

    if(Array.isArray(value)){
      let results: Entry<T>[] = []

      let i = 0

      while(i < value.length){
        this.join(results, func(field, value[i], (objects as any)))
        i += 1
      }

      return results
    }

    return func(field, value, (objects as any))
  }

  /**
   * Merge two lists of entries
   * 
   * @param current The current list of entries
   * @param additions The new entries to join
   */
  join(current: Entry<T>[], additions: Entry<T>[]){
    let ids = current.map((value) => {
      return value.___id
    })

    additions.forEach((entry) => {
      if(ids.indexOf(entry.___id) === -1){
        current.push(entry)
      }
    })

    return current
  }

  expandQuery(search: Search): ExpandedSearch{
    let field = Object.keys(search)[0]

    let compareFunc: string
    let value: SearchInputs

    if(typeof search[field] !== 'object'){
      compareFunc = 'is'
      value = search[field] as SearchInputs
    }else{
      compareFunc = Object.keys(search[field])[0]
      let comparison = search[field] as SearchObject
      value = comparison[compareFunc]
    }

    return {
      field,
      compareFunc,
      value
    }
  }

  /**
   * Update the supplied entry in the database
   * 
   * @param entry The entry to save
   */
  update(entry: Entry<T>){
    if(entry.changed()){
      entry.updateObject()
      this.objects[entry.___id] = entry

      if(this.options.cache){
        this.dbRevision += 1
      }
    }

    return this.unref(entry)
  }

  remove(entry: Entry<T>){
    delete this.objects[entry.___id]

    if(this.options.cache){
      this.dbRevision += 1
    }
  }

  /**
   * Count all active records
   */
  count(){
    return this.all().length
  }

  /**
   * Returns all entries
   */
  all(){
    return this.cache.hit('find-all', this.dbRevision, () => { return this.findAll() })
  }

  /**
   * Returns all entries
   */
  findAll(){
    // Unlike map foreach appears to filter out deleted objects by itself, saving the need for an if statement.

    let results: Entry<T>[] = []
    this.objects.forEach((object) => {
      results.push(this.unref(object))
    })

    return results
  }

  unique(field: string){
    return this.cache.hit('unique-' + field, this.dbRevision, () => { return this.findUnique(field) })
  }

  findUnique(field: string){
    let results: string[] = []
    this.objects.forEach((object) => {
      if(object && results.indexOf(object[field]) == -1 && object[field] != undefined){
        results.push(object[field])
      }
    })

    return results
  }

  /**
   * Get one object by ID
   * 
   * @param id The ID to return
   */
  get(id: number){
    return this.findOne({___id: id})
  }

  /** Get the entry last added to the database */
  getLast(){
    return this.get(this.lastInsertId)
  }

  addCompare(name: string, func: CompareFunction<T>){
    this.compares[name] = func
  }

  /** Output the current database as JSON */
  toJSON(){
    return JSON.stringify({objects: this.objects, lastInsertId: this.lastInsertId})
  }
}

export const buildFromJSON = <T = DefaultObject>(json: string, options: SODBOptions) => {
  let data = JSON.parse(json)
  let db = new SODB<T>(options)
  data.objects.forEach((object: {___id: number, object: T}) => { 
    if(object){
      db.objects[object.___id] = new Entry<T>(object.object, object.___id)
    }
  })

  db.lastInsertId = data.lastInsertId

  return db
}

export default SODB