const {fields} = require("./csv-fields");

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


function writeResult(resultsCsv) {
    const headers = makeHeaders();

}

module.exports = {writeResult};
