const {
    listRoutes, listActiviteitenFromCsv, metaFile, file, importXls, update
} = require("./controller");
/**
 * api calls for gpx
 * gpx//list/all: 'Activiteiten': Read Activities.csv
 * gpx/list: 'Routes': Read all gpx files
 */
const router = require('express').Router();

router.get('/list/all', listActiviteitenFromCsv);
router.get('/list', listRoutes);
router.get('/meta/:file', metaFile);
/** GET gpx from file  NB must be the LAST get in this list! */
router.get('/:file', file);

router.post('/importxls', importXls);
router.post('/update', update);


module.exports = router;

