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

function getActivitiesFromCsv() {
    // puur lezend: raakt activitiesNewMap niet aan, dus het laden/verversen van de
    // activiteitenlijst (ook door een client op te starten) heeft geen bijwerkingen meer.
    return readCsvRaw(config.outputFile).then(resultsCsv => {
        sendWebsocketMessage('get activities completed')
        return resultsCsv;
    });
}

function importNewActivities() {
    return readCsvRaw(config.outputFile).then(resultsCsv => {
        return getAllGpx(config.activitiesNewMap).then(listGpx => {
            if (listGpx.length === 0) {
                sendWebsocketMessage('get activities completed')
                return resultsCsv;
            }
            console.log(listGpx.length + ' bestanden in newactivities');
            const [gpxold, gpxnew] = getGpxfilesWithCurrentActivities(resultsCsv, listGpx);
            enrichResultsFromGpx(resultsCsv, gpxold);
            insertResultsFromGpx(resultsCsv, gpxnew);
            addDisplayValues(resultsCsv);
            writeResult(resultsCsv, config.outputFile, extendedCsvFields);
            moveGpxFiles(listGpx);
            sendWebsocketMessage('get new activities completed')
            return resultsCsv;
        });
    });
}

module.exports = {getActivitiesFromCsv, importNewActivities};
