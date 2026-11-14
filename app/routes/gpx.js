const {
    listRoutes, listActiviteitenFromCsv, lonlatList,
    metaFile, file, importXls, update, exists, ids, importNew
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
router.get('/exists/:id', exists);
/** alle geregistreerde activityIds (voor garmin-grab's plusknop en garmin-sync) */
router.get('/ids', ids);
router.get('/list/:lon/:lat', lonlatList);
/** GET gpx from file  NB must be the LAST get in this list! */
router.get('/:file', file);

router.post('/importxls', importXls);
router.post('/update', update);
/** verplaatst/importeert bestanden uit activitiesNewMap; wordt NIET automatisch
 *  aangeroepen door het laden van de activiteitenlijst (zie /list/all) */
router.post('/import', importNew);


module.exports = router;

