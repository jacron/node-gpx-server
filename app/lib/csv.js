const csvParser = require('csv-parser');
const {firstWord} = require("./util");
const config = require('../../config');
const fs = require('fs');

function updateGpxFromCsv(csv, gpxFile) {
    const p = `${config.activitiesMap}/${gpxFile}`;
    const q = p.replace('.gpx', '.json');
    return new Promise((resolve, reject) => {
        fs.readFile(q, 'utf-8', (err, json) => {
            if (err) {
                console.error(err);
                reject(err.message);
            } else {
                const meta = JSON.parse(json);
                // console.log('meta', meta);
                console.log('csv', csv);
                for (const field of [
                    'distance', 'duration', 'speed',
                    'maxSpeed', 'elevation', 'temperature']) {
                    meta[field] = csv[field];
                }
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

function updateFromCsv(resultsCsv, listGpx) {
    let found = 0;
    for (const resultCsv of resultsCsv) {
        for (const recordGpx of listGpx) {
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

function fromCsvLine(data) {
    // console.log('data', data);
    if (data['Afstand']) {
        return {
            // in general csv only
            type: data['Activiteittype'],
            date: data['Datum'],
            name: data['Titel'],
            maxTemp: data['Max. temp.'],
            // in all csv
            distance: data['Afstand'],
            duration: data['Totale tijd'] || data['Tijd'],
            speed: data['Gemiddelde snelheid'],
            maxSpeed: data['Max. snelheid'],
            elevation: data['Stijging'],
            temperature: data['Gem. temperatuur'],
        }
    } else return {
        // in general csv only
        type: data['Activity Type'],
        date: data['Date'],
        name: data['Title'],
        maxTemp: data['Max. temp.'],
        // in all csv
        distance: data['Distance'],
        duration: data['Total Time'] || data['Time'],
        speed: data['Avg Speed'],
        maxSpeed: data['Max Speed'],
        elevation: data['Elev Gain'],
        temperature: data['Avg Temperature'],
    };
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

module.exports = {updateFromCsv, readCsv};
