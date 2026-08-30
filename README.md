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

Automatisch (aanbevolen): `../garmin-sync/` (Playwright-script, zie dat project se README)
logt eenmalig interactief in en exporteert daarna onbemand per nog niet geregistreerde activity
zowel de GPX (`activity_<id>.gpx`) als een zelf-geschreven `activity_<id>.csv` naar
`~/Downloads/newactivities`. Dat laatste is geen download van Garmin's eigen CSV-exportknop — die
gebruikt Chrome's File System Access API, wat altijd een native "Save As"-dialoog opent en dus niet
automatiseerbaar is — maar wordt door `garmin-sync/statsCsv.js` zelf opgebouwd uit de vijf
statistiek-velden (Afstand/Tijd/Gemiddelde snelheid/Max. snelheid/Totale stijging) die toch al op
de activiteitenlijst staan, in exact het CSV-formaat dat hieronder beschreven staat.

Handmatig kan ook: ga naar de detailspagina, bijv. https://connect.garmin.com/app/activity/24000100064,
open het tandwiel/toggle-menu, en klik **Exporteer naar GPX**. Dit levert `activity_<id>.gpx` op
met de juiste bestandsnaam; verplaats naar `~/Downloads/newactivities`.

Een CSV is **niet vereist**: `app/lib/moveFiles.js` verplaatst de GPX ook zonder bijbehorende CSV,
en `app/lib/meta.js` leidt distance/duration dan uit de GPX zelf af in plaats van uit Garmin's
CSV-totalenrij. Zonder CSV blijven `speed`, `maxSpeed` en `elevation` echter volledig leeg (die
worden nergens uit ruwe GPX-data berekend) — vandaar dat `../garmin-sync/` er zelf een genereert. Wie het
liever handmatig doet: CSV-exportknopje op de Laps/Rondes-tabel van de activity-pagina, hernoemen
naar `activity_<id>.csv` in dezelfde map.

Activities die al zonder deze velden geïmporteerd zijn (bv. vóór de scraping-aanpak er was) kunnen
achteraf gepatcht worden met `../garmin-sync/backfillStats.js <activityId...> --write` — dat
patcht rechtstreeks in `ActivitiesOut.csv` (met een timestamped backup) i.p.v. via de normale
import-pipeline, omdat de GPX/JSON al lang verplaatst zijn.

**Importeren is een bewuste, losse stap** — het laden/verversen van de activiteitenlijst
(`GET /gpx/list/all`, ook bij het opstarten van ng16-gpx-client) doet dit *niet* meer automatisch.
Draai na het klaarzetten van bestanden in `newactivities`:

```
npm run import-new
```

(POST naar `/gpx/import`, draait de import/enrich-pipeline in `app/lib/activities.js` en verplaatst
de bestanden naar `activitiesMap` — zie `CLAUDE.md` voor de architectuur.)

De `../gpxviewer` Chrome-extensie hoort hier niet bij: die download niets, en linkt bovendien naar
`ng9-gpx-client` ("viewer2"), niet naar de huidige `ng16-gpx-client`.

### Bulk CSV-export (`connect.garmin.com/app/activities`) — geen vervanging hiervoor

Op de activiteitenlijst kun je met "Export CSV" alle metadata (behalve GPX-trackdata) in één keer
naar `Activities.csv` exporteren — maar alleen van de activiteiten die door infinite scroll al
geladen zijn. De server heeft hier al een import voor: `POST /gpx/importxls`
(`app/lib/csv_gpx.js`), aangeroepen via de knop "update list from csv" op het "Tools"-tabblad van
`ng9-gpx-client` (niet aanwezig in ng16). Let op: dit **registreert geen nieuwe activiteiten** —
het ververst alleen de metadata van activiteiten die al een GPX in `activitiesMap` hebben. Voor
nieuwe activiteiten blijft de stappen hierboven nodig. Deze route heeft bovendien een bekende bug
(zie `CLAUDE.md`) waardoor de refresh momenteel stil faalt.

## build server with the angular client

`app.js` serveert statisch vanaf `dist/ng16-gpx-client` (relatief aan deze repo-root, dus
`node-gpx-server/dist/ng16-gpx-client` — niet `app/dist/...`, dat is een stale pad uit een oudere
versie van deze README). `ng16-gpx-client/angular.json`'s `outputPath` staat hier al op gericht, en
wel relatief (`../node-gpx-server/dist/ng16-gpx-client`) zodat het op elke machine werkt zolang
`ng16-gpx-client` en `node-gpx-server` sibling-mappen blijven; dus gewoon:

- `ng build` in `ng16-gpx-client`
- geen aanpassing aan `app.js` nodig, die wijst al naar de juiste map
