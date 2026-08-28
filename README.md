# node-gpx-server
client: localhost://viewer2 of wel ng9-gpx-client (en ng16-gpx-client)

node 12.12.0 of 13 of 17

## Starten

`npm start` (draait `node app/bin/www`, poort 3016). Zonder deze server draaiend blijft de
activiteitenlijst in de Angular-clients (ng9/ng16) leeg — de client haalt alles op via
`http://localhost:3016/gpx/...`.

`activitiesNewMap` (`~/Downloads/newactivities`) wordt bij het starten automatisch aangemaakt als
hij nog niet bestaat. `activitiesMap`/de csv-bestanden in `config.js` wijzen naar een NAS-share
(`/Volumes/NAS_Data/Data/garminconnect`); als die niet gemount is logt de server een waarschuwing
en blijft de lijst leeg (geen crash).

preferences intellij Node.js:
Node interpreter: 
Package manager: ~/.nvm/versions/node/v17.9.1/lib/node_modules/npm/bin/npm-cli.js

gegevens eventueel handmatig aanpassen in:  /Volumes/Data-1/Data/garminconnect/csv/ActivitiesOut.csv
door dit te laden in IntelliJ (met de geweldige plugin CSV editor geinstalleerd)

## Nieuwe activiteiten downloaden vanaf Garmin Connect

Op Garmin Connect zijn de namen van ongeregistreerde activiteiten rood. Om zo'n activiteit te
registreren, moeten er **twee** bestanden met exact dezelfde bestandsnaam
(`activity_<id>.gpx` en `activity_<id>.csv`) in `~/Downloads/newactivities` terechtkomen —
`app/lib/moveFiles.js` verplaatst ze pas naar `activitiesMap` als beide bestaan.

- Ga naar de detailspagina, bijv. https://connect.garmin.com/app/activity/24000100064
- Open het gear/toggle-menu rechtsboven op de activiteit → **Export to GPX**. Dit levert
  `activity_<id>.gpx` op met de juiste bestandsnaam.
- Scroll naar de Laps/Rondes-tabel op diezelfde pagina en gebruik het CSV-exportknopje daar (dit is
  een ander exportpad dan het gear-menu, en levert de tussentijden/snelheidsgegevens die
  `app/lib/meta.js`'s `addFromCsv` gebruikt). Het gedownloade bestand heeft niet automatisch de
  juiste naam — **hernoem het handmatig naar `activity_<id>.csv`** (zelfde id als de GPX).
- Kies/verplaats beide naar `~/Downloads/newactivities`.
- Herhaal per ongeregistreerde activiteit.
- Importeer door de client (ng16-gpx-client) op te starten of de activiteitenlijst te verversen —
  dat triggert `GET /gpx/list/all`, wat de import/enrich-pipeline in `app/lib/activities.js` draait.

De `../gpxviewer` Chrome-extensie hoort hier niet bij: die download niets, en linkt bovendien naar
`ng9-gpx-client` ("viewer2"), niet naar de huidige `ng16-gpx-client`. Er was ooit een los stukje
automatisering hiervoor (in eerdere versies van dit document "garmin grab" genoemd), maar de bron
daarvan is niet (meer) onderdeel van deze repo.

## build server with the angular client

- in angular.json, zet het pad op /Users/ares/Dev/node/node-gpx-server/app/dist/ng16-gpx-client
- ng build
- pas app.js aan met een statisch pad naar dist
- 
