***Changes***
**Person Table Fixes**
*What I Changed*
1. Fixed editing functionality
2. Added delete button

*How Changed It*
1. editperson function (js/people.js) did not utilise update person (js/people.js)
2. Modified handleapi (lib/api.js) and added "DELETE" to calls constant
2. Added remove function to lib/people.js, allowing removal of a record via id
2. Added deletedata (js/api.js) function to send a "DELETE" request to the API
2. Added removeperson (js/people.js) function, utilisng remove and deletedata to remove a person's record from the database

*Why I Changed It*
1. It would not save changes that were made when editing a persons details
2. If a record needs to be removed, there should be an option to facilitate that