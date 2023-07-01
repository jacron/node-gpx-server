const {readCsv} = require("./csv");
const config = require("../../config");
const {firstWord, hasExtension} = require("./util");
const fs = require("fs");
const {getMetaList} = require("./meta");

function updateCsvFromGpx(csv, gpx) {
    for (const field of ['file', 'start', 'finish']) {
        csv[field] = gpx[field];
    }
}

function updateFromGpx(resultsCsv, listGpx) {
    for (const csv of resultsCsv) {
        for (const gpx of listGpx) {
            if (gpx.date) {
                const listDate = firstWord(gpx.date
                    .replace('T', ' ')
                    .replace('.000Z', ''));
                const resultDate = firstWord(csv.date);
                if (listDate === resultDate) {
                    updateCsvFromGpx(csv, gpx);
                }
            }
        }
    }
}

function readAllGpx(resolve, reject) {
    fs.readdir(config.activitiesMap, (err, files) => {
        if (err) {
            console.error(err);
            reject(err.message);
        } else {
            const filtered = files.filter(file => hasExtension(file, 'gpx'));
            getMetaList(filtered).then(list => {
                console.log('caching the list');
                config.cache.gpxlist = list;
                config.activitiesMapDirty = false;
                resolve(list);
            }).catch(err => {
                console.error(err);
                reject(err.message);
            });
        }
    })
}

function getAllGpx() {
    /* Routes */
    return new Promise((resolve, reject) => {
        if (!config.caching || config.activitiesMapDirty || !config.cache.gpxlist) {
            readAllGpx(resolve, reject);
        } else {
            console.log('getting the list from the cache');
            resolve(config.cache.gpxlist);
        }
    });
}

function getActivitiesFromCsv() {
    return new Promise((resolve) => {
        readCsv(config.activitiesCsvFile).then(resultsCsv => {
            getAllGpx().then(listGpx => {
                updateFromGpx(resultsCsv, listGpx);
                resolve(resultsCsv);
            });
        });
    });
}

module.exports = {getActivitiesFromCsv, getAllGpx};
