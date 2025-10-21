import { getdata, putdata, deletedata } from "./api.js"
import { showform, clearform, gettablebody, cleartablerows, getformfieldvalue, setformfieldvalue } from "./form.js"
import { findancestorbytype } from "./dom.js"
import { getlandlords, refreshlandlords } from "./landlords.js"

let buildingcache = []
let currentroomsbuilding = null

document.addEventListener( "DOMContentLoaded", async () => {
  const addbuildingbutton = document.getElementById( "add-building" )
  if ( addbuildingbutton ) {
    addbuildingbutton.addEventListener( "click", () => {
      openbuildingform().catch( ( err ) => console.error( "Unable to open building form", err ) )
    } )
  }

  const addroombutton = document.getElementById( "add-room" )
  if ( addroombutton ) {
    addroombutton.addEventListener( "click", () => openroomform() )
  }

  const drawerclose = document.querySelector( "#roomsdrawer .close" )
  if ( drawerclose ) {
    drawerclose.addEventListener( "click", () => {
      currentroomsbuilding = null
    } )
  }

  await reloadbuildings()
} )

async function fetchbuildings() {
  const data = await getdata( "buildings" )
  return Array.isArray( data ) ? data : []
}

async function savebuilding( payload ) {
  await putdata( "buildings", payload )
}

async function deletebuilding( id ) {
  await deletedata( "buildings", { id } )
}

async function reloadbuildings() {
  buildingcache = await fetchbuildings()
  cleartablerows( "buildingstable" )

  const tbody = gettablebody( "buildingstable" )
  buildingcache.forEach( ( building ) => addbuildingrow( tbody, building ) )
}

function showroomsdrawercontainer() {
  document.getElementById( "content" ).style.display = "none"
  const drawer = document.getElementById( "roomsdrawer" )
  if ( drawer ) {
    drawer.style.display = "flex"
  }
}

function hideroomsdrawer() {
  const drawer = document.getElementById( "roomsdrawer" )
  if ( drawer ) {
    drawer.style.display = "none"
  }
}

function addbuildingrow( tbody, building ) {
  const row = tbody.insertRow()
  row.building = building

  const namecell = row.insertCell()
  const landlordcell = row.insertCell()
  const addresscell = row.insertCell()
  const citycell = row.insertCell()
  const notescell = row.insertCell()
  const roomscell = row.insertCell()
  const actionscell = row.insertCell()

  namecell.textContent = building.name
  landlordcell.textContent = building.landlordname || ""
  addresscell.textContent = building.address || ""
  citycell.textContent = building.city || ""
  notescell.textContent = building.notes || ""

  const managebutton = document.createElement( "button" )
  managebutton.type = "button"
  managebutton.textContent = `Manage (${building.roomcount || 0})`
  managebutton.addEventListener( "click", () => openroomsdrawer( building ) )
  roomscell.appendChild( managebutton )

  const editbutton = document.createElement( "button" )
  editbutton.type = "button"
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editbuilding )

  const deletebutton = document.createElement( "button" )
  deletebutton.type = "button"
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", removebuilding )

  actionscell.appendChild( editbutton )
  actionscell.appendChild( document.createTextNode( " " ) )
  actionscell.appendChild( deletebutton )
}

async function populateLandlordSelect( selectedId ) {
  const select = /** @type {HTMLSelectElement | null} */ ( document.getElementById( "buildingform-landlord" ) )
  if ( !select ) return

  const landlords = await getlandlords( true )
  select.innerHTML = ""

  const placeholder = document.createElement( "option" )
  placeholder.value = ""
  placeholder.textContent = "Select landlord"
  select.appendChild( placeholder )

  landlords.forEach( ( landlord ) => {
    const option = document.createElement( "option" )
    option.value = String( landlord.id )
    option.textContent = landlord.name
    if ( selectedId && Number( selectedId ) === landlord.id ) {
      option.selected = true
    }
    select.appendChild( option )
  } )

  if ( selectedId && !select.value ) {
    select.value = String( selectedId )
  }
}

async function openbuildingform( building = null ) {
  clearform( "buildingform" )
  await populateLandlordSelect( building ? building.landlord_id : null )

  if ( building ) {
    setformfieldvalue( "buildingform-name", building.name )
    setformfieldvalue( "buildingform-address", building.address || "" )
    setformfieldvalue( "buildingform-city", building.city || "" )
    setformfieldvalue( "buildingform-notes", building.notes || "" )
  }

  showform( "buildingform", async () => {
    const landlordIdValue = getformfieldvalue( "buildingform-landlord" )
    if ( !landlordIdValue ) {
      alert( "Please select a landlord" )
      return
    }

    const name = getformfieldvalue( "buildingform-name" ).trim()
    if ( !name ) {
      alert( "Name is required" )
      return
    }

    const address = getformfieldvalue( "buildingform-address" ).trim()
    const city = getformfieldvalue( "buildingform-city" ).trim()
    const notes = getformfieldvalue( "buildingform-notes" ).trim()

    const payload = {
      name,
      landlord_id: Number( landlordIdValue ),
      address,
      city,
      notes
    }

    if ( building ) {
      payload.id = building.id
    }

    await savebuilding( payload )
    await reloadbuildings()
    await refreshlandlords()
  } )
}

function editbuilding( event ) {
  const row = findancestorbytype( event.target, "tr" )
  if ( !row || !row.building ) return

  openbuildingform( row.building ).catch( ( err ) => console.error( "Unable to open building form", err ) )
}

async function removebuilding( event ) {
  const row = findancestorbytype( event.target, "tr" )
  if ( !row || !row.building ) return

  if ( !confirm( `Delete ${row.building.name}? Rooms will also be removed.` ) ) return

  await deletebuilding( row.building.id )
  if ( currentroomsbuilding && currentroomsbuilding.id === row.building.id ) {
    currentroomsbuilding = null
    hideroomsdrawer()
    const content = document.getElementById( "content" )
    if ( content ) {
      content.style.display = "block"
    }
  }
  await reloadbuildings()
  await refreshlandlords()
}

function openroomsdrawer( building ) {
  currentroomsbuilding = building
  const title = document.getElementById( "roomsdrawer-title" )
  if ( title ) {
    title.textContent = `Rooms for ${building.name}`
  }

  showroomsdrawercontainer()
  loadrooms().catch( ( err ) => console.error( "Unable to load rooms", err ) )
}

async function fetchrooms( buildingId ) {
  const data = await getdata( `rooms?buildingId=${buildingId}` )
  return Array.isArray( data ) ? data : []
}

async function saveroom( payload ) {
  await putdata( "rooms", payload )
}

async function deleteroom( id ) {
  await deletedata( "rooms", { id } )
}

async function loadrooms() {
  if ( !currentroomsbuilding ) return

  const rooms = await fetchrooms( currentroomsbuilding.id )
  const tbody = gettablebody( "roomstable" )
  while ( tbody.firstChild ) {
    tbody.removeChild( tbody.firstChild )
  }

  rooms.forEach( ( room ) => addroomrow( tbody, room ) )
}

function addroomrow( tbody, room ) {
  const row = tbody.insertRow()
  row.room = room

  const namecell = row.insertCell()
  const floorcell = row.insertCell()
  const capacitycell = row.insertCell()
  const notescell = row.insertCell()
  const actionscell = row.insertCell()

  namecell.textContent = room.name
  floorcell.textContent = room.floor || ""
  capacitycell.textContent = room.capacity == null ? "" : String( room.capacity )
  notescell.textContent = room.notes || ""

  const editbutton = document.createElement( "button" )
  editbutton.type = "button"
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editroom )

  const deletebutton = document.createElement( "button" )
  deletebutton.type = "button"
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", removeroom )

  actionscell.appendChild( editbutton )
  actionscell.appendChild( document.createTextNode( " " ) )
  actionscell.appendChild( deletebutton )
}

function openroomform( room = null ) {
  if ( !currentroomsbuilding ) return

  clearform( "roomform" )
  setformfieldvalue( "roomform-building", String( currentroomsbuilding.id ) )

  if ( room ) {
    setformfieldvalue( "roomform-name", room.name )
    setformfieldvalue( "roomform-floor", room.floor || "" )
    setformfieldvalue( "roomform-capacity", room.capacity == null ? "" : String( room.capacity ) )
    setformfieldvalue( "roomform-notes", room.notes || "" )
  }

  hideroomsdrawer()
  showform( "roomform", async () => {
    const name = getformfieldvalue( "roomform-name" ).trim()
    if ( !name ) {
      alert( "Name is required" )
      return
    }

    const floor = getformfieldvalue( "roomform-floor" ).trim()
    const capacityValue = getformfieldvalue( "roomform-capacity" ).trim()
    const notes = getformfieldvalue( "roomform-notes" ).trim()

    const payload = {
      building_id: Number( getformfieldvalue( "roomform-building" ) ),
      name,
      floor,
      capacity: capacityValue,
      notes
    }

    if ( room ) {
      payload.id = room.id
    }

    await saveroom( payload )
    showroomsdrawercontainer()
    await loadrooms()
    await reloadbuildings()
  } )
}

function editroom( event ) {
  const row = findancestorbytype( event.target, "tr" )
  if ( !row || !row.room ) return

  openroomform( row.room )
}

async function removeroom( event ) {
  const row = findancestorbytype( event.target, "tr" )
  if ( !row || !row.room ) return

  if ( !confirm( `Delete room ${row.room.name}?` ) ) return

  await deleteroom( row.room.id )
  await loadrooms()
  await reloadbuildings()
}
