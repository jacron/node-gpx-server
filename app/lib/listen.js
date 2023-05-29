const chokidar = require('chokidar');
const fs = require('fs');
const config = require('../../config');

function move(src) {
    const dst = src.replace(config.downloadMap, config.activitiesMap);
    // fs.renameSync(src, dst); // rename won't work cross device
    fs.readFile(src, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            fs.writeFile(dst, data, () => {
                // console.log('will unlink ' + src);
                fs.unlink(src, err => {
                    if (err) {
                        console.error(err);
                    }
                })
            });
        }
    });
}

function listenToDownloads() {
    const options = {
        ignoreInitial: true,
        depth: 0
    };
    chokidar.watch(config.downloadMap, options).on('add', path => {
        // console.log(path + " has been added.");
        if (~path.indexOf("/activity_")) {
            if (path.endsWith(".gpx") || path.endsWith(".csv")) {
                // console.log("Will move " + path);
                move(path);
            }
        }
    });
}

module.exports = {listenToDownloads}
