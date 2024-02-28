const {createObjectCsvWriter: createCsvWriter} = require("csv-writer");

function makeHeaders(fields) {
    const headers = [];
    fields.forEach((field) => {
        headers.push({
            id: field,
            title: field
        });
    })
    return headers;
}

function writeResult(resultsCsv, path, fields) {
    const headers = makeHeaders(fields);
    createCsvWriter({header: headers, path: path})
        .writeRecords(resultsCsv)
        .then(() => {
            console.log('The CSV file was written successfully to ' + path + '!')
        })
        .catch((err) => {
            console.log(`Error writing CSV file: ${err}`);
        });
}

module.exports = {writeResult};
