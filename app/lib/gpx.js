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

function readAllGpx(activitiesMap, resolve, reject) {
    fs.readdir(activitiesMap, (err, files) => {
        if (err) {
            console.error(err);
            reject(err.message);
        } else {
            const filtered = files.filter(file => hasExtension(file, 'gpx'));
            getMetaList(filtered, activitiesMap).then(list => {
                resolve(list);
            }).catch(err => {
                console.error(err);
                reject(err.message);
            });
        }
    })
}

function readAllRealGpx(activitiesMap, resolve, reject) {
    fs.readdir(activitiesMap, (err, files) => {
        if (err) {
            console.error(err);
            reject(err.message);
        } else {
            resolve(files.filter(file => hasExtension(file, 'gpx')));
        }
    })
}

function getAllGpx(activitiesMap) {
    /* Routes */
    return new Promise((resolve, reject) => {
        readAllGpx(activitiesMap, resolve, reject);
    });
}

module.exports = {getGpx, updateGpx, getAllGpx, readAllRealGpx};
