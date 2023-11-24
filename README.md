# notes API

**OBS** Vid inlämning så ska en config fil till insomnia finnas med. I insomnia spara era olika requests till alla olika endpoints, exportera config filen och inkudera den i era projekt

## Instruktioner

Du ska i denna övning göra ett API för att spara anteckningar. Anteckningarna är kopplade till specifik användare, så det ska bara gå att komma åt anteckningar som är kopplade till den just nu inloggade användaren. Du ska använda middy som middleware för att skydda de endpoints som kräver inloggning.

### Tekniker

API Gateway Lambda Dynamodb Middy

### Endpoints

Alla endpoints förutom skapa konto och logga in kräver att man är inloggad.

|Endpoint|Metod|Beskrivning|
|---|---|---|
|`/api/notes`|`GET`|Get notes (belonging to signed in user)|
|`/api/notes`|`POST`|Post note|
|`/api/notes`|`PUT`|Edit a note|
|`/api/notes`|`DELETE`|Delete a note (soft)|
|`/api/user/signup`|`POST`|Create account|
|`/api/user/login`|`POST`|Log in|
|`/api/restore`|`POST`|Restore deleted note|

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


### Felhantering

Alla API-resurser ska returnera JSON och/eller en HTTP statuskod:

**200 (OK)** - Om servern lyckats med att göra det som resursen motsvarar.
**400 (Bad request)** - Om requestet är felaktigt gjort, så att servern inte kan fortsätta. Exempel: Att frontend skickar med felaktig data i body till servern.
**401 (Unauthorized)** - Om giltig inloggning inte finns
**404 (Not found)** - Om resursen eller objektet som efterfrågas inte finns.
**500 (internal server error)** - Om ett fel inträffar på servern. Använd catch för att fånga det.

### Betygskriterier

**G:** För godkänta ska API:et fungera enligt ovan.
**VG:** För vg ska dessutom en återställningsfunktionalitet implementeras: Skapa funktionalitet för användare att återställa borttagna anteckningar. Alla indata till alla endpoints ska även valideras.
