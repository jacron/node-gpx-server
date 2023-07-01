function leadZero(s) {
    const t = s.toString();
    if (t.length < 2) {return '0' + t}
    return s;
}

function getRawDuration(start, finish) {
    const diff = timeDiff(new Date(start), new Date(finish));
    let hours = diff.hours;
    const minutes = diff.minutes;
    if (diff.days > 0) { hours += diff.days * 24}
    return `${hours}:${leadZero(minutes)}`;
}

const timeDiff = function( date1, date2 ) {
    //Get 1 day in milliseconds
    // const one_day=1000*60*60*24;

    // Convert both dates to milliseconds
    const date1_ms = date1.getTime();
    const date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    let difference_ms = date2_ms - date1_ms;
    difference_ms = difference_ms/1000;
    const seconds = Math.floor(difference_ms % 60);
    difference_ms = difference_ms/60;
    const minutes = Math.floor(difference_ms % 60);
    difference_ms = difference_ms/60;
    const hours = Math.floor(difference_ms % 24);
    const days = Math.floor(difference_ms/24);
    return {
        days, hours, minutes, seconds
    };
};

function monthFromShort(short) {
    const monthShorts = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    for (let i = 0; i < monthShorts.length; i++) {
        if (short === monthShorts[i]) {
            if (i + 1 < 10) {
                return `0${i + 1}`;
            }
            return i + 1;
        }
    }
    return '-1';
}

function dateFromFile(words) {
    // e.g. 2020-03-10T08:56:55.000Z
    const month = monthFromShort(words[3]);
    let day = words[2];
    if (day < 10) {
        day = '0' + day;
    }
    const hours = words[6] - 1;  // Amsterdam => CET
    return `${words[4]}-${month}-${day}T${hours}:${words[7]}:00.000Z`;
}

module.exports = {timeDiff, dateFromFile, getRawDuration};
