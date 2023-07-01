const homedir = '/Volumes/Data-1/Data/garminconnect';

module.exports = {
    port: 3016,
    appTitle: 'gpx server',
    activitiesMap: homedir + "/activities",
    activitiesXlsFile: homedir + "/csv/activities.xlsx",
    activitiesCsvFile: homedir + "/csv/Activities.csv",
    outputFile: homedir + "/csv/ActivitiesOut.csv",

    caching: false,
    cache: {
        gpxlist: null
    },
    activitiesMapDirty: true,

    listeningToGarmin: false,  // initial value, can be changed later
};
