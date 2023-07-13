const {updateGpx, getGpx, getAllGpx} = require("../lib/gpx");
const {importFromCsv} = require("../lib/csv_gpx");
const {getActivitiesFromCsv} = require("../lib/activities");
const {getMetaFile} = require("../lib/meta");
const {activitiesMap} = require("../../config");

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
        .catch(err => res.send(JSON.stringify(err)))
};

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

module.exports = {metaFile, listActiviteitenFromCsv, listRoutes, importXls, update, file};
