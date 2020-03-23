function hasExtension(s, ext) {
    const p = s.lastIndexOf('.');
    if (p === -1) { return false }
    return s.substr(p + 1) === ext;
}

timeDiff = function( date1, date2 ) {
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

function leadZero(s) {
    const t = s.toString();
    if (t.length < 2) {return '0' + t}
    return s;
}

// function stripQuotes(s) {
//     if (!s) { return s; }
//     return s.substr(1, s.length - 2);
// }

function firstWord(s) {
    const words = s.split(' ');
    return words[0];
}

module.exports = {hasExtension, timeDiff, leadZero, firstWord};

// s = 'activity.last.gpx';
// console.log(hasExtension(s, 'gpx'));
// t = 5;
// console.log(leadZero(t));
// s = `"1,85"`;
// console.log(stripQuotes(s));
// s = 'een twee drie';
// console.log(firstWord(s));