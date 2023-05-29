const {getAllGpx} = require("./gpx");
const config = require('../../config');
const {updateFromCsv, readCsv} = require("./csv");
const {firstWord} = require("./util");

function updateFromGpx(resultsCsv, listGpx) {
    for (const csv of resultsCsv) {
        for (const gpx of listGpx) {
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

function updateCsvFromGpx(csv, gpx) {
    for (const field of ['file', 'start', 'finish']) {
        csv[field] = gpx[field];
    }
}

function getAllGpxFromCsv() {
    return new Promise((resolve) => {
        readCsv(config.activitiesCsvFile).then(resultsCsv => {
            getAllGpx().then(listGpx => {
                updateFromGpx(resultsCsv, listGpx);
                resolve(resultsCsv);
            });
        });
    });
}

function importFromCsv() {
    return new Promise((resolve) => {
        readCsv(config.activitiesCsvFile).then(resultsCsv => {
            getAllGpx().then(listGpx => {
                updateFromCsv(resultsCsv, listGpx);
            });
            resolve('ok');
        });
    });
}

module.exports = {getAllGpxFromCsv, importFromCsv};
