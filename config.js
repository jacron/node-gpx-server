const homedir = '/Volumes/Data-1/Data/garminconnect';

module.exports = {
    port: 3016,
    appTitle: 'gpx server',
    activitiesMap: homedir + "/activities",
    activitiesXlsFile: homedir + "/csv/activities.xlsx",
    activitiesCsvFile: homedir + "/csv/Activities.csv",
    cache: {
        gpxlist: null
    },
    activitiesMapDirty: true
};
