const fs = require('fs');
const config = require('../../config');

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

module.exports = {getGpx, updateGpx};
