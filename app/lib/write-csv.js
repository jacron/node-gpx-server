const {extendedCsvFields} = require("./csv-fields");
const {createObjectCsvWriter: createCsvWriter} = require("csv-writer");
const config = require("../../config");

function makeHeaders() {
    const headers = [];
    extendedCsvFields.forEach((field) => {
        headers.push({
            id: field,
            title: field
        });
    })
    return headers;
}

function writeResult(resultsCsv) {
    const headers = makeHeaders();
    createCsvWriter({header: headers, path: config.outputFile})
        .writeRecords(resultsCsv)
        .then(() => {
            console.log('The CSV file was written successfully!')

            console.log('...Finished!');
        })
        .catch((err) => {
            console.log(`Error writing CSV file: ${err}`);
        });
}

module.exports = {writeResult};
