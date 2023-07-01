const {readCsv} = require("./csv");
const config = require("../../config");
const {firstWord} = require("./util");
const {getAllGpx} = require("./gpx");

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

module.exports = {getActivitiesFromCsv};
