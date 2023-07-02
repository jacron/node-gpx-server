const { readCsvRaw} = require("./csv");
const config = require("../../config");
const {sameDate} = require("./util");
const {getAllGpx} = require("./gpx");
const {writeResult} = require("./write-csv");
const {moveGpxFiles} = require("./moveFiles");
const {gpxFields, extendedGpxFields} = require("../data/fields");

function updateCsvFromGpx(csv, gpx) {
    for (const field of gpxFields) {
        csv[field] = gpx[field];
    }
}

function updateActivitiesCsvFromGpx(csv, gpx) {
    console.log(gpx)
    for (const field of extendedGpxFields) {
        csv[field] = gpx[field];
    }
}

function updateResultsFromGpx(resultsCsv, listGpx) {
    let found = false;
    for (const csv of resultsCsv) {
        for (const gpx of listGpx) {
            if (sameDate(gpx, csv)) {
                updateCsvFromGpx(csv, gpx);
                found = true;
                break;
            }
        }
    }
    return found;
}

function insertResultsFromGpx(resultsCsv, listGpx) {
    for (const gpx of listGpx) {
        const csv = {};
        updateActivitiesCsvFromGpx(csv, gpx);
        resultsCsv.unshift(csv);
    }
}

function readFromCsv(resolve) {
    readCsvRaw(config.outputFile).then(resultsCsv => {
        getAllGpx(config.activitiesNewMap).then(listGpx => {
            if (listGpx.length === 0) {
                resolve(resultsCsv);
            } else {
                console.log(listGpx.length, 'gpx files found');
                if (!updateResultsFromGpx(resultsCsv, listGpx)) {
                    insertResultsFromGpx(resultsCsv, listGpx);
                }
                console.log('getActivitiesFromCsv', resultsCsv[0]);
                console.log('getActivitiesFromCsv', resultsCsv[1]);
                // moveGpxFiles(listGpx);
                // writeResult(resultsCsv);
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
