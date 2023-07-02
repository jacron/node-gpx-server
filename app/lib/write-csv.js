const {extendedCsvFields} = require("../data/fields");
const {createObjectCsvWriter: createCsvWriter} = require("csv-writer");

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

function writeResult(resultsCsv, path) {
    const headers = makeHeaders();
    createCsvWriter({header: headers, path: path})
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
