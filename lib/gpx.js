const fs = require('fs');
const parseXmlString = require('xml2js').parseString;
const config = require('../config');
const {getRawDuration} = require("./dateutil");
const {getDataFromFilename, hasExtension} = require("./util");
const {readCsv} = require("./csv");

function getMetaFromGpx(/*Gpx*/gpx) {
    let metaresult = null;
    if (!gpx.metadata) {
        return metaresult;
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
    return(/* Metaresult */{
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

async function addFromCsv(result, csvfile) {
    if (fs.existsSync(csvfile)) {
        const data = await readCsv(csvfile);
        // console.log('data simple csv', data);
        const totals = data[data.length - 1];
        // console.log('totals simple csv', totals);
        // const fields = totals;
        for (const field of [
            'distance', 'duration', 'speed', 'maxSpeed',
            'elevation', 'temperature']) {
            result[field] = totals[field];
        }
        // console.log('enriched result', result);
        return true;
    }
    return false;
}

async function getMetaFile(file) {
    const gpxfile = `${config.activitiesMap}/${file}`;
    const jsonfile = gpxfile.replace('.gpx', '.json');
    const csvfile = gpxfile.replace('.gpx', '.csv');
    if (fs.existsSync(jsonfile)) {
        const json = fs.readFileSync(jsonfile, 'utf-8');
        const record = JSON.parse(json);
        return {...record, file};
    } else {
        const text = fs.readFileSync(gpxfile, 'utf-8');
        let result = await parseXmlToMeta(text);
        if (!result) {
            result = getDataFromFilename(file);
        }
        if (result) {
            await addFromCsv(result, csvfile);
            fs.writeFileSync(jsonfile, JSON.stringify(result));
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
