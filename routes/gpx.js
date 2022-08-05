const {getAllGpxFromCsv, importFromCsv} = require("../lib/csv_gpx");
const router = require('express').Router();
const {getGpx, getMetaFile, getAllGpx, updateGpx}
    = require("../lib/gpx");

router.get('/meta/:file', (req, res) => {
    const {file} = req.params;
    getMetaFile(file)
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
});

listAll = (req, res) => {
    // garmin lijst
    getAllGpxFromCsv()
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
};

router.get('/list/all', listAll);

// router.get('/list/:gpx', (req, res) => {
//     const {gpx} = req.params;
//     getOneGpxFromCsv(gpx)
//         .then((data) => res.send(data))
//         .catch(err => res.send(JSON.stringify(err)))
// });

router.get('/list', (req, res) => {
    getAllGpx()
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
});

router.post('/importxls', (req, res) => {
    importFromCsv()
        .then(result => {
            res.send(JSON.stringify(result));
        })
        .catch(err => {
            res.sendStatus(err);
        })
});

router.post('/update', (req, res) => {
    updateGpx(req.body)
        .then(result => {
            res.send(JSON.stringify(result));
        })
        .catch(err => {
            res.sendStatus(err);
        })
});

/** GET gpx from file */
router.get('/:file', (req, res) => {
    const {file} = req.params;
    getGpx(file)
        .then((data) => res.send(data))
        .catch(err => res.send(JSON.stringify(err)))
});


module.exports = router;

