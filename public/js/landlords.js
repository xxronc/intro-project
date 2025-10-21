import { getdata, putdata, deletedata } from "./api.js"
import { showform, clearform, gettablebody, cleartablerows, getformfieldvalue, setformfieldvalue } from "./form.js"
import { findancestorbytype } from "./dom.js"

let landlordcache = []

/**
 * Expose landlord cache to other modules.
 * @param { boolean } force
 * @returns { Promise< Array< object > > }
 */
export async function getlandlords( force = false ) {
  if ( force || landlordcache.length === 0 ) {
    landlordcache = await fetchlandlords()
  }
  return landlordcache
}

document.addEventListener( "DOMContentLoaded", async () => {
  const addbutton = document.getElementById( "add-landlord" )
  if ( addbutton ) {
    addbutton.addEventListener( "click", () => openlandlordform() )
  }

  await reloadlandlords()
} )

async function fetchlandlords() {
  const data = await getdata( "landlords" )
  return Array.isArray( data ) ? data : []
}

async function savelandlord( payload ) {
  await putdata( "landlords", payload )
}

async function deletelandlord( id ) {
  await deletedata( "landlords", { id } )
}

export async function refreshlandlords() {
  await reloadlandlords()
}

async function reloadlandlords() {
  landlordcache = await fetchlandlords()
  cleartablerows( "landlordstable" )

  const tbody = gettablebody( "landlordstable" )
  landlordcache.forEach( ( landlord ) => addlandlordrow( tbody, landlord ) )
}

function addlandlordrow( tbody, landlord ) {
  const row = tbody.insertRow()
  row.landlord = landlord

  const namecell = row.insertCell()
  const emailcell = row.insertCell()
  const phonecell = row.insertCell()
  const notescell = row.insertCell()
  const buildingcountcell = row.insertCell()
  const actionscell = row.insertCell()

  namecell.textContent = landlord.name
  emailcell.textContent = landlord.email || ""
  phonecell.textContent = landlord.phone || ""
  notescell.textContent = landlord.notes || ""
  buildingcountcell.textContent = String( landlord.buildingcount || 0 )

  const editbutton = document.createElement( "button" )
  editbutton.type = "button"
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editlandlord )

  const deletebutton = document.createElement( "button" )
  deletebutton.type = "button"
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", removelandlord )

  actionscell.appendChild( editbutton )
  actionscell.appendChild( document.createTextNode( " " ) )
  actionscell.appendChild( deletebutton )
}

function openlandlordform() {
  clearform( "landlordform" )
  showform( "landlordform", async () => {
    const name = getformfieldvalue( "landlordform-name" ).trim()
    if ( !name ) {
      alert( "Name is required" )
      return
    }

    await savelandlord( {
      name,
      email: getformfieldvalue( "landlordform-email" ).trim(),
      phone: getformfieldvalue( "landlordform-phone" ).trim(),
      notes: getformfieldvalue( "landlordform-notes" ).trim()
    } )
    await reloadlandlords()
  } )
}

function editlandlord( event ) {
  const row = findancestorbytype( event.target, "tr" )
  if ( !row || !row.landlord ) return

  const landlord = row.landlord
  clearform( "landlordform" )
  setformfieldvalue( "landlordform-name", landlord.name )
  setformfieldvalue( "landlordform-email", landlord.email || "" )
  setformfieldvalue( "landlordform-phone", landlord.phone || "" )
  setformfieldvalue( "landlordform-notes", landlord.notes || "" )

  showform( "landlordform", async () => {
    const name = getformfieldvalue( "landlordform-name" ).trim()
    if ( !name ) {
      alert( "Name is required" )
      return
    }

    await savelandlord( {
      id: landlord.id,
      name,
      email: getformfieldvalue( "landlordform-email" ).trim(),
      phone: getformfieldvalue( "landlordform-phone" ).trim(),
      notes: getformfieldvalue( "landlordform-notes" ).trim()
    } )
    await reloadlandlords()
  } )
}

async function removelandlord( event ) {
  const row = findancestorbytype( event.target, "tr" )
  if ( !row || !row.landlord ) return

  if ( !confirm( `Delete ${row.landlord.name}? Buildings will also be removed.` ) ) return

  await deletelandlord( row.landlord.id )
  await reloadlandlords()
}