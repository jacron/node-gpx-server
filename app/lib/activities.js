const { readCsvRaw} = require("./csv");
const config = require("../../config");
const {sameDate, trimLeadingZero, getTime, getDate} = require("./util");
const {getAllGpx} = require("./gpx");
const {writeResult} = require("./write-csv");
const {moveGpxFiles} = require("./moveFiles");
const {gpxFields, extendedGpxFields, extendedCsvFields} = require("../data/fields");
const {days} = require("../data/time");
const {getMetaFromGpx} = require("./meta");

function addDisplayValues(resultsCsv) {
    for (const csv of resultsCsv) {
        for (const field of ['distance', 'duration', 'speed', 'maxSpeed']) {
            csv[field] = csv[field].replace(',', '.');
        }
        for (const field of ['start', 'finish']) {
            csv[field] = trimLeadingZero(getTime(csv[field]));
        }
        csv['dateDisplay'] = getDate(csv['date']);
        csv['activityId'] = csv['file'].split('.')[0].split('_')[1];
        csv['duration'] = trimLeadingZero(csv['duration'].split(':').slice(0, 2).join(':'));
        csv['dayOfTheWeek'] = days[new Date(csv['date']).getDay()];
    }
}

function getGpxfileWithCurrentActivities(resultsCsv, listGpx) {
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

function tryEnrichList(listGpx) {
    const gpx = listGpx[0];
    console.log(gpx.firstPoint)
    gpx.tryFirstPoint = 'testTry';  // JSON.stringify(listGpx[0].firstPoint);
}
function readFromCsv(resolve) {
    readCsvRaw(config.outputFile).then(resultsCsv => {
        getAllGpx(config.activitiesNewMap).then(listGpx => {
            if (listGpx.length === 0) {
                resolve(resultsCsv);
            } else {
                console.log(listGpx.length, 'gpx files found');
                const [gpxold, gpxnew] = getGpxfileWithCurrentActivities(resultsCsv, listGpx);
                // console.log(gpxold.length, 'gpx files old')
                // console.log(gpxnew.length, 'gpx files new')
                console.log(listGpx);
                tryEnrichList(listGpx)
                enrichResultsFromGpx(resultsCsv, gpxold);
                insertResultsFromGpx(resultsCsv, gpxnew);
                addDisplayValues(resultsCsv);
                // testing...
                // moveGpxFiles(listGpx);
                // writeResult(resultsCsv, config.outputFile, extendedCsvFields);
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
