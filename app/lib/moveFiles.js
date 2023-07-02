const config = require("../../config");
const fs = require("fs");

function moveGpxFiles(listGpx) {
    for (const gpx of listGpx) {
        const gpxFilename = `${config.activitiesNewMap}/${gpx.file}`;
        const csvFilename = gpxFilename.replace('.gpx', '.csv');
        const jsonFilename = gpxFilename.replace('.gpx', '.json');
        const newGpxFilename = `${config.activitiesMap}/${gpx.file}`;
        const newCsvFilename = newGpxFilename.replace('.gpx', '.csv');
        const newJsonFilename = newGpxFilename.replace('.gpx', '.json');
        fs.rename(gpxFilename, newGpxFilename, (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.rename(csvFilename, newCsvFilename, (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.rename(jsonFilename, newJsonFilename, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}

module.exports = { moveGpxFiles };
