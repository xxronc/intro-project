import { expect } from "chai"
import { add as addLandlord, get as getLandlords, remove as removeLandlord } from "../../lib/landlords.js"
import { run as runQuery } from "../../lib/db.js"

const apiUrl = new URL( "http://localhost/api/landlords" )

describe( "landlords data access", () => {
  beforeEach( async () => {
    await runQuery( "DELETE FROM rooms" )
    await runQuery( "DELETE FROM buildings" )
    await runQuery( "DELETE FROM landlords" )
  } )

  it( "creates and retrieves a landlord", async () => {
    const payload = {
      name: "Acme Holdings",
      email: "info@acme.test",
      phone: "123-555-0000",
      notes: "Friendly"
    }

    const created = await addLandlord( apiUrl, "PUT", payload )
    expect( created ).to.include( { name: "Acme Holdings" } )

    const list = await getLandlords( apiUrl )
    expect( list ).to.have.lengthOf( 1 )
    expect( list[ 0 ] ).to.include( {
      id: created.id,
      email: payload.email,
      phone: payload.phone
    } )
    expect( list[ 0 ].buildingcount ).to.equal( 0 )
  } )

  it( "counts buildings per landlord", async () => {
    const landlord = await addLandlord( apiUrl, "PUT", { name: "Mega Estates" } )

    await runQuery( "INSERT INTO buildings ( name, landlord_id ) VALUES ( ?, ? )", [ "Building 1", landlord.id ] )
    await runQuery( "INSERT INTO buildings ( name, landlord_id ) VALUES ( ?, ? )", [ "Building 2", landlord.id ] )

    const list = await getLandlords( apiUrl )
    expect( list[ 0 ].buildingcount ).to.equal( 2 )
  } )

  it( "removes a landlord", async () => {
    const landlord = await addLandlord( apiUrl, "PUT", { name: "Delete Me" } )
    await removeLandlord( apiUrl, "DELETE", { id: landlord.id } )

    const list = await getLandlords( apiUrl )
    expect( list ).to.be.empty
  } )
} )
