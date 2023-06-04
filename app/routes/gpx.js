const {getAllGpxFromCsv, importFromCsv} = require("../lib/csv_gpx");
const router = require('express').Router();
const {getGpx, getMetaFile, getAllGpx, updateGpx}
    = require("../lib/gpx");

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

router.get('/list/all', listAllFromCsv);
router.get('/meta/:file', metaFile);
router.get('/list', list);
/** GET gpx from file */
router.get('/:file', file);

router.post('/importxls', importXls);
router.post('/update', update);



module.exports = router;

