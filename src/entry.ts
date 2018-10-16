export interface DefaultObject{
  [key: string]: any
}

export class Entry<T = DefaultObject>{
  [key: string]: any  
  ___id: number
  object: T

  /**
   * A wrapper for objects contained in an SODB
   * @param object the object
   * @param id the id in the database (SODB Internal)
   */
  constructor(object: T, id: number){
    this.object = object
    this.___id = id

    Object.keys(this.object).forEach((key) =>{
      this[key] = (this.object as any)[key]
    })
  }

  /** Returns all the keys on the object */
  keys(){
    let keys = Object.keys(this.object)

    return keys
  }

  /**
   * Itterates through the objects keys
   */
  changed(){
    let changed = false
    this.keys().forEach((key) => {
      if(this[key] !== (this.object as any)[key]){
        changed = true
      }
    })

    return changed
  }

  updateObject(){
    this.keys().forEach((key) => {
      (this.object as any)[key] = this[key]
    })
  }
}