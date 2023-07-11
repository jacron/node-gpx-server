const fs = require("fs");
const {getDataFromFilename} = require("./util");
const {parseString: parseXmlString} = require("xml2js");
const {readCsv} = require("./csv");
const {getRawDuration} = require("./dateutil");
const config = require("../../config");
const {csvFields} = require("../data/fields");

async function addFromCsv(result, csvfile) {
    if (fs.existsSync(csvfile)) {
        const dataFromCsv = await readCsv(csvfile);
        // De laatste regel bevat de totalen van alle ronden.
        const totals = dataFromCsv[dataFromCsv.length - 1];
        for (const field of csvFields) {
            result[field] = totals[field];
        }
        return true;
    }
    return false;
}

function getLink(trk) {
    let link = {};
    if (trk.link) {
        link = {
            href: trk.link[0].$.href,
            text: trk.link[0].text
        };
    }
    return link;
}

function getDescription(trk) {
    let desc = '';
    if (trk.desc) {
        desc = trk.desc[0];
    }
    return desc;
}

function getDate(metadata) {
    return metadata.time? metadata.time[0] : '';
}

function getStartFinishTimes(trk) {
    let start = '';
    let finish = '';
    let duration = '';
    if (trk.trkseg) {
        const trkpt = trk.trkseg[0].trkpt;
        const startPt = trkpt[0];
        const finishPt = trkpt[trkpt.length - 1];
        if (trkpt[0]['time']) {
            start = startPt.time[0];
            finish = finishPt.time[0];
            duration = getRawDuration(start, finish);
        }
    }
    return [start, finish, duration];
}

function getStartFinishPoints(trk) {
    let firstPoint = null;
    let endPoint = null;
    if (trk.trkseg) {
        const trkpt = trk.trkseg[0].trkpt;
        const startPt = trkpt[0];
        const finishPt = trkpt[trkpt.length - 1];
        firstPoint = startPt.$;
        endPoint = finishPt.$;
    }
    return [firstPoint, endPoint];
}

function getMetaFromGpx(/*Gpx*/gpx) {
    let metaresult = null;
    if (!gpx.metadata) {
        return metaresult;
    }
    const trk = gpx.trk[0];
    const [start, finish, duration] = getStartFinishTimes(trk);
    const [firstPoint, endPoint] = getStartFinishPoints(trk);
    return(/* Metaresult */{
        name: trk.name[0],
        desc: getDescription(trk),
        link: getLink(trk),
        type: trk.type ? trk.type[0] : '',
        date: getDate(gpx.metadata[0]),
        creator: gpx.$.creator ? gpx.$.creator : '',
        duration,
        start,
        finish,
        firstPoint,
        endPoint
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
        }, null);
    });
}

function parsedJson(jsonfile, file) {
    const json = fs.readFileSync(jsonfile, 'utf-8');
    const record = JSON.parse(json);
    return {...record, file};
}

async function createJson(jsonfile, gpxfile, file) {
    const csvfile = gpxfile.replace('.gpx', '.csv');
    const text = fs.readFileSync(gpxfile, 'utf-8');
    let gpx = await parseXmlToMeta(text);
    if (!gpx) {
        gpx = getDataFromFilename(file);
    }
    if (gpx) {
        await addFromCsv(gpx, csvfile);
        fs.writeFileSync(jsonfile, JSON.stringify(gpx));
    }
    return {...gpx, file};
}

async function getMetaFile(file, activitiesMap) {
    const prefix = activitiesMap? activitiesMap : config.activitiesMap;
    const gpxfile = `${prefix}/${file}`;
    const jsonfile = gpxfile.replace('.gpx', '.json');
    if (fs.existsSync(jsonfile)) {
        return parsedJson(jsonfile, file);
    } else {
        return createJson(jsonfile, gpxfile, file);
    }
}

async function getMetaList(files, activitiesMap) {
    const pfiles = [];
    for (const file of files) {
        let meta = await getMetaFile(file, activitiesMap);
        pfiles.push(meta);
    }
    return pfiles.sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
    });
}

module.exports = {getMetaFile, getMetaList, getMetaFromGpx};
