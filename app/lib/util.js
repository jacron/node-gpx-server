const {dateFromFile} = require("./dateutil");
const {months} = require("../data/time");

function hasExtension(s, ext) {
    const p = s.lastIndexOf('.');
    if (p === -1) { return false }
    if (Array.isArray(ext)) {
        return ext.includes(s.substring(p + 1));
    }
    return s.substring(p + 1) === ext;
}

function sameDate(gpx, csv) {
    if (!gpx.date || !csv.date) {
        return false;
    }
    const listDate = firstWord(gpx.date
        .replace('T', '') // in NL ontbreekt T?
        .replace('.000Z', ''));
    const resultDate = firstWord(csv.date);
    return listDate === resultDate;
}

function firstWord(s) {
    if (!s) return '';
    const words = s.split(' ');
    return words[0];
}

function nameFromFile(words) {
    return words.slice(0, 2).join(' ');
}

function trimLeadingZero(s) {
    if (!s) return '';
    if (s.startsWith('0')) {
        return s.substring(1);
    }
    return s;
}

function getDataFromFilename(file) {
    // e.g. Hoenderloo-Walking-8-Mar-2020-at-15-28.gpx, from ViewRanger
    //      0          1       2 3   4    5  6  7
    const filename = file.replace('.gpx', '');
    //.replace(/-/g, ' ');
    const words = filename.split('-');
    if (words.length > 2) {
        const date = dateFromFile(words);
        return {
            name: nameFromFile(words),
            date,
            start: date,
            creator: 'ViewRanger',
        }
    } else {
        return {
            name: filename
        }
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

module.exports = {getDataFromFilename, hasExtension, firstWord,
    sameDate, trimLeadingZero, getTime, getDate};
