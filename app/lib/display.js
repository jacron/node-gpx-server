const {trimLeadingZero, getTime, getDate} = require("./util");
const {days} = require("../data/time");

function addDisplayValues(resultsCsv) {
    for (const csv of resultsCsv) {
        for (const field of ['distance', 'duration', 'speed', 'maxSpeed']) {
            if (csv[field]) {csv[field] = csv[field].replace(',', '.')}
        }
        for (const field of ['start', 'finish']) {
            if (csv[field]) {csv[field] = trimLeadingZero(getTime(csv[field]));}
        }
        csv['dateDisplay'] = getDate(csv['date']);
        // Id alleen afleiden uit een Garmin-bestandsnaam (activity_<id>.gpx). Oude rijen zonder
        // bestand, of met een andere naam (bv. Ermelo-Hiking-25-Feb-2020-at-11-44.gpx), houden
        // het activityId dat garmin-sync's repairCsv.js heeft ingevuld.
        const idFromFile = /^activity_(\d+)\./.exec(csv['file'] || '');
        if (idFromFile) {
            csv['activityId'] = idFromFile[1];
        }
        // Garmin-namen kunnen een spatie of regelovergang aan het eind hebben ("Driebergen \n")
        if (csv['name']) {
            csv['name'] = csv['name'].trim();
        }
        csv['duration'] = trimLeadingZero(csv['duration'].split(':').slice(0, 2).join(':'));
        csv['dayOfTheWeek'] = days[new Date(csv['date']).getDay()];
    }
}

module.exports = {addDisplayValues}
