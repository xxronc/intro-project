import { expect } from "chai"
import { get as getPeople, add as addPerson, remove as removePerson } from "../../lib/people.js"
import { run as runQuery } from "../../lib/db.js"

const apiUrl = new URL( "http://localhost/api/people" )

describe( "people data access", () => {
  beforeEach( async () => {
    await runQuery( "DELETE FROM people" )
  } )

  it( "creates and retrieves a person with schedule", async () => {
    const payload = {
      name: "Fozzie Bear",
      email: "fozzie@example.com",
      notes: "Comedian",
      schedule: [ true, false, true, false, true, false, false ]
    }

    const created = await addPerson( apiUrl, "PUT", payload )

    expect( created.id ).to.be.a( "number" )
    expect( created.schedule ).to.deep.equal( payload.schedule )

    const list = await getPeople( apiUrl )
    expect( list ).to.have.lengthOf( 1 )
    expect( list[ 0 ] ).to.include( {
      id: created.id,
      name: payload.name,
      email: payload.email,
      notes: payload.notes
    } )
    expect( list[ 0 ].schedule ).to.deep.equal( payload.schedule )
  } )

  it( "updates an existing person", async () => {
    const created = await addPerson( apiUrl, "PUT", {
      name: "Gonzo",
      email: "gonzo@example.com",
      notes: "Original"
    } )

    const updated = await addPerson( apiUrl, "PUT", {
      id: created.id,
      name: "Great Gonzo",
      email: "gonzo@example.com",
      notes: "Stunt performer",
      schedule: [ false, true, false, true, false, true, false ]
    } )

    expect( updated.name ).to.equal( "Great Gonzo" )

    const list = await getPeople( apiUrl )
    expect( list[ 0 ].name ).to.equal( "Great Gonzo" )
    expect( list[ 0 ].schedule[ 1 ] ).to.be.true
  } )

  it( "removes a person", async () => {
    const created = await addPerson( apiUrl, "PUT", {
      name: "Scooter",
      email: "scooter@example.com",
      notes: "Stage manager"
    } )

    await removePerson( apiUrl, "DELETE", { id: created.id } )

    const list = await getPeople( apiUrl )
    expect( list ).to.be.empty
  } )
} )
