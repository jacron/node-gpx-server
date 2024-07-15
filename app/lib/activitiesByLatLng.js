const fs = require("fs");
const {hasExtension} = require("./util");
const gpxParse = require( "gpx-parse");
const {join} = require("node:path");

const {getMetaList} = require("./meta");
const config = require("../../config");
const {addDisplayValues} = require("./display");

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
        // if (fs.existsSync(treeFilePath)) {
        //     const treeData = fs.readFileSync(treeFilePath, 'utf-8');
        //     resolve(tree.fromJSON(JSON.parse(treeData)));
        //     return;
        // }
        readAllRealGpx(config.activitiesMap, listGpx => {
            for (const gpx of listGpx) {
                const filePath = join(config.activitiesMap, gpx);
                const gpxData = fs.readFileSync(filePath, 'utf-8');
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
    const radius = 1; // waarde in km
    return new Promise((resolve) => {
        makeTree().then(tree => {
            const [minLon, minLat, maxLon, maxLat] = getBoundingBox(lat, lng, radius);
            const results = tree.search({
                minX: minLon,
                minY: minLat,
                maxX: maxLon,
                maxY: maxLat
            })
            console.log(radius)
            const relevantFiles = new Set();
            results.forEach(item => {
                const distance = haversineDistance([lat, lng], [item.minY, item.minX]);
                if (distance <= radius) {
                    relevantFiles.add(item.file);
                }
            });
            getMetaList(relevantFiles, config.activitiesMap).then(list => {
                console.log(list.length);
                addDisplayValues(list);
                resolve(list);
            });
        });
    });
}

module.exports = {getNearbyActivities}
