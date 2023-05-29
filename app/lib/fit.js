// test the library

const fs = require('fs');
const EasyFit = require('easy-fit').default;
const fitPath = '/Volumes/EDGE 1000/Garmin/Activities/2020-07-24-15-28-46.fit';

const easyFit = new EasyFit({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'km',
    temperatureUnit: 'celcius',
    eleapsedRecordFiedl: true,
    mode: 'cascade'
})

function showLaps(laps) {
    for (const lap of laps) {
        // console.log(lap);
        console.log(lap.timestamp);
        console.log('n records', lap.records.length);
    }
}

function showSessions(sessions) {
    for (const session of sessions) {
        console.log(session.timestamp);
        if (session.laps) {
            console.log('n laps', session.laps.length);
            // console.dir(session.laps);
            showLaps(session.laps);
        }
    }
}

function showEvents(events) {
    for (const event of events) {
        console.log(event);
    }
}

function showData(data) {
    console.log(data.device_info.timestamp);
    const activity = data.activity;
    console.log(activity.timestamp);
    console.log(activity.total_timer_time);
    // console.dir(activity.sessions);
    showSessions(activity.sessions);
    // console.dir(activity.events);
    // showEvents(activity.events);
}

fs.readFile(fitPath, (err, content) => {
    if (err) {
        console.error(err);
    } else {
        easyFit.parse(content, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                showData(data);
            }
        })
    }
});
