const {updateGpx, getGpx, getAllGpx} = require("../lib/gpx");
const {importFromCsv} = require("../lib/csv_gpx");
const {getActivitiesFromCsv, importNewActivities} = require("../lib/activities");
const {getMetaFile} = require("../lib/meta");
const {activitiesMap} = require("../../config");
const {readCsvRaw} = require("../lib/csv");
const config = require("../../config");
const {getNearbyActivities} = require("../lib/activitiesByLatLng");

const metaFile = (req, res) => {
    const {file} = req.params;
    getMetaFile(file)
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
};

const listActiviteitenFromCsv = (req, res) => {
    getActivitiesFromCsv()
        .then((data) => {
            res.send(data)
        })
        // 500, zodat de client het als fout ziet (en opnieuw probeert) i.p.v. een lege lijst
        .catch(err => res.status(500).send(String(err)))
};

const lonlatList = (req, res) => {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lon);
    getNearbyActivities(lat, lng)
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
}

const listRoutes =  (req, res) => {
    getAllGpx(activitiesMap)
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
};

const importXls = (req, res) => {
    importFromCsv()
        .then(result => {
            res.send(JSON.stringify(result));
        })
        .catch(err => {
            res.sendStatus(err);
        })
};

const update = (req, res) => {
    updateGpx(req.body)
        .then(result => {
            res.send(JSON.stringify(result));
        })
        .catch(err => {
            res.sendStatus(err);
        })
};

const file = (req, res) => {
    const {file} = req.params;
    getGpx(file)
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
};

const exists = (req, res) => {
    const {id} = req.params;
    readCsvRaw(config.outputFile)
        .then(resultsCsv => {
            // minstens één rij: een dubbele rij (overblijfsel van een oude importbug) betekent
            // nog steeds dat de activity geregistreerd is
            const exists = resultsCsv.some(a => a.activityId === id);
            res.send(JSON.stringify(exists));
        })
        .catch(err => res.status(500).send(String(err)));
}

// Alle geregistreerde activityIds in één antwoord, zodat garmin-grab en garmin-sync de hele
// Garmin-historie kunnen vergelijken met één keer de CSV lezen i.p.v. één /exists per activity.
const ids = (req, res) => {
    readCsvRaw(config.outputFile)
        .then(resultsCsv => {
            const unique = [...new Set(resultsCsv.map(a => a.activityId).filter(Boolean))];
            res.json(unique);
        })
        .catch(err => res.status(500).send(String(err)));
}

const importNew = (req, res) => {
    importNewActivities()
        .then((data) => res.send(data))
        // 500, zodat de client een mislukte import niet als "0 geïmporteerd" leest
        .catch(err => res.status(500).send(String(err)))
};

module.exports = {
    metaFile, lonlatList,
    listActiviteitenFromCsv, listRoutes,
    importXls, update, file, exists, ids, importNew};
