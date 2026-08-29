# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Node/Express backend for viewing and managing GPX activity tracks (from Garmin Connect). It serves
the built `ng16-gpx-client` (Angular) statically and exposes a REST + WebSocket API that both
`ng16-gpx-client` and the older `ng9-gpx-client` ("viewer2") consume. Node 12/13/17. See
`../CLAUDE.md` for how the four sibling projects in this repo relate.

The `../gpxviewer` Chrome extension is unrelated to importing: it's just a one-click link from a
Garmin Connect activity page to `ng9-gpx-client` ("viewer2") for *previewing* an already-imported
track. It downloads nothing and doesn't target `ng16-gpx-client`. Supplying new activities is a
manual, per-activity download step — see below.

## Commands

- `npm start` — runs `node app/bin/www`, listens on port 3016 (`config.js`). Must be running for
  either Angular client to show activities — without it, activity lists stay empty/retry forever.
- `npm run pcopy` — copies `plist/ares/nl.jcroonen.gpxserver.plist` to `~/Library/LaunchAgents`
  (macOS launchd service, target label `nl.jcroonen.gpxserver`).
- `npm run pload` / `npm run punload` — load/unload the launchd service.
- `npm run pstart` / `npm run pstop` — start/stop the launchd service.
- `npm run plist` — list running launchd jobs matching `jcroonen`.

No test runner or lint script is configured.

## Architecture

**Data source of truth is the filesystem, not a database.** All paths live in `config.js`:
- `activitiesMap` — the canonical folder of imported `.gpx` files (+ generated `.json` sidecars),
  under a NAS share (`/Volumes/NAS_Data/Data/garminconnect/activities` by default).
- `activitiesCsvFile` / `outputFile` — CSV exports from Garmin Connect (`Activities.csv`,
  `ActivitiesOut.csv`) holding per-activity metadata (distance, duration, speed, etc).
- `activitiesNewMap` — a drop folder (`~/Downloads/newactivities`) where freshly-exported GPX/CSV
  files land before being imported; `config.js` creates this directory on startup if missing, and
  logs a warning if the NAS-backed `activitiesMap` root is unreachable (so a misconfigured/
  unmounted share fails loud instead of just returning an empty list).

**Supplying new activities**: files land in `activitiesNewMap` manually, not automatically — see
`README.md` for the exact steps. In short: on Garmin Connect, unregistered activities show in red;
per activity you need *two* same-named files in `~/Downloads/newactivities`
(`activity_<id>.gpx` + `activity_<id>.csv`) — `app/lib/moveFiles.js` only moves a GPX once its
matching CSV also exists. The GPX comes from the activity page's gear/toggle menu ("Export to
GPX"); the CSV comes from a *different* export button on that same page's Laps/Splits table, and
must be renamed by hand to match the GPX's id (Garmin's own filename won't match). The import/
enrich pipeline below then picks both up the next time `GET /gpx/list/all` runs (i.e. next time a
client loads or refreshes its activity list).

**Import/enrich pipeline** (`app/lib/activities.js`, triggered by `GET /gpx/list/all`):
1. Read the existing `outputFile` CSV (`readCsvRaw`, `app/lib/csv.js`).
2. Scan `activitiesNewMap` for new GPX files (`getAllGpx`, `app/lib/gpx.js`).
3. Match new/existing GPX files to CSV rows by date (`getGpxfilesWithCurrentActivities`,
   `app/lib/util.js`'s `sameDate`); enrich matched rows, insert unmatched ones.
4. Add display-only fields (`addDisplayValues`, `app/lib/display.js`: rounded numbers, day-of-week,
   `activityId` parsed from the filename).
5. Write the updated CSV back out and move the now-imported GPX files from `activitiesNewMap` into
   `activitiesMap` (`app/lib/moveFiles.js`).
6. Push progress over the WebSocket (`sendWebsocketMessage`, `app/lib/socket.js`) — the client
   listens for `'get activities completed'` / `'get new activities completed'`.

**Per-file metadata** (`app/lib/meta.js`): for a given `.gpx` file, a sibling `.json` is used as a
cache. If missing, it's derived by parsing the GPX XML (`xml2js` + `gpxparser` for distance) and,
if a matching per-activity `.csv` exists, enriched with timing/speed fields from it
(`getMetaFromGpx` / `addFromCsv`). This is the "backward compatibility" path referenced in
comments — older imports may only have GPX/CSV, not JSON.

**Nearby-activity lookup** (`app/lib/activitiesByLatLng.js`): builds/caches an `rbush` spatial
index (`tree.json` in `activitiesMap`) over each GPX's start point, used by
`GET /gpx/list/:lon/:lat` (map-click "what tracks pass near here" in the clients).

**Routes** (`app/routes/gpx.js`, mounted at `/gpx` in `app/routes/index.js`):
- `GET /list/all` — CSV-driven full activity list (triggers the import pipeline above).
- `GET /list` — raw scan of `activitiesMap` for all `.gpx` files (no CSV).
- `GET /list/:lon/:lat` — nearby activities via the spatial index.
- `GET /meta/:file` — metadata for one GPX file.
- `GET /exists/:id` — whether an activity id is already in `outputFile`.
- `GET /:file` — raw GPX file bytes (must stay **last** in the route list; catch-all on filename).
- `POST /importxls` — **not** part of the new-activity flow above; it's a metadata *refresh* for
  activities already in `activitiesMap`. `app/lib/csv_gpx.js`'s `importFromCsv` re-reads the bulk
  `activitiesCsvFile` (`Activities.csv` — the CSV export you can do from
  `connect.garmin.com/app/activities`, which only covers whatever the infinite-scroll list has
  loaded, metadata only, no track data) and matches its rows by date against existing GPX files to
  update their `.json` sidecars — it does not register brand-new activities. Only wired up in
  `ng9-gpx-client`'s "Tools" tab (button "update list from csv"); `ng16-gpx-client` has no UI for
  it. **Known bug**: `csv_gpx.js:8` calls `getAllGpx()` without the required `activitiesMap`
  argument, so that promise rejects immediately and the enrich step silently never runs (the route
  still responds `'ok'` regardless, since it doesn't wait for that chain) — on Node ≥15 the
  unhandled rejection can crash the server process outright. Not fixed as of this writing.
- `POST /update` — patch a field in an activity's `.json` sidecar.

**Static serving**: `app.js` serves `dist/ng16-gpx-client` at `/` (built Angular output — see that
project's `angular.json` for the expected build output path) and renders `app/views/*.pug` for
`/home`.

**Console logging**: `app/trace-console-logs.js` monkey-patches `console.log/warn/error` to append
the calling location — required at the top of `app.js`, affects all logging server-wide.

## Notes

- Field-name translation lives in `app/data/fields.js` (`fields` array maps internal keys to both
  Dutch and English CSV column headers) — Garmin Connect exports CSVs in the browser's locale, so
  `csv.js`'s `fromCsvLine` auto-detects which label set is present (`line['Afstand'] ? 1 : 2`).
- Paths in `config.js`, the README, and `plist/` reference specific local machines
  (`/Volumes/NAS_Data/...`, `/Users/ares/...`) — these are machine-specific, not conventions to
  replicate; expect to repoint them per environment.
