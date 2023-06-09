/**
 * api calls for gpx
 */
const {getAllGpxFromCsv, importFromCsv} = require("../lib/csv_gpx");
const router = require('express').Router();
const {getGpx, getMetaFile, getAllGpx, updateGpx}
    = require("../lib/gpx");
const {toggleListenerState, getListening} = require("../lib/listen");

const metaFile = (req, res) => {
    const {file} = req.params;
    getMetaFile(file)
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
};

const listAllFromCsv = (req, res) => {
    // garmin lijst / Activiteiten
    getAllGpxFromCsv()
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
};

const list =  (req, res) => {
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

router.get('/list/all', listAllFromCsv);
router.get('/meta/:file', metaFile);
router.get('/list', list);
router.get('/listenerstate', getlistenerState);
/** GET gpx from file  NB must be the LAST get in this list! */
router.get('/:file', file);


router.post('/importxls', importXls);
router.post('/update', update);
router.post('/listenerstate', setlistenerState);


module.exports = router;

