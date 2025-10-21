

import { deletedata, getdata, putdata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"

const DAY_CELL_OFFSET = 1 
const WEEK_DAYS = 7
// Abbreviated day names, ordered Monday..Sunday to match schedule array
const DAY_NAMES = [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ]

document.addEventListener( "DOMContentLoaded", async function() {

  document.getElementById( "addperson" ).addEventListener( "click", addpersoninput )
  await gopeople()
} )


/**
 * 
 * @returns { Promise< object > }
 */
async function fetchpeople() {
  return await getdata( "people" )
}

/**
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addperson( name, email, notes ) {
  await putdata( "people", { name, email, notes } )
}

/**
 * 
 * @param { string } id 
 * @param { string } name 
 * @param { string } email 
 * @param { string } notes 
 */
async function updateperson( id, name, email, notes, schedule ) {
  await putdata( "people", { id, name, email, notes, schedule } )
}



/**
 * @returns { Promise }
 */
async function gopeople() {
  const p = await fetchpeople()
  cleartablerows( "peopletable" )

  for( const pi in p ) {
    addpersondom( p[ pi ] )
  }
}

/**
 * 
 */
function addpersoninput() {

  clearform( "personform" )
  showform( "personform", async () => {

    await addperson(  getformfieldvalue( "personform-name" ), 
                      getformfieldvalue( "personform-email" ), 
                      getformfieldvalue( "personform-notes" ) )
    await gopeople()
  } )
}

/**
 * 
 */
function editperson( ev ) {

  clearform( "personform" )
  const personrow = findancestorbytype( ev.target, "tr" )
  setformfieldvalue( "personform-name", personrow.person.name )
  setformfieldvalue( "personform-email", personrow.person.email )
  setformfieldvalue( "personform-notes", personrow.person.notes )
  
  showform( "personform", async () => {

    await updateperson(
                      personrow.person.id,
                      getformfieldvalue( "personform-name" ),
                      getformfieldvalue( "personform-email" ),
                      getformfieldvalue( "personform-notes" ) )
    await gopeople()
  } )
  }

  async function removeperson( ev ) {

    clearform( "personform" )
    const personrow = findancestorbytype( ev.target, "tr" )

    if ( !personrow || !personrow.person ) return

    if ( !confirm( `Delete ${personrow.person.name}?` ) ) return

    await deletedata( "people", { id: personrow.person.id } )
    await gopeople()
  }

  // Toggle a day in the schedule and persist
async function toggleschedule( ev ) {
  const td = findancestorbytype( ev.target, "td" )
  const row = findancestorbytype( td, "tr" )
  if ( !row || !row.person ) return

  const person = row.person
  // Ensure schedule is Monday-first
  person.schedule = person.schedule || Array.from( { length: WEEK_DAYS }, () => false )

  // determine day index: cells[0] = name, cells[1..7] = Monday..Sunday
  const cells = Array.from( row.cells )
  const dayIndex = cells.indexOf( td ) - DAY_CELL_OFFSET
  if ( dayIndex < 0 || dayIndex >= WEEK_DAYS ) return

  person.schedule[ dayIndex ] = !person.schedule[ dayIndex ]

  // update UI class
  td.classList.toggle( "scheduled", !!person.schedule[ dayIndex ] )

  await updateperson( person.id, person.name, person.email, person.notes, person.schedule )
}

export function addpersondom( person ) {

  const table = gettablebody( "peopletable" )
  const newrow = table.insertRow()

  const cells = []
  for( let i = 0; i < ( 2 + 7 ); i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  // @ts-ignore
  newrow.person = person

  const infocontainer = document.createElement( "div" )
  infocontainer.className = "person-info"

  const nameelement = document.createElement( "span" )
  nameelement.className = "person-name"
  nameelement.textContent = person.name
  infocontainer.appendChild( nameelement )

  const metacontainer = document.createElement( "div" )
  metacontainer.className = "person-meta"

  if ( person.email ) {
    const emaillink = document.createElement( "a" )
    emaillink.href = `mailto:${person.email}`
    emaillink.textContent = person.email
    emaillink.rel = "noopener"
    metacontainer.appendChild( emaillink )
  } else {
    const noemail = document.createElement( "span" )
    noemail.textContent = "No email provided"
    metacontainer.appendChild( noemail )
  }

  const schedulehint = document.createElement( "span" )
  schedulehint.textContent = "Tap days to toggle availability"
  metacontainer.appendChild( schedulehint )

  infocontainer.appendChild( metacontainer )

  const noteselement = document.createElement( "p" )
  noteselement.className = "person-notes"
  noteselement.textContent = person.notes ? person.notes : "No notes added yet."
  infocontainer.appendChild( noteselement )

  cells[ 0 ].innerHTML = ""
  cells[ 0 ].appendChild( infocontainer )

  // schedule stuff - ensure Monday-first ordering
  person.schedule = person.schedule || Array.from( { length: WEEK_DAYS }, () => false )

  // populate 7 day cells (cells[1]..cells[7] => Monday..Sunday)
  for ( let d = 0; d < WEEK_DAYS; d++ ) {
    const dayCell = cells[ DAY_CELL_OFFSET + d ]

    // Add an abbreviated day label inside the cell (Mon, Tue, ...)
    const dayName = DAY_NAMES[ d ] || ""
    const label = document.createElement( "span" )
    label.className = "day-label"
    label.textContent = dayName

    // Ensure the cell is empty then add the label (we'll use the td.scheduled class
    // to indicate scheduled days via background color)
    dayCell.innerHTML = ""
    dayCell.appendChild( label )

    // make schedule cells smaller and centered
    dayCell.classList.add( "schedule-cell" )

    dayCell.classList.toggle( "scheduled", !!person.schedule[ d ] )
    dayCell.dataset.dayIndex = String( d ) // helpful for debugging
    dayCell.dataset.dayName = dayName
    dayCell.addEventListener( "click", toggleschedule )
  }

  // ...existing code for edit/delete buttons...
  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editperson )

  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", removeperson )

  cells[ 8 ].appendChild( editbutton )
  cells[ 8 ].appendChild( deletebutton )
}