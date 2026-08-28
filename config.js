const fs = require('fs');
const os = require('os');
const homedir = '/Volumes/NAS_Data/Data/garminconnect';
const realHomedir = os.homedir();

const activitiesNewMap = realHomedir + "/Downloads/newactivities";  //  homedir + "/activities-new",

// wordt gelezen door elke gpx-import; als de map ontbreekt (bv. na een schone checkout
// of ander Downloads-pad) faalt /gpx/list/all stil, dus zorg dat hij altijd bestaat.
fs.mkdirSync(activitiesNewMap, {recursive: true});

if (!fs.existsSync(homedir)) {
    console.warn(`LET OP: ${homedir} is niet bereikbaar (NAS niet gemount?) — activiteitenlijst blijft dan leeg.`);
}

module.exports = {
    port: 3016,
    appTitle: 'gpx server',
    activitiesMap: homedir + "/activities",
    activitiesXlsFile: homedir + "/csv/activities.xlsx",
    activitiesCsvFile: homedir + "/csv/Activities.csv",
    outputFile: homedir + "/csv/ActivitiesOut.csv",
    activitiesNewMap,
};
