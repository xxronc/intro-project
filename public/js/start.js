
import "./people.js"
import "./landlords.js"
import "./buildings.js"
import "./form.js"


document.addEventListener( "DOMContentLoaded", function() {
  configurepeopleheaders()
  setupTabs()
} )


const daynames = [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ]

function configurepeopleheaders() {
  let currentdate = new Date()

  // Calculate the difference in days between the current day and Monday (considering Monday as the first day of the week, where Sunday is 0)
  let dayofweek = currentdate.getDay()
  let daysuntilmonday = ( dayofweek === 0 ) ? 6 : ( 1 - dayofweek )

  // Adjust the date to Monday of this week
  currentdate.setDate( currentdate.getDate() + daysuntilmonday )

  const days = document.getElementsByClassName( "days" )
  const selectors = [ ".day-1", ".day-2", ".day-3", ".day-4", ".day-5", ".day-6", ".day-7" ]
  for ( let i = 0; i < days.length; i++ ) {
    const rowdate = new Date( currentdate )
    for ( let d = 0; d < selectors.length; d++ ) {
      const cell = days[ i ].querySelector( selectors[ d ] )
      if ( cell ) {
        const dayIndex = rowdate.getDay() === 0 ? 6 : rowdate.getDay() - 1
        cell.textContent = `${daynames[ dayIndex ]} ${rowdate.getDate()}`
      }
      rowdate.setDate( rowdate.getDate() + 1 )
    }

    const nameHeader = days[ i ].querySelector( "th:first-child" )
    if ( nameHeader ) {
      nameHeader.textContent = "Name"
    }

    const actionHeader = days[ i ].querySelector( "th:last-child" )
    if ( actionHeader ) {
      actionHeader.textContent = "Actions"
    }
  }
}

function setupTabs() {
  /** @type {NodeListOf<HTMLButtonElement>} */
  const buttons = document.querySelectorAll( ".tab-button" )
  /** @type {NodeListOf<HTMLElement>} */
  const panels = document.querySelectorAll( ".tab-panel" )

  buttons.forEach( ( button ) => {
    button.addEventListener( "click", () => {
      const targetId = button.dataset.tab || ""

      buttons.forEach( ( btn ) => {
        const isActive = btn === button
        btn.classList.toggle( "active", isActive )
        btn.setAttribute( "aria-selected", isActive ? "true" : "false" )
      } )

      panels.forEach( ( panel ) => {
        const isActive = panel.id === targetId
        panel.classList.toggle( "active", isActive )
        panel.setAttribute( "aria-hidden", isActive ? "false" : "true" )
      } )
    } )
  } )
}