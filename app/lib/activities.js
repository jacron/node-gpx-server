const {readCsv, readCsvRaw} = require("./csv");
const config = require("../../config");
const {firstWord} = require("./util");
const {getAllGpx} = require("./gpx");
const {writeResult} = require("./write-csv");

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

function readFromCsv(resolve) {
    readCsvRaw(config.outputFile).then(resultsCsv => {
        console.log('getActivitiesFromCsv', resultsCsv[0])
        // resolve(resultsCsv);
        getAllGpx(config.activitiesNewMap).then(listGpx => {
            if (listGpx.length === 0) {
                console.log('No gpx files found');
                resolve(resultsCsv);
            } else {
                console.log(listGpx.length, 'gpx files found');
                updateResultsFromGpx(resultsCsv, listGpx);
                console.log('getActivitiesFromCsv', resultsCsv[0])
                // writeResult(resultsCsv);
                resolve(resultsCsv);
            }
        });
    });
}

function readFromGpx(resolve) {
    readCsv(config.activitiesCsvFile).then(resultsCsv => {
        getAllGpx(config.activitiesNewMap).then(listGpx => {
            updateResultsFromGpx(resultsCsv, listGpx);
            console.log('getActivitiesFromCsv', resultsCsv[0])
            writeResult(resultsCsv);
            resolve(resultsCsv);
        });
    });
}

function getActivitiesFromCsv() {
    return new Promise((resolve) => {
        readFromCsv(resolve);
        // readFromGpx(resolve);
    });
}

module.exports = {getActivitiesFromCsv};
