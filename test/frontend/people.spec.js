let peopleModule

const PEOPLE_HTML = `<!doctype html><html><body>
  <div id="content"></div>
  <button id="addperson"></button>
  <table id="peopletable">
    <tbody></tbody>
  </table>
  <div id="personform" class="container" style="display:none;">
    <form>
      <input id="personform-name" />
      <input id="personform-email" />
      <textarea id="personform-notes"></textarea>
      <button type="submit">Save</button>
    </form>
  </div>
</body></html>`

describe( "people UI helpers", () => {
  before( async () => {
    resetDom( PEOPLE_HTML )
    peopleModule = await import( "../../public/js/people.js" )
  } )

  beforeEach( () => {
    resetDom( PEOPLE_HTML )
  } )

  it( "adds a row with schedule cells", () => {
    const schedule = [ true, false, false, false, false, false, false ]
    peopleModule.addpersondom( {
      id: 1,
      name: "Tester",
      email: "test@example.com",
      notes: "",
      schedule
    } )

    const row = document.querySelector( "#peopletable tbody tr" )
    expect( row ).to.exist
    expect( row.cells[ 0 ].textContent ).to.equal( "Tester" )
    const scheduledCells = row.querySelectorAll( "td.scheduled" )
    expect( scheduledCells.length ).to.equal( 1 )
    expect( scheduledCells[ 0 ].querySelector( ".day-label" ).textContent ).to.equal( "Mon" )
  } )
} )
