# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Node/Express backend for viewing and managing GPX activity tracks (from Garmin Connect). It serves
the built `ng16-gpx-client` (Angular) statically and exposes a REST + WebSocket API that both
`ng16-gpx-client` and the older `ng9-gpx-client` ("viewer2") consume. Node 12/13/17. See
`../CLAUDE.md` for how the sibling projects in this repo relate.

The `../gpxviewer` Chrome extension is unrelated to importing: it's just a one-click link from a
Garmin Connect activity page to `ng9-gpx-client` ("viewer2") for *previewing* an already-imported
track. It downloads nothing and doesn't target `ng16-gpx-client`.

Supplying new activities is now automatable: `../garmin-sync/` (Playwright) logs into Garmin
Connect once (session persists) and exports the GPX of every not-yet-registered activity into
`activitiesNewMap` unattended — see below and that project's README. Importing those files into
`activitiesMap` remains a separate, deliberate step (`POST /gpx/import` / `npm run import-new`),
not something list-loading triggers automatically (see "Import/enrich pipeline" below).

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

**Supplying new activities**: files land in `activitiesNewMap` via `../garmin-sync/`
(Playwright, unattended) or manually — see `README.md` for both paths. A CSV per activity
(`activity_<id>.csv`, matching the GPX's id) is optional, not required: `moveFiles.js` moves the
GPX regardless of whether a matching CSV exists, and `meta.js` derives distance/duration from the
GPX itself when there's no CSV — but `speed`, `maxSpeed` and `elevation` are never computed from
raw GPX data anywhere in this codebase, so without a CSV those three stay empty. Garmin's own CSV
export ("Exporteer tussentijden naar CSV") lives in the *same* gear/toggle menu as the GPX export
(confirmed live 2026-08-29; an older assumption that it was a separate Laps/Splits-table button
was wrong) but can't be automated regardless: it uses Chrome's File System Access API
(`showSaveFilePicker`), which always opens a native OS "Save As" dialog no browser automation can
drive. `../garmin-sync/` works around this by scraping the same five stats
(Afstand/Tijd/Gemiddelde snelheid/Max. snelheid/Totale stijging) straight off the activity list
page — those Dutch labels are literally `app/data/fields.js`'s expected CSV column names — and
writing its own `activity_<id>.csv` in that format (`garmin-sync/statsCsv.js`), including normalizing
Garmin's MM:SS-under-an-hour display into the H:MM:SS this pipeline's `display.js` assumes.
`garmin-sync/backfillStats.js` does the same for activities already imported without these fields, but
patches `outputFile` directly (with a backup) since their GPX/JSON have already moved past the
normal import pipeline.

**Import/enrich pipeline** (`app/lib/activities.js`): reading the activity list
(`getActivitiesFromCsv`, behind `GET /gpx/list/all`) is now a pure read of the existing `outputFile`
CSV — it does **not** touch `activitiesNewMap`, so loading/refreshing a client (including ng16 on
startup) has no side effects. Importing is a separate, explicit call
(`importNewActivities`, behind `POST /gpx/import` / `npm run import-new`):
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
- `GET /list/all` — CSV-driven full activity list; pure read, no side effects.
- `POST /import` — runs the import/enrich pipeline above (moves files from `activitiesNewMap`
  into `activitiesMap`). The only trigger for that pipeline — nothing else calls it automatically.
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
