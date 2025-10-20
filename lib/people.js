const db = require( "./db" )

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
  const rows = await db.all( "SELECT * FROM people ORDER BY name" )
  return rows.map( row => ( { 
    id: row.id,
    name: row.name,
    email: row.email,
    notes: row.notes,
    schedule: JSON.parse( row.schedule || "[]" )
  } ) )
}

/**
 * Demo function adding a person
 * @param { string } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add( parsedurl, method, person ) {

  const schedule = JSON.stringify( person.schedule || [ false, false, false, false, false, false, false ] )

  if( undefined !== person.id ) {
    await db.run(
      "UPDATE people SET name = ?, email = ?, notes = ?, schedule = ? WHERE id = ?",
      [ person.name, person.email, person.notes, schedule, person.id ]
    )
    const updated = await db.get( "SELECT * FROM people WHERE id = ?", [ person.id ] )
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      notes: updated.notes,
      schedule: JSON.parse( updated.schedule || "[]" )
    }
  }

  const result = await db.run(
    "INSERT INTO people ( name, email, notes, schedule ) VALUES ( ?, ?, ?, ? )",
    [ person.name, person.email, person.notes, schedule ]
  )

  const created = await db.get( "SELECT * FROM people WHERE id = ?", [ result.lastID ] )
  return {
    id: created.id,
    name: created.name,
    email: created.email,
    notes: created.notes,
    schedule: JSON.parse( created.schedule || "[]" )
  }
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

  const existing = await db.get( "SELECT * FROM people WHERE id = ?", [ receivedobj.id ] )
  if ( !existing ) return { error: "not found" }

  await db.run( "DELETE FROM people WHERE id = ?", [ receivedobj.id ] )

  return {
    id: existing.id,
    name: existing.name,
    email: existing.email,
    notes: existing.notes,
    schedule: JSON.parse( existing.schedule || "[]" )
  }
}

module.exports = {
  get,
  add,
  remove
}