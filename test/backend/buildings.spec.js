import { expect } from "chai"
import { add as addBuilding, get as getBuildings, remove as removeBuilding } from "../../lib/buildings.js"
import { add as addLandlord } from "../../lib/landlords.js"
import { run as runQuery } from "../../lib/db.js"

const buildingsUrl = new URL( "http://localhost/api/buildings" )
const landlordsUrl = new URL( "http://localhost/api/landlords" )

describe( "buildings data access", () => {
  let landlordId

  beforeEach( async () => {
    await runQuery( "DELETE FROM rooms" )
    await runQuery( "DELETE FROM buildings" )
    await runQuery( "DELETE FROM landlords" )

    const landlord = await addLandlord( landlordsUrl, "PUT", { name: "Property Group" } )
    landlordId = landlord.id
  } )

  it( "creates and retrieves a building", async () => {
    const payload = {
      name: "Central Plaza",
      landlord_id: landlordId,
      address: "1 Main St",
      city: "Metropolis",
      notes: "Corporate HQ"
    }

    const created = await addBuilding( buildingsUrl, "PUT", payload )
    expect( created.landlordname ).to.equal( "Property Group" )

    const list = await getBuildings( buildingsUrl )
    expect( list ).to.have.lengthOf( 1 )
    expect( list[ 0 ] ).to.include( {
      id: created.id,
      name: payload.name,
      landlord_id: landlordId,
      address: payload.address,
      city: payload.city
    } )
  } )

  it( "filters buildings by landlord", async () => {
    await addBuilding( buildingsUrl, "PUT", { name: "Central", landlord_id: landlordId } )
    const otherLandlord = await addLandlord( landlordsUrl, "PUT", { name: "Other" } )
    await addBuilding( buildingsUrl, "PUT", { name: "Other Building", landlord_id: otherLandlord.id } )

    const filtered = await getBuildings( new URL( "http://localhost/api/buildings?landlordId=" + landlordId ) )
    expect( filtered ).to.have.lengthOf( 1 )
    expect( filtered[ 0 ].landlord_id ).to.equal( landlordId )
  } )

  it( "removes a building", async () => {
    const building = await addBuilding( buildingsUrl, "PUT", { name: "Demolish", landlord_id: landlordId } )
    await removeBuilding( buildingsUrl, "DELETE", { id: building.id } )

    const list = await getBuildings( buildingsUrl )
    expect( list.find( ( b ) => b.id === building.id ) ).to.be.undefined
  } )
} )
