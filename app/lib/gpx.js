const fs = require('fs');
const config = require('../../config');
const {hasExtension} = require("./util");
const {getMetaList} = require("./meta");
const {join} = require("node:path");
const {readFileSync} = require("fs");
const gpxParser = require("gpxparser");
// const RBush = require('rbush');
const gpxParse = require('gpx-parse');
const {addDisplayValues} = require("./display");

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

// Hulpfunctie om de afstand tussen twee geografische punten te berekenen
function haversineDistance(coords1, coords2) {
    const toRad = (x) => x * Math.PI / 180;
    const lat1 = coords1[0];
    const lon1 = coords1[1];
    const lat2 = coords2[0];
    const lon2 = coords2[1];

    const R = 6371; // Radius of the Earth in km
    const x1 = lat2 - lat1;
    const dLat = toRad(x1);
    const x2 = lon2 - lon1;
    const dLon = toRad(x2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function makeTree() {
    const treeFilePath = join(config.activitiesMap, 'tree.json');
    return new Promise(async (resolve, reject) => {
        const {default: RBush} = await import('rbush');
        const tree = new RBush();
        if (fs.existsSync(treeFilePath)) {
            const treeData = fs.readFileSync(treeFilePath, 'utf-8');
            resolve(tree.fromJSON(JSON.parse(treeData)));
            return;
        }
        readAllRealGpx(config.activitiesMap, listGpx => {
            for (const gpx of listGpx) {
                // console.log(gpx)
                const filePath = join(config.activitiesMap, gpx);
                const gpxData = readFileSync(filePath, 'utf-8');
                // const parser = new gpxParser();
                // parser.parse(gpxData);
                gpxParse.parseGpx(gpxData, (error, data) => {
                    if (error) {
                        console.log('Error parsing GPX file: ', error);
                        reject(error);
                    }
                    data.tracks.forEach(track => {
                        track.segments.forEach(segment => {
                            segment.forEach(point => {
                                const item = {
                                    minX: point.lon,
                                    minY: point.lat,
                                    maxX: point.lon,
                                    maxY: point.lat,
                                    file: gpx
                                };
                                tree.insert(item);
                            });
                        });
                    });
                })
            }
            fs.writeFileSync(treeFilePath, JSON.stringify(tree.toJSON()));
            resolve(tree);
        });
    })
}

// Hulpfunctie om de bounding box te berekenen voor een gegeven punt en straal
function getBoundingBox(lat, lon, radius) {
    const R = 6371; // Radius of the Earth in km
    const dLat = radius / R;
    const dLon = radius / (R * Math.cos(Math.PI * lat / 180));
    return [
        lon - dLon,
        lat - dLat,
        lon + dLon,
        lat + dLat
    ];
}

function getNearbyActivities(lat, lng) {
    return new Promise((resolve, reject) => {
        makeTree().then(tree => {
            // console.log(tree)
            const radius = 1; // ongeveer 100 m radiusconst
            const [minLon, minLat, maxLon, maxLat] = getBoundingBox(lat, lng, radius);
            const results = tree.search({
                minX: minLon,
                minY: minLat,
                maxX: maxLon,
                maxY: maxLat
            })
            // console.log(results)
            console.log(radius)
            const relevantFiles = new Set();
            results.forEach(item => {
                const distance = haversineDistance([lat, lng], [item.minY, item.minX]);
                // console.log(distance)
                if (distance <= radius) {
                    relevantFiles.add(item.file);
                    // console.log('found: ' + item.file)
                }
            });
            getMetaList(relevantFiles, config.activitiesMap).then(list => {
                console.log(list);
                addDisplayValues(list);
                resolve(list);
            });
        });
    });
        // readAllRealGpx(config.activitiesMap, listGpx => {
        //     let found = 0;
        //     const relevantFiles = [];
        //
        //     for (const gpx of listGpx) {
        //         const filePath = join(config.activitiesMap, gpx);
        //         const gpxData = readFileSync(filePath, 'utf-8');
        //         const parser = new gpxParser();
        //         parser.parse(gpxData);
        //         let isRelevant = false;
        //         for (const track of parser.tracks) {
        //             if (isRelevant) break;
        //             for (const point of track.points) {
        //                 const distance = haversineDistance([lat, lng], [point.lat, point.lon]);
        //                 if (distance <= radius) {
        //                     relevantFiles.push(gpx);
        //                     isRelevant = true;
        //                     console.log('found: ' + gpx)
        //                     found++;
        //                     break;
        //                 }
        //             }
        //         }
        //     }
        //     console.log('*** Found: ' + found);
        //     getMetaList(relevantFiles, config.activitiesMap).then(list => {
        //         addDisplayValues(list);
        //         resolve(list);
        //     }).catch(err => {
        //         console.error(err);
        //         reject(err.message);
        //     });
            // resolve(relevantFiles);
        // }, err => reject(err))
    // })
}

function getAllGpx(activitiesMap) {
    return new Promise((resolve, reject) => {
        readAllGpx(activitiesMap, resolve, reject);
    });
}

module.exports = {getGpx, updateGpx, getAllGpx, getNearbyActivities};
