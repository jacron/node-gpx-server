/*
Als een gpx of csv bestand binnenkomt in de actviteitenfolder,
en we hebben ze dan alletwee aanwezig, dan kan er een json worden gemaakt.
Maakt niet uit of de json al bestaat, we stellen hem opnieuw samen.
Dus een oud gpx bestand bij een rit zonder csv en dus zonder afstand,
die kun je updaten door de csv erbij te downloaden van garmin connect.
PS Helemaal niet nodig om alle bestanden weer te checken en de hele lijst opnieuw samen te stellen?
Alleen, door de caching die we tegenwoordig doen, is het wel zaak dat een nieuwe json
aan die cache wordt toegevoegd.
 */
const chokidar = require('chokidar');
const fs = require('fs');
const config = require('../../config');
const {getAllGpx} = require("./gpx");

function updateList(path) {
    let otherpath = null;
    let jsonpath = null;
    if (path.endsWith('.gpx')) {
        otherpath = path.replace('.gpx', '.csv');
        jsonpath = path.replace('.gpx', '.json');
    } else if (path.endsWith('.csv')) {
        otherpath = path.replace('.csv', '.gpx');
        jsonpath = path.replace('.csv', '.json');
    }
    if (otherpath && fs.existsSync(otherpath)) {
        if (fs.existsSync(jsonpath)) {
            fs.unlinkSync(jsonpath);
            console.log('jsonpath verwijderd')
        }
        config.activitiesMapDirty = true;
        getAllGpx().then(() => {
            console.log('list was renewed');
        })
    }
}

function setWatch(activitiesMap) {
    const options = {
        ignoreInitial: true,
        depth: 0
    };
    chokidar.watch(activitiesMap, options).on('add', path => {
        console.log(path + " has been added.");
        if (~path.indexOf("/activity_")) {
            updateList(path);
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
