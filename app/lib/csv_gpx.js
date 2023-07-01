const {getAllGpx} = require("./gpx");
const config = require('../../config');
const {updateFromCsv, readCsv} = require("./csv");

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

module.exports = {importFromCsv};
