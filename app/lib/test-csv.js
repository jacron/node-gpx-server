// import fs from "fs";
// import config from "../../config";
// import csvParser from "csv-parser";
// import {createObjectCsvWriter as createCsvWriter} from "csv-writer";
// import {fields} from "./csv";
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvParser = require('csv-parser');
const config = require('../../config');
const fs = require('fs');
const {fields} = require("./csv");

function makeHeaders() {
    const headers = [];
    fields.forEach((field) => {
        headers.push({
            id: field[1],
            title: field[1]
        });
    })
    headers.push({
        id: 'id',
        title: 'id'
    });
    return headers;
}

function fromCsvLine2(line) {
    const data = {};
    // const labelIndex = line['Afstand'] ? 1 : 2; // Gebruik Nederlands of Engels label
    for (let field of fields) {
        data[field[1]] = line[field[1]];
    }
    data['id'] = 123456789;
    return data;
}

function makeCsvWriter(headers) {
    return createCsvWriter({
        path: config.outputFile,
        header: headers,
        // alwaysQuote: true,
    });
}

function writeDataToFile(modifiedCsvJson) {
    console.log(`Writing data to a file...`);
    const headers = makeHeaders();
    console.log('headers', headers)
    makeCsvWriter(headers).writeRecords(modifiedCsvJson)
        .then(() => {
            console.log('The CSV file was written successfully!')

            console.log('...Finished!');
        })
        .catch((err) => {
            console.log(`Error writing CSV file: ${err}`);
        });
}


function testModifyCsv() {
    console.log('testModifyCsv');
    const resultsCsv = [];
    fs.createReadStream(config.activitiesCsvFile)
        .pipe(csvParser())
        // .on('headers', (headers) => {
        // console.log(headers);
        // })
        .on('data', data =>
            resultsCsv.push(fromCsvLine2(data)))
        .on('end', () => {
            console.log(resultsCsv[0]);
            // resolve(resultsCsv);
            writeDataToFile(resultsCsv)
        })
}

testModifyCsv();
