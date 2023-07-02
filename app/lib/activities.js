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

function getTime(dateTime) {
    if (!dateTime) return '';
    return dateTime.split('T')[1].split('.')[0].split(':').slice(0, 2).join(':');
}

const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

function getDate(dateTime) {
    //'2023-06-23 16:04:53' | '2023-06-23T16:04:53.000Z'
    const seperator = dateTime.indexOf('T') > 0 ? 'T' : ' ';
    const w = dateTime.split(seperator)[0].split('-');
    return [w[2] + ' ' + months[+w[1]], w[0]];
}

function addDisplayValues(resultsCsv) {
    for (const csv of resultsCsv) {
        // replace , with . for display
        for (const field of ['distance', 'duration', 'speed']) {
            csv[field] = csv[field].replace(',', '.');
        }
        for (const field of ['start', 'finish']) {
            csv[field] = getTime(csv[field]);
        }
        csv['dateDisplay'] = getDate(csv['date']);
        csv['activityId'] = csv['file'].split('.')[0].split('_')[1];
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
                addDisplayValues(resultsCsv);
                console.log('getActivitiesFromCsv', resultsCsv[0]);
                console.log('getActivitiesFromCsv', resultsCsv[1]);
                // moveGpxFiles(listGpx);

                // writeResult(resultsCsv, config.outputFile);
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
