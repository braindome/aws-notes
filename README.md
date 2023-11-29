# notes API


|Endpoint|Metod|Beskrivning|
|---|---|---|
|`/api/notes`|`GET`|Get notes (belonging to signed in user)|
|`/api/notes`|`POST`|Post note|
|`/api/notes`|`PUT`|Edit a note|
|`/api/notes`|`DELETE`|Delete a note (soft)|
|`/api/user/signup`|`POST`|Create account|
|`/api/user/login`|`POST`|Log in|
|`/api/restore`|`POST`|Restore deleted note|
|`/api/trash`|`GET`|Retrieve a list of deleted notes|

**Note - objekt**

|Nyckel|Värde|Beskrivning|
|---|---|---|
|`id`|`String`|Ett genererat ID för denna anteckning.|
|`title`|`String`|Titeln på anteckningen. Max 50 tecken.|
|`text`|`String`|Själva anteckningstexten, max 300 tecken.|
|`createdAt`|`Date`|När anteckningen skapades.|
|`modifiedAt`|`Date`|När anteckningen sist modifierades.|
|`isDeleted`|`Boolean`|Soft delete function.|
|`userId`|`String`|Ownership management.|

## Getting started

* Create account: POST request `/api/user/signup`
```json
{
  "username": "phil",
  "password": "test123",
  "firstName": "Phil",
  "lastName": "Leotardo"
}
```

* Login: POST request `/api/user/login`
```json
{
  "username": "phil",
  "password": "test123"
}
```

then copy token from response and use it in all other interactions.

* Add a note: POST request, endpoint `/api/notes`
```json
{
  "title": "Example title",
  "text": "Example text"
}
```

* Get all of signed in user's notes: GET request, endpoint `/api/notes`. No json body.
* Get a list of deleted notes: GET request, endpoint `/api/trash`. No json body.

* Edit a note: PUT request `/api/notes`
```json
  {
  "id": "c45d3035-dd0f-4cf8-90f2-5a6a7ee4efe5",
  "title": "Title to edit",
  "text": "Example text to edit"
}
```

* Delete and restore a note: DELETE request `/api/notes` || Restore a previously deleted note: POST request `/api/restore`
```json
{
  "id": "c45d3035-dd0f-4cf8-90f2-5a6a7ee4efe5"
}
```



