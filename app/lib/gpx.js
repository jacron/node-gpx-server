const fs = require('fs');
const parseXmlString = require('xml2js').parseString;
const config = require('../../config');
const {getRawDuration} = require("./dateutil");
const {getDataFromFilename, hasExtension} = require("./util");
const {readCsv} = require("./csv");

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
        if (trkpt[0].time) {
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
    const link = getLink(trk);
    const name = trk.name[0];
    const desc = getDescription(trk);
    const type = trk.type ? trk.type[0] : '';
    const date = getDate(gpx.metadata[0]);
    const creator = gpx.$.creator ? gpx.$.creator : '';
    const [start, finish, duration] = getStartFinishTimes(trk);
    const [firstPoint, endPoint] = getStartFinishPoints(trk);
    console.log(endPoint)
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
        firstPoint,
        endPoint
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
        }, null);
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
    /* Routes */
    return new Promise((resolve, reject) => {
        if (config.activitiesMapDirty || !config.cache.gpxlist) {
            fs.readdir(config.activitiesMap, (err, files) => {
                if (err) {
                    console.error(err);
                    reject(err.message);
                } else {
                    const filtered = files.filter(file => hasExtension(file, 'gpx'));
                    getMetaList(filtered).then(list => {
                        console.log('caching the list');
                        config.cache.gpxlist = list;
                        config.activitiesMapDirty = false;
                        resolve(list);
                    });
                }
            })
        } else {
            console.log('getting the list from the cache');
            resolve(config.cache.gpxlist);
        }
    });
}

module.exports = {getGpx, getMetaFile, getAllGpx, updateGpx};
