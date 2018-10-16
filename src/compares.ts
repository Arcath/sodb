import {Entry} from './entry'

export type CompareFunction<T> = (field: string, value: any, objects: Entry<T>[]) => Entry<T>[]

export interface Compares<T>{
  [compare: string]: CompareFunction<T>
}

/*
* Comparison methods
*
* All compare methods take the same arguments:
*
* field - the field to test
* value - the value to compare to
* objects - all the entries
*/
export const getCompares = <T>(): Compares<T> => {
  return {
    is: (field, value, objects) => {
      return objects.filter((entry) => {
        return (entry[field] == value)
      })
    },
  
    gt: (field, value, objects) => {
      return objects.filter((entry) => {
        return (entry[field] > value)
      })
    },
  
    lt: (field, value, objects) => {
      return objects.filter((entry) => {
        return (entry[field] < value)
      })
    },
  
    gte: (field, value, objects) => {
      return objects.filter((entry) => {
        return (entry[field] >= value)
      })
    },
  
    lte: (field, value, objects) => {
      return objects.filter((entry) => {
        return (entry[field] <= value)
      })
    },
  
    isnot: (field, value, objects) => {
      return objects.filter((entry) => {
        return (entry[field] != value)
      })
    },
  
    includes: (field, value, objects) => {
      return objects.filter((entry) => {
        return (entry[field].indexOf(value) != -1)
      })
    },
  
    matches: (field, value, objects) => {
      return objects.filter((entry) => {
         return (value.test(entry[field]))
      })
    },
  
    func: (field, value, objects) => {
      return value(field, objects)
    },
  
    defined: (field, value, objects) => {
      return objects.filter((entry) => {
        let result = (entry[field] != undefined)
  
        return result === value
      })
    }
  }
}