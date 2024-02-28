const os = require('os');
const homedir = '/Volumes/Data-1/Data/garminconnect';
const realHomedir = os.homedir();

module.exports = {
    port: 3016,
    appTitle: 'gpx server',
    activitiesMap: homedir + "/activities",
    activitiesXlsFile: homedir + "/csv/activities.xlsx",
    activitiesCsvFile: homedir + "/csv/Activities.csv",
    outputFile: homedir + "/csv/ActivitiesOut.csv",
    activitiesNewMap: realHomedir + "/newactivities",  //  homedir + "/activities-new",
};
