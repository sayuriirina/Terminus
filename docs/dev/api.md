Room API
========

#  CREATE ROOMS, ITEMS and PEOPLES
* newRoom(room, img, props) set a new room variable named $room
* var item=$room.newItem(id, img)
* var people=$room.newPeople(id, img)

Note : creating $home is required , in order to define path '~/', and command 'cd'.

## Rooms parameters

*  id : non 'room_' part of a key 'room_{id}' in GameDialogs file
* img : img file in image directory
* props : hash with many optionnal properties like executable, readable, writable
 
GameDialogs file shall contain :

* room_{roomid} :      the name of the room
* room_{roomid}_text : the description of what happening in the room

## Items and peoples
*  non 'item_' (or 'people_') part of a key 'item_{id}' in GameDialogs file
* img : img file in image directory
* props : hash with many optionnal properties like executable, readable, writable

GameDialogs file shall contain :

* item_{id}   :      the name of the item
* ( people_{id} :      the name of the person 
* item_{id}_text   : a description
* ( - people_{id}_text : a description )
 
 
# CONNECT ROOMS
```
$room.addPath($other_room)
```
 
#  PROMPTS IN THE ROOM
## Starting game in the room
If the player start a game or load it from saved state,
you can display a message for the room she/he starts.

Default is the result of `pwd`.
```
$room.setStarterMsg("Welcome !");
```

## Entering in the room
```
$room.setEnterCallback(function(){
// the code to display a message
});
```
## Leaving the room
```
$room.setLeaveCallback(function(){
// the code to display a message
});
```
#  DEFINING A TEXT AS RESULT OF A COMMAND
```
$room.setCmdText({cmd_name},{cmd_result})
item.setCmdText({cmd_name},{cmd_result})
```
