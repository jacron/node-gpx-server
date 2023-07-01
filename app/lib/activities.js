const { readCsvRaw} = require("./csv");
const config = require("../../config");
const {firstWord} = require("./util");
const {getAllGpx} = require("./gpx");
const {writeResult} = require("./write-csv");
const fs = require("fs");

function updateCsvFromGpx(csv, gpx) {
    for (const field of ['file', 'start', 'finish']) {
        csv[field] = gpx[field];
    }
}

function updateResultsFromGpx(resultsCsv, listGpx) {
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

function moveGpxFiles(listGpx) {
    for (const gpx of listGpx) {
        const gpxFilename = `${config.activitiesNewMap}/${gpx.file}`;
        const csvFilename = gpxFilename.replace('.gpx', '.csv');
        const jsonFilename = gpxFilename.replace('.gpx', '.json');
        const newGpxFilename = `${config.activitiesMap}/${gpx.file}`;
        const newCsvFilename = newGpxFilename.replace('.gpx', '.csv');
        const newJsonFilename = newGpxFilename.replace('.gpx', '.json');
        fs.rename(gpxFilename, newGpxFilename, (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.rename(csvFilename, newCsvFilename, (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.rename(jsonFilename, newJsonFilename, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}

function readFromCsv(resolve) {
    readCsvRaw(config.outputFile).then(resultsCsv => {
        // console.log('getActivitiesFromCsv', resultsCsv[0])
        // resolve(resultsCsv);
        getAllGpx(config.activitiesNewMap).then(listGpx => {
            if (listGpx.length === 0) {
                console.log('No gpx files found');
                resolve(resultsCsv);
            } else {
                console.log(listGpx.length, 'gpx files found');
                updateResultsFromGpx(resultsCsv, listGpx);
                // console.log('getActivitiesFromCsv', resultsCsv[0])
                moveGpxFiles(listGpx);
                writeResult(resultsCsv);
                resolve(resultsCsv);
            }
        });
    });
}

function getActivitiesFromCsv() {
    return new Promise((resolve) => {
        readFromCsv(resolve);
    });
}

module.exports = {getActivitiesFromCsv};
