const db = require( "./db" )

/**
 * @typedef { Object } landlord
 * @property { number } id
 * @property { string } name
 * @property { string } [ email ]
 * @property { string } [ phone ]
 * @property { string } [ notes ]
 * @property { number } [ buildingcount ]
 */

/**
 * Retrieve all landlords with building counts.
 * @returns { Promise< Array< landlord > > }
 */
async function get() {
  const rows = await db.all( `
    SELECT l.id, l.name, l.email, l.phone, l.notes,
           COUNT( b.id ) AS buildingcount
    FROM landlords l
    LEFT JOIN buildings b ON b.landlord_id = l.id
    GROUP BY l.id
    ORDER BY l.name COLLATE NOCASE
  ` )

  return rows.map( ( row ) => ( {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    buildingcount: Number( row.buildingcount )
  } ) )
}

/**
 * Create or update a landlord record.
 * @param { URL } parsedurl
 * @param { string } method
 * @param { Partial< landlord > } landlord
 * @returns { Promise< landlord > }
 */
async function add( parsedurl, method, landlord ) { // eslint-disable-line no-unused-vars
  if ( !landlord || !landlord.name ) {
    throw new Error( "missing name" )
  }

  if ( landlord.id ) {
    await db.run( `
      UPDATE landlords
      SET name = ?, email = ?, phone = ?, notes = ?
      WHERE id = ?
    `, [ landlord.name, landlord.email || "", landlord.phone || "", landlord.notes || "", landlord.id ] )

    const updated = await db.get( `SELECT * FROM landlords WHERE id = ?`, [ landlord.id ] )
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      notes: updated.notes
    }
  }

  const result = await db.run( `
    INSERT INTO landlords ( name, email, phone, notes )
    VALUES ( ?, ?, ?, ? )
  `, [ landlord.name, landlord.email || "", landlord.phone || "", landlord.notes || "" ] )

  const created = await db.get( `SELECT * FROM landlords WHERE id = ?`, [ result.lastID ] )
  return {
    id: created.id,
    name: created.name,
    email: created.email,
    phone: created.phone,
    notes: created.notes
  }
}

/**
 * Remove a landlord by id.
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } body
 * @returns { Promise< object > }
 */
async function remove( parsedurl, method, body ) { // eslint-disable-line no-unused-vars
  if ( !body || typeof body.id === "undefined" ) {
    throw new Error( "missing id" )
  }

  const existing = await db.get( `SELECT * FROM landlords WHERE id = ?`, [ body.id ] )
  if ( !existing ) throw new Error( "not found" )

  await db.run( `DELETE FROM landlords WHERE id = ?`, [ body.id ] )

  return {
    id: existing.id,
    name: existing.name
  }
}

module.exports = {
  get,
  add,
  remove
}
