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
    const fields = [
        /* [targetlabel, Nederlands label, Engels label]
        NB subject to change! (maar Afstand zal wel niet veranderen)
         */
        // in general csv
        ['type', 'Activiteittype', 'Activity Type'],
        ['date', 'Datum', 'Date'],
        ['name', 'Titel', 'Title'],
        ['maxTemp', 'Max. temp.','Max. temp.' ],
        // in specific csv
        ['distance', 'Afstand', 'Distance'],
        ['duration', 'Tijd', 'Time'],
        ['speed', 'Gemiddelde snelheid', 'Avg Speed'],
        ['maxSpeed', 'Max. snelheid', 'Max Speed'],
        ['elevation', 'Totale stijging', 'Elev gain'],
        ['temperature', 'Gem. temperatuur', 'Avg Temperature']
    ]
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

module.exports = {updateFromCsv, readCsv};
