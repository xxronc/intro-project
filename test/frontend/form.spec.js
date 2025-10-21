let formModule

const BASE_HTML = `<!doctype html><html><body>
  <div id="content" style="display:block"></div>
  <div id="personform" class="container" style="display:none;">
    <form>
      <input id="personform-name" value="Alice" />
      <input id="personform-email" value="alice@example.com" />
      <textarea id="personform-notes">Note</textarea>
      <button type="submit">Save</button>
    </form>
  </div>
  <div id="landlordform" class="container" style="display:none;">
    <form>
      <input id="landlordform-name" value="Landlord" />
      <select id="landlordform-select">
        <option value="1" selected>One</option>
        <option value="2">Two</option>
      </select>
    </form>
  </div>
</body></html>`

describe( "form helpers", () => {
  before( async () => {
    resetDom( BASE_HTML )
    formModule = await import( "../../public/js/form.js" )
  } )

  beforeEach( () => {
    resetDom( BASE_HTML )
  } )

  it( "showform hides content and shows target form", () => {
    formModule.showform( "personform", () => {} )
    expect( document.getElementById( "content" ).style.display ).to.equal( "none" )
    expect( document.getElementById( "personform" ).style.display ).to.equal( "flex" )
  } )

  it( "clearform blanks input, textarea and select", () => {
    formModule.clearform( "personform" )
    expect( document.getElementById( "personform-name" ).value ).to.equal( "" )
    expect( document.getElementById( "personform-email" ).value ).to.equal( "" )
    expect( document.getElementById( "personform-notes" ).value ).to.equal( "" )
    formModule.clearform( "landlordform" )
    expect( document.getElementById( "landlordform-select" ).selectedIndex ).to.equal( 0 )
  } )

  it( "setformfieldvalue and getformfieldvalue round trip", () => {
    formModule.setformfieldvalue( "personform-name", "Bob" )
    const value = formModule.getformfieldvalue( "personform-name" )
    expect( value ).to.equal( "Bob" )
  } )
} )
