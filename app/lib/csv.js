const csvParser = require('csv-parser');
const {firstWord} = require("./util");
const config = require('../../config');
const fs = require('fs');
const {writeResult} = require("./write-csv");
const {csvFields, fields} = require("../data/fields");

function writeMeta(meta, csv, jsonFilename, resolve, reject) {
    for (const field of csvFields) {
        meta[field] = csv[field];
    }
    const json2 = JSON.stringify(meta);
    fs.writeFile(jsonFilename, json2, (err) => {
        if (err) {
            console.error(err);
            reject(err.message);
        } else {
            resolve('ok');
        }
    })
}

function updateGpxFromCsv(csv, gpxFile) {
    const gpxFilename = `${config.activitiesMap}/${gpxFile}`;
    const jsonFilename = gpxFilename.replace('.gpx', '.json');
    return new Promise((resolve, reject) => {
        fs.readFile(jsonFilename, 'utf-8', (err, json) => {
            if (err) {
                console.error(err);
                reject(err.message);
            } else {
                writeMeta(JSON.parse(json), csv, jsonFilename, resolve, reject);
            }
        });
    });
}

function updateFromCsv(resultsCsv, listGpx) {
    let found = 0;
    for (const resultCsv of resultsCsv) {
        for (const recordGpx of listGpx) {
            if (recordGpx.date) {
                const listDate = firstWord(recordGpx.date
                    .replace('T', ' ')
                    .replace('.000Z', ''));
                const resultDate = firstWord(resultCsv.date);
                if (listDate === resultDate) {
                    found++;
                    updateGpxFromCsv(resultCsv, recordGpx.file).then();
                }
            }
        }
    }
}

function fromCsvLine(line) {
    const data = {};
    const labelIndex = line['Afstand'] ? 1 : 2; // Gebruik Nederlands of Engels label
    for (let field of fields) {
        data[field[0]] = line[field[labelIndex]];
    }
    return data;
}

function readCsv(p) {
    return new Promise((resolve) => {
        const resultsCsv = [];
        fs.createReadStream(p)
            .pipe(csvParser())
            .on('data', data =>
                resultsCsv.push(fromCsvLine(data)))
            .on('end', () => {
                resolve(resultsCsv);
            })
    });
}

function readCsvRaw(p) {
    return new Promise((resolve) => {
        const resultsCsv = [];
        fs.createReadStream(p)
            .pipe(csvParser())
            .on('data', data =>
                resultsCsv.push(data))
            .on('end', () => {
                resolve(resultsCsv);
            })
    });
}

module.exports = {updateFromCsv, readCsv, readCsvRaw};
