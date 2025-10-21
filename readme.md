# Running

To run the application, enter the following into your terminal

```
node ./index.js
```
To run tests on the application, enter the following into your terminal

```
npm test
```

Then point a browser to `http://localhost:3000`

# Changes
## Person Table Fixes
### What I Changed
1. Fixed editing functionality
2. Added delete button
3. Implemented toggleable scheduling cells

### Why I Changed It
1. It would not save changes that were made when editing a persons details
2. If a record needs to be removed, there should be an option to facilitate that
3. Before the schedule column was empty, so I populated it with cells for each day of the week, allowing users to see what days each person is available

### How I Changed It
1. 
    - editperson function (js/people.js) did not utilise update person (js/people.js)
2. 
    - Modified handleapi (lib/api.js) and added "DELETE" to calls constant
    - Added remove function to lib/people.js, allowing removal of a record via id
    - Added deletedata (js/api.js) function to send a "DELETE" request to the API
    - Added removeperson (js/people.js) function, utilisng remove and deletedata to remove a person's record from the database
3. 
    - Add schedule property; an array with all availability originally set to false
    - Added new toggleschedule (js/people.js) function allowing users to toggle which ever days the person is available
    - Added for loop (js/people.js - line 155) to populate each cell with a name, label and event listener.
    - Added extra styling for cells and feedback when toggling
---
## Adding a Database
### What I Changed
1. Added database

### Why I Changed It
1. Data was volatile. Now data will be stored locally and will not be deleted node.js is restarted

### How I Changed It
1. 
    - Added db.js which utilises SQL to store each record in data.db
    - Ensures all people are stored with their relevant data
    - Edited get (lib/people.js) function, displaying all person records directly from the database - ordered by name
    - Add and Remove (lib/people.js) also operate directly from the database using SQL
    - Added visual changes for improved readability
---
## Implementing Building and Landlord Tables
### What I Changed
1. Added landlord table
2. Added building table
3. Updated visuals

### Why I Changed It
1. Landlords was one of 2 new tables that had to be implemented
2. Buildings was the last of the 2 new tables that had to be implemented
3. To ensure users could switch through all 3 tables

### How I Changed It
1. 
    - Added landlord.js file (lib) to facilitate API requests
    - Added landlord.js (js) to add remove and update landlords
2. 
    - Added buildings.js file (lib) to facilitate API requests
    - Added buildings.js (js) to add remove and update buildings and rooms
    - Added rooms.js (lib) to handle the addition of rooms using the API requests to the database
3. 
    - Updated index.html to include new tables
    - Added new styling to styles.css

---
## Added Tests
### What I Changed
1. Installed Mocha, Chai, Sinon Jsdom
2. Added frontend tests
3. Added backend tests


### Why I Changed It
1. To facilitate testing of my code
2. To ensure the frontend code operated as expected
3. To ensure the backend code operated as expected

### How I Changed It
1. 
    - Ran command npm install --save-dev mocha chai sinon jsdom @babel/register to install them
    - Added setup.js to set up a test environment
2. 
    - Added dom.spec.js unit test to confirm DOM helpers findancestorbyclass and findancestorbytype locate the correct ancestor elements
    - Added from.spec.js validates form helpers: showform toggles visibility, clearform resets inputs/selects, and set/get field value round-trips
    - Added people.spec.js (frontend) to verify the people UI helper renders a table row with name and schedule cells and that scheduled cells show the correct day label
3. 
    - Added building.spec.js to test buildings CRUD, landlord association, filtering by landlord, and deletion
    - Added rooms.spec.js to verify rooms CRUD capacity parsing, filtering by building, and deletion
    - Added people.spec.js (backend) to validate people creation, update (including schedule array), retrieval, and removal
    - Added landlords.spec.js to check landlord CRUD, building count per landlord, and deletion

---
## Visual Overhaul
### What I Changed
1. Introduced a new header, hero and tab layout inspired by TalkingHealth
2. Restyled tables into card-like surfaces with refreshed colour palette and typography
3. Updated modals and buttons to match the new design language

### Why I Changed It
1. The previous layout looked a bit unattractive and unprofessional
2. Card style tables surface more context (emails, notes, availability) and feel more approachable
3. Consistent buttons and overlays improve usability when adding or editing records

### How I Changed It
1. Updated index.html with a sticky header, hero copy, filter toolbar and applied brand-inspired copy
2. Rebuilt styles.css around a design system (fonts, colours, spacing) and reworked the people table into a responsive grid with availability chips
3. Enhanced people.js to render richer person info blocks, tweaked form.js/buildings.js to use flex overlays, and refreshed tests to match the visual updates

<!-- 

# Example starter project

## Running

This is a complete Node application. It can be run from the command line or within a Docker container:

```
node ./index.js
```

Then point a browser to `http://localhost:3000`

## Fork

Please fork this repo before you start work. When you have completed your project we would like you to present your work.

## Tasks

Some tasks - choose as many or as few as you would like to complete.

1. Add some tests - a test suite such as Mocha will require adding. The Node backend functions require testing as well as front end functions.
2. The person table needs to be completed - at the very least complete the edit function.
2. Convert the backend to use a non-volatile data store - a simple option would be to build in support for SQLite to save data to a database.
3. We need to add further elements - Landlords and Buildings. Buildings require Rooms.
4. Consider the UI - can it be improved - what would you suggest?

## Gotchas

1. Style matters.
2. ESlint and Javascript checking are enabled in this project for VScode - keep an eye on this (you can check for linting errors by running ``` npx eslint index.js ``` ).
3. Show us your git etiquette. -->
