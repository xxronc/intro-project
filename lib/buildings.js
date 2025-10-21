const db = require( "./db" )

/**
 * @typedef { Object } building
 * @property { number } id
 * @property { string } name
 * @property { number } landlord_id
 * @property { string } [ landlordname ]
 * @property { string } [ address ]
 * @property { string } [ city ]
 * @property { string } [ notes ]
 * @property { number } [ roomcount ]
 */

/**
 * Fetch buildings, optionally filtered by landlord id.
 * @param { URL } parsedurl
 * @returns { Promise< Array< building > > }
 */
async function get( parsedurl ) {
  const landlordId = parsedurl.searchParams.get( "landlordId" )
  let rows

  if ( landlordId ) {
    rows = await db.all( `
      SELECT b.id, b.name, b.landlord_id, b.address, b.city, b.notes,
             l.name AS landlordname,
             COUNT( r.id ) AS roomcount
      FROM buildings b
      INNER JOIN landlords l ON l.id = b.landlord_id
      LEFT JOIN rooms r ON r.building_id = b.id
      WHERE b.landlord_id = ?
      GROUP BY b.id
      ORDER BY b.name COLLATE NOCASE
    `, [ landlordId ] )
  } else {
    rows = await db.all( `
      SELECT b.id, b.name, b.landlord_id, b.address, b.city, b.notes,
             l.name AS landlordname,
             COUNT( r.id ) AS roomcount
      FROM buildings b
      INNER JOIN landlords l ON l.id = b.landlord_id
      LEFT JOIN rooms r ON r.building_id = b.id
      GROUP BY b.id
      ORDER BY b.name COLLATE NOCASE
    ` )
  }

  return rows.map( ( row ) => ( {
    id: row.id,
    name: row.name,
    landlord_id: row.landlord_id,
    landlordname: row.landlordname,
    address: row.address,
    city: row.city,
    notes: row.notes,
    roomcount: Number( row.roomcount )
  } ) )
}

/**
 * Insert or update a building record.
 * @param { URL } parsedurl
 * @param { string } method
 * @param { Partial< building > } building
 * @returns { Promise< building > }
 */
async function add( parsedurl, method, building ) { // eslint-disable-line no-unused-vars
  if ( !building || !building.name ) {
    throw new Error( "missing name" )
  }
  if ( !building.landlord_id ) {
    throw new Error( "missing landlord" )
  }

  if ( building.id ) {
    await db.run( `
      UPDATE buildings
      SET name = ?, landlord_id = ?, address = ?, city = ?, notes = ?
      WHERE id = ?
    `, [
      building.name,
      building.landlord_id,
      building.address || "",
      building.city || "",
      building.notes || "",
      building.id
    ] )

    const updated = await db.get( `
      SELECT b.id, b.name, b.landlord_id, b.address, b.city, b.notes, l.name AS landlordname
      FROM buildings b
      INNER JOIN landlords l ON l.id = b.landlord_id
      WHERE b.id = ?
    `, [ building.id ] )

    return {
      id: updated.id,
      name: updated.name,
      landlord_id: updated.landlord_id,
      landlordname: updated.landlordname,
      address: updated.address,
      city: updated.city,
      notes: updated.notes
    }
  }

  const result = await db.run( `
    INSERT INTO buildings ( name, landlord_id, address, city, notes )
    VALUES ( ?, ?, ?, ?, ? )
  `, [ building.name, building.landlord_id, building.address || "", building.city || "", building.notes || "" ] )

  const created = await db.get( `
    SELECT b.id, b.name, b.landlord_id, b.address, b.city, b.notes, l.name AS landlordname
    FROM buildings b
    INNER JOIN landlords l ON l.id = b.landlord_id
    WHERE b.id = ?
  `, [ result.lastID ] )

  return {
    id: created.id,
    name: created.name,
    landlord_id: created.landlord_id,
    landlordname: created.landlordname,
    address: created.address,
    city: created.city,
    notes: created.notes,
    roomcount: 0
  }
}

/**
 * Remove a building by id.
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } body
 * @returns { Promise< object > }
 */
async function remove( parsedurl, method, body ) { // eslint-disable-line no-unused-vars
  if ( !body || typeof body.id === "undefined" ) {
    throw new Error( "missing id" )
  }

  const existing = await db.get( `SELECT * FROM buildings WHERE id = ?`, [ body.id ] )
  if ( !existing ) throw new Error( "not found" )

  await db.run( `DELETE FROM buildings WHERE id = ?`, [ body.id ] )

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
