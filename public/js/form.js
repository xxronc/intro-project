

let formsubmitcallback
document.addEventListener( "DOMContentLoaded", async function() {

  const closeelements = document.querySelectorAll( ".close" )
  closeelements.forEach( element => {
    element.addEventListener( "click", ( e ) => {
      e.preventDefault()
      closallforms()
    } )
  } )

  const formelements = document.querySelectorAll( "form" )
  formelements.forEach( element => {
    element.addEventListener( "submit", ( e ) => {
      e.preventDefault()

      document.getElementById( "content" ).style.display = "block"
      // @ts-ignore (it is part of HTML Element)
      element.parentNode.style.display = "none"

      if ( formsubmitcallback ) {
        const result = formsubmitcallback()
        formsubmitcallback = undefined
        if ( result && typeof result.then === "function" ) {
          result.catch( ( err ) => console.error( "Form submission error", err ) )
        }
      }
    } )
  } )
} )

/**
 * Hide all divs with class container and show main content
 */
function closallforms() {
  document.querySelectorAll( "div.container" ).forEach( ( element ) => {
    // @ts-ignore
    element.style.display = "none"
  } )
  document.getElementById( "content" ).style.display = "block"
}

/**
 * Show form by id name
 * @param { string } formid 
 */
export function showform( formid, onsubmit ) {
  document.getElementById( "content" ).style.display = "none"

  const form = document.getElementById( formid )
  form.style.display = "flex"

  formsubmitcallback = onsubmit
}

/**
 * 
 * @param { string } formitemid 
 */
export function getformfieldvalue( formitemid ) {
  // @ts-ignore (it does!)
  return document.getElementById( formitemid ).value
}

/**
 * 
 * @param { string } formitemid
 * @param { string } value
 */
export function setformfieldvalue( formitemid, value ) {
  // @ts-ignore (it does!)
  document.getElementById( formitemid ).value = value
}


/**
 * 
 * @param { string } formid 
 */
export function clearform( formid ) {
  const form = document.getElementById( formid )

  form.querySelectorAll( "input" ).forEach( ( input ) => input.value = "" )
  form.querySelectorAll( "textarea" ).forEach( ( input ) => input.value = "" )
  form.querySelectorAll( "select" ).forEach( ( select ) => {
    if ( select.options.length > 0 ) {
      select.selectedIndex = 0
    }
  } )
}

/**
 * 
 * @param { string } formid
 * @returns { HTMLTableSectionElement }
 */
export function gettablebody( formid ) {
  return document.getElementById( formid ).getElementsByTagName( "tbody" )[ 0 ]
}

/**
 * 
 * @param { string } formid 
 */
export function cleartablerows( formid ) {
  
  const table = document.getElementById( formid )

  const rows = table.getElementsByTagName( "tr" )
  for( let i = rows.length - 1; i > 0; i-- ) {
    // @ts-ignore
    table.deleteRow( i )
  }
}