Node TSSSF thing

# Protocol:

## `getName` &darr;
Requests a name from the client.
* `msg` message to display, may indicate why last name was invalid.

## `rooms` &darr;
Displays a list of rooms to the client.
* `rooms` list of room objects.

## `join` &darr;
Indicate a user is joining a room
* `client` User object for the user who is joining
* `room` Room object that the user is joining

## `join` &uarr;
Request to the server to join the specified room
* `room` Id of the room the user wishes to join

## `leave` &darr;
Indicate a user is leaving a room.
* `client` User object for the user who is leaving
* `room` Room object that the user is leaving

## `clients` &darr;
Lists the users inside a room. Sent to a client when they join a room.
* `clients` List of users inside the Room
* `room` Room the users are in

## `self` &darr;
Indicate the connected user's own id
* `client` User object corresponding to the connected user.
