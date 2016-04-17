Node TSSSF thing

# Protocol:

## `self` &darr;
Indicate the connected user's own id. Sent when connected
* `client` User object corresponding to the connected user.

## `getName` &darr;
Requests a name from the client.
* `msg` message to display, may indicate why last name was invalid.

## `name` &uarr;
Responds to the `getName` request.
* `name` the name the client wishes to use.

## `rooms` &darr;
Displays a list of rooms to the client.
* `rooms` list of room objects.

## `join` &uarr;
Request to the server to join the specified room
* `room` Id of the room the user wishes to join

## `join` &darr;
Indicate a user is joining a room
* `client` User object for the user who is joining
* `room` Room object that the user is joining

## `clients` &darr;
Lists the users inside a room. Sent to a client when they join a room.
* `clients` List of users inside the Room
* `room` Room the users are in

## `leave` &darr;
Indicate a user is leaving a room.
* `client` User object for the user who is leaving
* `room` Room object that the user is leaving

## `owner` &darr;
Indicate a change of room ownership
* `owner` User object of the new owner
* `room` Room object the change corosponds to
