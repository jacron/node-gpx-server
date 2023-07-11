const fields = [
    /* [targetlabel, Nederlands label, Engels label]
    NB subject to change! (maar Afstand zal wel niet veranderen)
     */
    // in general csv
    ['type', 'Activiteittype', 'Activity Type'],
    ['date', 'Datum', 'Date'],
    ['name', 'Titel', 'Title'],
    ['maxTemp', 'Max. temp.','Max. temp.' ],
    // in specific csv
    ['distance', 'Afstand', 'Distance'],
    ['duration', 'Tijd', 'Time'],
    ['speed', 'Gemiddelde snelheid', 'Avg Speed'],
    ['maxSpeed', 'Max. snelheid', 'Max Speed'],
    ['elevation', 'Totale stijging', 'Elev gain'],
    // ['temperature', 'Gem. temperatuur', 'Avg Temperature']
]

const csvFields = [
    'distance',
    'duration',
    'speed',
    'maxSpeed',
    'elevation',
    'temperature'
];

const extendedCsvFields = [
    'file',
    'start',
    'finish',
    'type',
    'date',
    'name',
    'distance',
    'duration',
    'speed',
    'maxSpeed',
    'elevation',
    'dateDisplay',
    'activityId',
    'dayOfTheWeek'
];

const activityFromCsv = {
    type: 'Fietsen',
    date: '2023-06-23 16:04:53',
    name: 'Hilversumse Meent',
    maxTemp: '29,0',
    distance: '54,72',
    duration: '02:53:11',
    speed: '19,0',
    maxSpeed: '30,9',
    elevation: '107',
    file: 'activity_11408275428.gpx',
    start: '2023-06-23T14:04:53.000Z',
    finish: '2023-06-23T17:20:04.000Z'
}

const gpxFields = [
    'file', 'start', 'finish'
]

const extendedGpxFields = [
    'file', 'start', 'finish', 'type', 'date', 'name', 'distance',
    'duration', 'speed', 'maxSpeed', 'elevation', 'firstPoint', 'endPoint'
];

module.exports = {fields, csvFields, extendedCsvFields, gpxFields, extendedGpxFields};
