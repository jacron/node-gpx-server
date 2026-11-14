const { readCsvRaw} = require("./csv");
const config = require("../../config");
const {getAllGpx} = require("./gpx");
const {writeResult} = require("./write-csv");
const {moveGpxFiles} = require("./moveFiles");
const {gpxFields, extendedGpxFields, extendedCsvFields} = require("../data/fields");
const {addDisplayValues} = require("./display");
const {sendWebsocketMessage} = require("./socket");

// Splitst de GPX-bestanden in al bekende (zelfde bestandsnaam activity_<id>.gpx als een rij in
// de CSV, dus dezelfde Garmin-activity) en nieuwe. Eerder werd op datum vergeleken met sameDate,
// maar die matchte door verschillende datumnotaties nooit, en `found` werd nooit gezet: een
// opnieuw geïmporteerde rit kwam er dan als dubbele rij bij.
function getGpxfilesWithCurrentActivities(resultsCsv, listGpx) {
    const gpxold = [];
    const gpxnew = [];
    const csvByFile = new Map();
    for (const csv of resultsCsv) {
        if (csv.file) {
            csvByFile.set(csv.file, csv);
        }
    }
    for (const gpx of listGpx) {
        const csv = gpx.file && csvByFile.get(gpx.file);
        if (csv) {
            gpxold.push([gpx, csv]);
        } else {
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

// Resolvet met een samenvatting {imported, total} voor de client / npm run import-new.
function importNewActivities() {
    return readCsvRaw(config.outputFile).then(resultsCsv => {
        return getAllGpx(config.activitiesNewMap).then(listGpx => {
            if (listGpx.length === 0) {
                sendWebsocketMessage('get activities completed')
                return {imported: 0, total: resultsCsv.length};
            }
            console.log(listGpx.length + ' bestanden in newactivities');
            const [gpxold, gpxnew] = getGpxfilesWithCurrentActivities(resultsCsv, listGpx);
            enrichResultsFromGpx(resultsCsv, gpxold);
            insertResultsFromGpx(resultsCsv, gpxnew);
            addDisplayValues(resultsCsv);
            writeResult(resultsCsv, config.outputFile, extendedCsvFields);
            moveGpxFiles(listGpx);
            sendWebsocketMessage('get new activities completed')
            return {imported: gpxnew.length, total: resultsCsv.length};
        });
    });
}

module.exports = {getActivitiesFromCsv, importNewActivities};
