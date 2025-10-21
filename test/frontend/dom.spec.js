import { expect } from "chai"
import { findancestorbyclass, findancestorbytype } from "../../public/js/dom.js"

describe( "dom helpers", () => {
  beforeEach( () => {
    resetDom( `<!doctype html><html><body>
      <div class="outer">
        <section class="wrapper">
          <article class="card">
            <button id="target"></button>
          </article>
        </section>
      </div>
    </body></html>` )
  } )

  it( "finds ancestor by class name", () => {
    const button = document.getElementById( "target" )
    const ancestor = findancestorbyclass( button, "wrapper" )
    expect( ancestor ).to.be.ok
    expect( ancestor.classList.contains( "wrapper" ) ).to.be.true
  } )

  it( "finds ancestor by tag type", () => {
    const button = document.getElementById( "target" )
    const ancestor = findancestorbytype( button, "section" )
    expect( ancestor.tagName.toLowerCase() ).to.equal( "section" )
  } )
} )
