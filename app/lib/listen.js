const chokidar = require('chokidar');
const fs = require('fs');
const config = require('../../config');
const {getFilename} = require("./util");
const {getAllGpx} = require("./gpx");

/* cache */
let prevFile = null;

function setWatch(activitiesMap) {
    const options = {
        ignoreInitial: true,
        depth: 0
    };
    chokidar.watch(activitiesMap, options).on('add', path => {
        console.log(path + " has been added.");
        if (~path.indexOf("/activity_")) {
            if (path.endsWith(".gpx") || path.endsWith(".csv")) {
                if (prevFile && getFilename(prevFile) === getFilename(path)) {
                    config.activitiesMapDirty = true;
                    getAllGpx().then(() => {
                        console.log('list was renewed');
                    })
                }
                prevFile = path;
            }
        }
    });

}

function listenToDownloads() {
    const {activitiesMap} = config;
    if (!fs.existsSync(activitiesMap)) {
        console.error('Kan niet openen: ' + activitiesMap);
        return;
    }
    console.log('Listening on the adding of files to directory ' + activitiesMap)
    setWatch(activitiesMap);
}

module.exports = {listenToDownloads}
