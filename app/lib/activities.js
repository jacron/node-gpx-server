const { readCsvRaw} = require("./csv");
const config = require("../../config");
const {sameDate, trimLeadingZero} = require("./util");
const {getAllGpx} = require("./gpx");
const {writeResult} = require("./write-csv");
const {moveGpxFiles} = require("./moveFiles");
const {gpxFields, extendedGpxFields, extendedCsvFields} = require("../data/fields");
const {months, days} = require("../data/time");

function updateActivitiesCsvFromGpx(csv, gpx) {
    // console.log('gpx', gpx);
    for (const field of extendedGpxFields) {
        csv[field] = gpx[field];
    }
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
    //2023-07-01T15:26:11.000Z | 9:07 - uit gpx | activitiesOut.csv
    let seperator = null;
    if (dateTime.indexOf('T') > 0)  {
        seperator = 'T';
    }
    if (dateTime.indexOf(' ') > 0)  {
        seperator = ' ';
    }
    if (!seperator) {
        return dateTime;
    }
    return dateTime.split(seperator)[1].split('.')[0].split(':').slice(0, 2).join(':');
}

function getDate(dateTime) {
    //'2023-06-23 16:04:53' | '2023-06-23T16:04:53.000Z'
    const seperator = dateTime.indexOf('T') > 0 ? 'T' : ' ';
    const w = dateTime.split(seperator)[0].split('-');
    const date = w[2] + ' ' + months[+w[1] - 1];
    const year = w[0];
    return `${date}-${year}`;
}

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
    for (const csv of resultsCsv) {
        for (const gpx of listGpx) {
            if (sameDate(gpx, csv)) {
                return gpx;
            }
        }
    }
    return null;
}

function enrichResultsFromGpx(resultsCsv, gpxfile) {
    for (const csv of resultsCsv) {
        for (const field of gpxFields) {
            csv[field] = gpxfile[field];
        }
    }
}

function readFromCsv(resolve) {
    readCsvRaw(config.outputFile).then(resultsCsv => {
        getAllGpx(config.activitiesNewMap).then(listGpx => {
            if (listGpx.length === 0) {
                resolve(resultsCsv);
            } else {
                console.log(listGpx.length, 'gpx files found');
                const gpxfile = getGpxfileWithCurrentActivities(resultsCsv, listGpx);
                if (gpxfile) {
                    enrichResultsFromGpx(resultsCsv, gpxfile);
                } else {
                    insertResultsFromGpx(resultsCsv, listGpx);
                }
                addDisplayValues(resultsCsv);
                moveGpxFiles(listGpx);
                writeResult(resultsCsv, config.outputFile, extendedCsvFields);
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
