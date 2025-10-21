const db = require( "./db" )

/**
 * @typedef { Object } room
 * @property { number } id
 * @property { number } building_id
 * @property { string } name
 * @property { string } [ floor ]
 * @property { number | string | null } [ capacity ]
 * @property { string } [ notes ]
 * @property { string } [ buildingname ]
 */

/**
 * Fetch rooms, optionally filtered by building id.
 * @param { URL } parsedurl
 * @returns { Promise< Array< room > > }
 */
async function get( parsedurl ) {
  const buildingId = parsedurl.searchParams.get( "buildingId" )
  let rows

  if ( buildingId ) {
    rows = await db.all( `
      SELECT r.id, r.building_id, r.name, r.floor, r.capacity, r.notes,
             b.name AS buildingname
      FROM rooms r
      INNER JOIN buildings b ON b.id = r.building_id
      WHERE r.building_id = ?
      ORDER BY r.name COLLATE NOCASE
    `, [ buildingId ] )
  } else {
    rows = await db.all( `
      SELECT r.id, r.building_id, r.name, r.floor, r.capacity, r.notes,
             b.name AS buildingname
      FROM rooms r
      INNER JOIN buildings b ON b.id = r.building_id
      ORDER BY r.name COLLATE NOCASE
    ` )
  }

  return rows.map( ( row ) => ( {
    id: row.id,
    building_id: row.building_id,
    name: row.name,
    floor: row.floor,
    capacity: row.capacity === null || row.capacity === undefined ? null : Number( row.capacity ),
    notes: row.notes,
    buildingname: row.buildingname
  } ) )
}

/**
 * Insert or update a room record.
 * @param { URL } parsedurl
 * @param { string } method
 * @param { Partial< room > } room
 * @returns { Promise< room > }
 */
async function add( parsedurl, method, room ) { // eslint-disable-line no-unused-vars
  if ( !room || !room.name ) {
    throw new Error( "missing name" )
  }
  if ( !room.building_id ) {
    throw new Error( "missing building" )
  }

  const rawcapacity = room.capacity
  const isemptystring = typeof rawcapacity === "string" && rawcapacity.trim() === ""
  const capacity = rawcapacity == null || isemptystring
    ? null
    : Number( rawcapacity )

  if ( rawcapacity != null && !isemptystring && Number.isNaN( capacity ) ) {
    throw new Error( "invalid capacity" )
  }

  if ( room.id ) {
    await db.run( `
      UPDATE rooms
      SET name = ?, building_id = ?, floor = ?, capacity = ?, notes = ?
      WHERE id = ?
    `, [
      room.name,
      room.building_id,
      room.floor || "",
      capacity,
      room.notes || "",
      room.id
    ] )

    const updated = await db.get( `
      SELECT r.id, r.building_id, r.name, r.floor, r.capacity, r.notes,
             b.name AS buildingname
      FROM rooms r
      INNER JOIN buildings b ON b.id = r.building_id
      WHERE r.id = ?
    `, [ room.id ] )

    return {
      id: updated.id,
      building_id: updated.building_id,
      name: updated.name,
      floor: updated.floor,
      capacity: updated.capacity === null ? null : Number( updated.capacity ),
      notes: updated.notes,
      buildingname: updated.buildingname
    }
  }

  const result = await db.run( `
    INSERT INTO rooms ( name, building_id, floor, capacity, notes )
    VALUES ( ?, ?, ?, ?, ? )
  `, [ room.name, room.building_id, room.floor || "", capacity, room.notes || "" ] )

  const created = await db.get( `
    SELECT r.id, r.building_id, r.name, r.floor, r.capacity, r.notes,
           b.name AS buildingname
    FROM rooms r
    INNER JOIN buildings b ON b.id = r.building_id
    WHERE r.id = ?
  `, [ result.lastID ] )

  return {
    id: created.id,
    building_id: created.building_id,
    name: created.name,
    floor: created.floor,
    capacity: created.capacity === null ? null : Number( created.capacity ),
    notes: created.notes,
    buildingname: created.buildingname
  }
}

/**
 * Remove a room by id.
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } body
 * @returns { Promise< object > }
 */
async function remove( parsedurl, method, body ) { // eslint-disable-line no-unused-vars
  if ( !body || typeof body.id === "undefined" ) {
    throw new Error( "missing id" )
  }

  const existing = await db.get( `SELECT * FROM rooms WHERE id = ?`, [ body.id ] )
  if ( !existing ) throw new Error( "not found" )

  await db.run( `DELETE FROM rooms WHERE id = ?`, [ body.id ] )

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
