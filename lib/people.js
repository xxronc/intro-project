


/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 * @property { Array<boolean> } [ schedule ] - Weekly schedule (optional).
 */

/**
 * @type { Array< person > }
 */
const people = [
  { id: 1, name: "Kermit Frog", email: "", notes:"" },
  { id: 2, name: "Miss Piggy", email: "", notes:"" },
]

/**
 * Demo function to return an array of people objects
 * @param { URL } parsedurl 
 * @returns { Promise< Array< person > > }
 */
async function get( parsedurl ) {
  return people
}

/**
 * Demo function adding a person
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add( parsedurl, method, person ) {

  if( undefined !== person.id ) {
    people.some( element => {
      if( element.id == person.id ) {
        element.name = person.name
        element.email = person.email
        element.notes = person.notes
        if ( typeof person.schedule !== "undefined" ) {
          element.schedule = person.schedule
        }
        return true
      }
      return false
    } )
    return person
  }

  person.id = people.reduce( ( maxid, obj ) => {
    return Math.max( maxid, obj.id )
  }, -Infinity ) + 1

  person.schedule = person.schedule || [ false, false, false, false, false, false, false ]

  people.push( person )

  return person
}

/**
 * Remove person by id
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } receivedobj - expects { id: number }
 * @returns { Promise< object | null > }
 */
async function remove( parsedurl, method, receivedobj ) {
  if ( !receivedobj || typeof receivedobj.id === "undefined" ) {
    return { error: "missing id" }
  }

  const id = receivedobj.id
  const index = people.findIndex( p => p.id == id )
  if ( index === -1 ) return { error: "not found" }

  const removed = people.splice( index, 1 )[ 0 ]
  return removed
}

module.exports = {
  get,
  add,
  remove
}