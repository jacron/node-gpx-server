const fs = require('fs');
const parseXmlString = require('xml2js').parseString;
const config = require('../config');
const {readCsv} = require("./csv");
const {hasExtension, timeDiff, leadZero} = require("./util");

function getRawDuration(start, finish) {
    const diff = timeDiff(new Date(start), new Date(finish));
    let hours = diff.hours;
    const minutes = diff.minutes;
    if (diff.days > 0) { hours += diff.days * 24}
    return `${hours}:${leadZero(minutes)}`;
}

function getMetaFromGpx(gpx) {
    if (!gpx.metadata) {
        // console.log(gpx);
        // console.log('No metadata found!');
        return null;
    }
    const metadata = gpx.metadata[0];
    const trk = gpx.trk[0];
    let duration = '';
    let start = '';
    let finish = '';
    let link = {};
    let firstPoint = null;
    if (trk.link) {
        link = {
            href: trk.link[0].$.href,
            text: trk.link[0].text
        };
    }
    if (trk.trkseg) {
        const trkpt = trk.trkseg[0].trkpt;
        // console.log('first track point', trkpt[0]);
        if (trkpt[0].time) {
            start = trkpt[0].time[0];
            finish = trkpt[trkpt.length - 1].time[0];
            duration = getRawDuration(start, finish);
        }
        firstPoint = trkpt[0].$;
    }
    let name = trk.name[0];
    let desc = '';
    if (trk.desc) {
        desc = trk.desc[0];
    }
    let type = trk.type ? trk.type[0] : '';
    let date = metadata.time? metadata.time[0] : '';
    let creator = gpx.$.creator ? gpx.$.creator : '';
    return({
        name,
        desc,
        link,
        type,
        date,
        creator,
        duration,
        start,
        finish,
        firstPoint
    });
}

function getGpx(file) {
    const p = `${config.activitiesMap}/${file}`;
    return new Promise((resolve, reject) => {
        fs.readFile(p, (err, data) => {
            if (err) {
                console.error(err);
                reject(err.message);
            } else {
                resolve(data);
            }
        });
    });
}

function parseXmlToMeta(data) {
    return new Promise((resolve, reject) => {
        parseXmlString(data, (err, result) => {
            if (err) {
                console.error(err);
                reject(err.message);
            } else {
                resolve(getMetaFromGpx(result.gpx));
            }
        });
    });
}

function updateGpx(body) {
    const {field, value, file} = body;
    const p = `${config.activitiesMap}/${file}`;
    const q = p.replace('.gpx', '.json');
    return new Promise((resolve, reject) => {
        fs.readFile(q, 'utf-8', (err, json) => {
            if (err) {
                console.error(err);
                reject(err.message);
            } else {
                const meta = JSON.parse(json);
                meta[field] = value;
                const json2 = JSON.stringify(meta);
                fs.writeFile(q, json2, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err.message);
                    } else {
                        resolve('ok');
                    }
                })
            }
        });

    });
}

async function addFromCsv(result, file) {
    const p = `${config.activitiesMap}/${file}`;
    const r = p.replace('.gpx', '.csv');
    if (fs.existsSync(r)) {
        const data = await readCsv(r);
        console.log('data simple csv', data);
        const totals = data[data.length - 1];
        console.log('totals simple csv', totals);
        // const fields = totals;
        for (const field of [
            'distance', 'duration', 'speed', 'maxSpeed',
            'elevation', 'temperature']) {
            result[field] = totals[field];
        }
        console.log('enriched result', result);
        return true;
    }
    return false;
}

function writeToJson(q, json) {
    fs.writeFileSync(q, json);
}

function nameFromFile(words) {
    return words.slice(0, 2).join(' ');
}

function monthFromShort(short) {
    const monthShorts = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    for (let i = 0; i < monthShorts.length; i++) {
        if (short === monthShorts[i]) {
            if (i + 1 < 10) {
                return `0${i + 1}`;
            }
            return i + 1;
        }
    }
    return '-1';
}

function dateFromFile(words) {
    // e.g. 2020-03-10T08:56:55.000Z
    const month = monthFromShort(words[3]);
    let day = words[2];
    if (day < 10) {
        day = '0' + day;
    }
    const hours = words[6] - 1;  // Amsterdam => CET
    return `${words[4]}-${month}-${day}T${hours}:${words[7]}:00.000Z`;
}

function buildResult(file) {
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

async function getMetaFile(file) {
    const p = `${config.activitiesMap}/${file}`;
    const q = p.replace('.gpx', '.json');
    if (fs.existsSync(q)) {
        const json = fs.readFileSync(q, 'utf-8');
        const record = JSON.parse(json);
        return {...record, file};
    } else {
        const text = fs.readFileSync(p, 'utf-8');
        let result = await parseXmlToMeta(text);
        if (!result) {
            result = buildResult(file);
        }
        if (result) {
            await addFromCsv(result, file);
            writeToJson(q, JSON.stringify(result));
        }
        return {...result, file};
    }
}

async function getMetaList(files) {
    const pfiles = [];
    for (const file of files) {
        let meta = await getMetaFile(file);
        pfiles.push(meta);
    }
    return pfiles.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });
}

function getAllGpx() {
    return new Promise((resolve, reject) => {
        fs.readdir(config.activitiesMap, (err, files) => {
            if (err) {
                console.error(err);
                reject(err.message);
            } else {
                const filtered = files.filter(file => hasExtension(file, 'gpx'));
                getMetaList(filtered).then(list => resolve(list));
            }
        })
    });
}

module.exports = {getGpx, getMetaFile, getAllGpx, updateGpx};
