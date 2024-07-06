const {updateGpx, getGpx, getAllGpx, readAllRealGpx} = require("../lib/gpx");
const {importFromCsv} = require("../lib/csv_gpx");
const {getActivitiesFromCsv} = require("../lib/activities");
const {getMetaFile} = require("../lib/meta");
const {activitiesMap} = require("../../config");
const {readCsvRaw} = require("../lib/csv");
const config = require("../../config");
const gpxParser = require('gpxparser');
const {join} = require("node:path");
const {readFileSync} = require("fs");

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

// Hulpfunctie om de afstand tussen twee geografische punten te berekenen
function haversineDistance(coords1, coords2) {
    const toRad = (x) => x * Math.PI / 180;
    const lat1 = coords1[0];
    const lon1 = coords1[1];
    const lat2 = coords2[0];
    const lon2 = coords2[1];

    const R = 6371; // Radius of the Earth in km
    const x1 = lat2 - lat1;
    const dLat = toRad(x1);
    const x2 = lon2 - lon1;
    const dLon = toRad(x2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
}

const lonlatList = (req, res) => {
    console.log(req.params);
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lon);
    const radius = 1; // ongeveer 1 km radiusconst
    const relevantFiles = [];

    readAllRealGpx(config.activitiesMap,listGpx => {
        console.log(listGpx[0]);
        let found = 0;
        // const gpx = listGpx[0];
        for (const gpx of listGpx) {
            const filePath = join(config.activitiesMap, gpx);
            const gpxData = readFileSync(filePath, 'utf-8');
            const parser = new gpxParser();
            parser.parse(gpxData);
            let isRelevant = false;
            for (const track of parser.tracks) {
                if (isRelevant) break;
                for (const point of track.points) {
                    const distance = haversineDistance([lat, lng], [point.lat, point.lon]);
                    if (distance <= radius) {
                        relevantFiles.push(gpx);
                        isRelevant = true;
                        console.log('found: ' + gpx)
                        found++;
                        break;
                    }
                }
            }
        }
        console.log('*** Found: ' + found);
    }, err => console.error(err));
    res.send(JSON.stringify('ok'));
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
    readCsvRaw(config.outputFile).then(resultsCsv => {
        const filtered = resultsCsv.filter(a => a.activityId === id);
        const exists = filtered.length === 1;
        res.send(JSON.stringify(exists));
    });
}

module.exports = {
    metaFile, lonlatList,
    listActiviteitenFromCsv, listRoutes,
    importXls, update, file, exists};
