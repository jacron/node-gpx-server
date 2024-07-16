const { readCsvRaw} = require("./csv");
const config = require("../../config");
const {sameDate} = require("./util");
const {getAllGpx} = require("./gpx");
const {writeResult} = require("./write-csv");
const {moveGpxFiles} = require("./moveFiles");
const {gpxFields, extendedGpxFields, extendedCsvFields} = require("../data/fields");
const {addDisplayValues} = require("./display");
const {sendWebsocketMessage} = require("./socket");

function getGpxfilesWithCurrentActivities(resultsCsv, listGpx) {
    const gpxold = [];
    const gpxnew = [];
    for (const gpx of listGpx) {
        let found = false;
        for (const csv of resultsCsv) {
            if (sameDate(gpx, csv)) {
                gpxold.push([gpx, csv]);
            }
        }
        if (!found) {
            gpxnew.push(gpx);
        }
    }
    return [gpxold, gpxnew];
}

function insertResultsFromGpx(resultsCsv, listGpxNew) {
    for (const gpx of listGpxNew) {
        const csv = {};
        for (const field of extendedGpxFields) {
            csv[field] = gpx[field];
        }
        resultsCsv.unshift(csv);
    }
}

function enrichResultsFromGpx(resultsCsv, listGpxOld) {
    for (const [gpx, csv] of listGpxOld) {
        for (const field of gpxFields) {
            csv[field] = gpx[field];
        }
    }
}

function readFromCsv(resolve) {
    readCsvRaw(config.outputFile).then(resultsCsv => {
        getAllGpx(config.activitiesNewMap).then(listGpx => {
            if (listGpx.length === 0) {
                sendWebsocketMessage('get activities completed')
                resolve(resultsCsv);
            } else {
                console.log(listGpx.length + ' bestanden in newactivities');
                const [gpxold, gpxnew] = getGpxfilesWithCurrentActivities(resultsCsv, listGpx);
                enrichResultsFromGpx(resultsCsv, gpxold);
                insertResultsFromGpx(resultsCsv, gpxnew);
                addDisplayValues(resultsCsv);
                writeResult(resultsCsv, config.outputFile, extendedCsvFields);
                moveGpxFiles(listGpx);
                sendWebsocketMessage('get new activities completed')
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
