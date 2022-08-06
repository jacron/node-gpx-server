/*
const homedir = require('os').homedir();


module.exports = {
    port: 3016,
    appTitle: 'gpx server',
    activitiesMap: homedir + "/Documents/garminconnect/activities",
    activitiesXlsFile: homedir + "/Documents/garminconnect/csv/activities.xlsx",
    activitiesCsvFile: homedir + "/Documents/garminconnect/csv/Activities.csv",
    downloadMap: "/Volumes/Abeel/Download",
};
*/

const homedir = '/Volumes/Data/Data/garminconnect';  // require('os').homedir();

module.exports = {
    port: 3016,
    appTitle: 'gpx server',
    activitiesMap: homedir + "/activities",
    activitiesXlsFile: homedir + "/csv/activities.xlsx",
    activitiesCsvFile: homedir + "/csv/Activities.csv",
    downloadMap: "/Volumes/Abeel/Download",
};

