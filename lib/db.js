const path = require( "path" )
const sqlite3 = require( "sqlite3" ).verbose()

const dbpath = path.join( __dirname, "..", "data.db" )
const db = new sqlite3.Database( dbpath )

db.serialize( () => {
  db.run( "PRAGMA foreign_keys = ON" )
  db.run( `CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT DEFAULT "",
    notes TEXT DEFAULT "",
    schedule TEXT DEFAULT "[]"
  )` )
  db.run( `CREATE TABLE IF NOT EXISTS landlords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT DEFAULT "",
    phone TEXT DEFAULT "",
    notes TEXT DEFAULT ""
  )` )
  db.run( `CREATE TABLE IF NOT EXISTS buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    landlord_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    address TEXT DEFAULT "",
    city TEXT DEFAULT "",
    notes TEXT DEFAULT "",
    FOREIGN KEY ( landlord_id ) REFERENCES landlords( id ) ON DELETE CASCADE
  )` )
  db.run( `CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    floor TEXT DEFAULT "",
    capacity INTEGER,
    notes TEXT DEFAULT "",
    FOREIGN KEY ( building_id ) REFERENCES buildings( id ) ON DELETE CASCADE
  )` )
} )

function run( sql, params = [] ) {
  return new Promise( ( resolve, reject ) => {
    db.run( sql, params, function ( err ) {
      if ( err ) reject( err )
      else resolve( { lastID: this.lastID, changes: this.changes } )
    } )
  } )
}

function all( sql, params = [] ) {
  return new Promise( ( resolve, reject ) => {
    db.all( sql, params, ( err, rows ) => {
      if ( err ) reject( err )
      else resolve( rows )
    } )
  } )
}

function get( sql, params = [] ) {
  return new Promise( ( resolve, reject ) => {
    db.get( sql, params, ( err, row ) => {
      if ( err ) reject( err )
      else resolve( row )
    } )
  } )
}

module.exports = {
  run,
  all,
  get
}