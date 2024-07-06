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
        csv['activityId'] = csv['file'].split('.')[0].split('_')[1];
        csv['duration'] = trimLeadingZero(csv['duration'].split(':').slice(0, 2).join(':'));
        csv['dayOfTheWeek'] = days[new Date(csv['date']).getDay()];
    }
}

module.exports = {addDisplayValues}
