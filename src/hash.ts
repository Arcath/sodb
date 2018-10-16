import {SHA1} from 'crypto-js'

export const Hash = {
  sha1: (object: object) => {
    let string = JSON.stringify(object)

    let hash = SHA1(string)

    return hash.toString()
  }
}
