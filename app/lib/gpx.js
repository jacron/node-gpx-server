const fs = require('fs');
const config = require('../../config');
const {hasExtension} = require("./util");
const {getMetaList} = require("./meta");

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

function readAllGpx(resolve, reject) {
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
            }).catch(err => {
                console.error(err);
                reject(err.message);
            });
        }
    })
}

function getAllGpx() {
    /* Routes */
    return new Promise((resolve, reject) => {
        if (!config.caching || config.activitiesMapDirty || !config.cache.gpxlist) {
            readAllGpx(resolve, reject);
        } else {
            console.log('getting the list from the cache');
            resolve(config.cache.gpxlist);
        }
    });
}

module.exports = {getGpx, updateGpx, getAllGpx};
