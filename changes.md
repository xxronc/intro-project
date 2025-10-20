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

### How Changed It
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

### How Changed It
1. 
    - Added db.js which utilises SQL to store each record in data.db
    - Ensures all people are stored with their relevant data
    - Edited get (lib/people.js) function, displaying all person records directly from the database - ordered by name
    - Add and Remove (lib/people.js) also operate directly from the database using SQL
    - Added visual changes for improved readability 