const {updateGpx, getGpx, getAllGpx} = require("../lib/gpx");
const {importFromCsv} = require("../lib/csv_gpx");
const {getListening, toggleListenerState} = require("../lib/listen");
const {getActivitiesFromCsv} = require("../lib/activities");
const {getMetaFile} = require("../lib/meta");

const metaFile = (req, res) => {
    const {file} = req.params;
    getMetaFile(file)
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
};

const listActiviteitenFromCsv = (req, res) => {
    getActivitiesFromCsv()
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
};

const listRoutes =  (req, res) => {
    getAllGpx()
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

const getlistenerState = (req, res) => {
    console.log('getlistenerState');
    res.send(JSON.stringify(getListening()));
};

const setlistenerState = (req, res) => {
    const {state} = req.body;
    console.log('setlistenerState');
    console.log(state);  // true / false
    toggleListenerState(state);
    res.send(JSON.stringify(state));
};

module.exports = {metaFile, listActiviteitenFromCsv, listRoutes, importXls, update, file, getlistenerState, setlistenerState};
