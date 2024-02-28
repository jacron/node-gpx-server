const config = require("../../config");
const fs = require("fs");

function moveFile(src, dest) {
    // prevent error EXDEV: avoid using fs.rename
    fs.copyFile(src, dest, () => {
        fs.rm(src, () => {});
    });
}

function moveGpxFiles(listGpx) {
    for (const gpx of listGpx) {
        const gpxFilename = `${config.activitiesNewMap}/${gpx.file}`;
        const csvFilename = gpxFilename.replace('.gpx', '.csv');
        const jsonFilename = gpxFilename.replace('.gpx', '.json');
        const newGpxFilename = `${config.activitiesMap}/${gpx.file}`;
        const newCsvFilename = newGpxFilename.replace('.gpx', '.csv');
        const newJsonFilename = newGpxFilename.replace('.gpx', '.json');
        moveFile(gpxFilename, newGpxFilename);
        moveFile(csvFilename, newCsvFilename);
        moveFile(jsonFilename, newJsonFilename);
    }
}

module.exports = { moveGpxFiles };
