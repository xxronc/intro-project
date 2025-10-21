import { expect } from "chai"
import { add as addRoom, get as getRooms, remove as removeRoom } from "../../lib/rooms.js"
import { add as addBuilding } from "../../lib/buildings.js"
import { add as addLandlord } from "../../lib/landlords.js"
import { run as runQuery } from "../../lib/db.js"

const roomsUrl = new URL( "http://localhost/api/rooms" )
const buildingsUrl = new URL( "http://localhost/api/buildings" )
const landlordsUrl = new URL( "http://localhost/api/landlords" )

describe( "rooms data access", () => {
  let buildingId

  beforeEach( async () => {
    await runQuery( "DELETE FROM rooms" )
    await runQuery( "DELETE FROM buildings" )
    await runQuery( "DELETE FROM landlords" )

    const landlord = await addLandlord( landlordsUrl, "PUT", { name: "Site Owner" } )
    const building = await addBuilding( buildingsUrl, "PUT", { name: "Tower", landlord_id: landlord.id } )
    buildingId = building.id
  } )

  it( "creates and retrieves a room", async () => {
    const created = await addRoom( roomsUrl, "PUT", {
      building_id: buildingId,
      name: "Suite 100",
      floor: "10",
      capacity: "25",
      notes: "Conference"
    } )

    expect( created.capacity ).to.equal( 25 )

    const list = await getRooms( roomsUrl )
    expect( list ).to.have.lengthOf( 1 )
    expect( list[ 0 ] ).to.include( {
      id: created.id,
      building_id: buildingId,
      name: "Suite 100"
    } )
    expect( list[ 0 ].capacity ).to.equal( 25 )
  } )

  it( "filters rooms by building", async () => {
    await addRoom( roomsUrl, "PUT", { building_id: buildingId, name: "Room A" } )
    const otherLandlord = await addLandlord( landlordsUrl, "PUT", { name: "Other Owner" } )
    const otherBuilding = await addBuilding( buildingsUrl, "PUT", { name: "Other Tower", landlord_id: otherLandlord.id } )
    await addRoom( roomsUrl, "PUT", { building_id: otherBuilding.id, name: "Room B" } )

    const filtered = await getRooms( new URL( `http://localhost/api/rooms?buildingId=${buildingId}` ) )
    expect( filtered ).to.have.lengthOf( 1 )
    expect( filtered[ 0 ].building_id ).to.equal( buildingId )
  } )

  it( "removes a room", async () => {
    const room = await addRoom( roomsUrl, "PUT", { building_id: buildingId, name: "Temp" } )
    await removeRoom( roomsUrl, "DELETE", { id: room.id } )

    const list = await getRooms( roomsUrl )
    expect( list ).to.be.empty
  } )
} )
