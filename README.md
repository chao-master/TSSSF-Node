Node TSSSF thing

# Protocol:

## Handshake

### `self` &darr;
Sent when connected. Indicates the connected user's own id.
* `client` Connected user's client information.

### `getName` &darr;
Requests a name from the client.
* `msg` message to display, may indicate why last name was invalid.

### `name` &uarr;
Responds to the `getName` request.
* `name` the name the client wishes to use.

### `rooms` &darr;
Displays a list of rooms to the client.
* `rooms` list of room objects.

## Room Related

### `join` &uarr;
Request to the server to join the specified room
* `room` Id of the room the user wishes to join

### `join` &darr;
Indicate a user is joining a room
* `client` User object for the user who is joining
* `room` Room object that the user is joining

### `clients` &darr;
Lists the users inside a room. Sent to a client when they join a room.
* `clients` List of users inside the Room
* `room` Room the users are in

### `leave` &darr;
Indicate a user is leaving a room.
* `client` User object for the user who is leaving
* `room` Room object that the user is leaving

## `owner` &darr;
Indicate a change of room ownership
* `owner` User object of the new owner
* `room` Room object the change corresponds to

## `chat` &uaddr;
Sends a chat message to the room
* `msg` Chat message being Sent

## `chat` &darr;
Indicates a chat message has been received
* `msg` Chat message that was received
* `client` User object of whom sent the chat

## Game Related

### `cardList` &darr;
Lists the cards that will be used in the game
* `cardList` The list of cards
* `room` The current room

### `gridState` &darr;
The grid as it currently stands
* `grid` An array of card id's and their position in the grid

### `playCards` &uarr;
Cards the client is playing
* `cards` list of the cards the client is playing, identified by id and position
* `triggeredCard` The id of the card who's effect is triggered
* `params` The paramaters for the triggered card's effect, see effects below.

## Misc & Debug

### reSyncGrid &uarr;
Requests the server to resend `gridState`

## Effects
### Draw
 1. `pony` or `ship` - The deck the card is to be drawn from.
