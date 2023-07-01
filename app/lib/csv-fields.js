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

module.exports = {fields, csvFields};
