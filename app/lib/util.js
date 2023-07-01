const {dateFromFile} = require("./dateutil");

function hasExtension(s, ext) {
    const p = s.lastIndexOf('.');
    if (p === -1) { return false }
    return s.substring(p + 1) === ext;
}

function getFileFromPath(path) {
    const p = path.split('/');
    return p[p.length -1];
}

/**
 * Return file from path and then the filename without extension
 * @returns {*|string}
 * @param path
 */
function getFilename(path) {
    const s = getFileFromPath(path);
    const p = s.lastIndexOf('.');
    if (p === -1) { return s; }
    return s.substring(0, p);
}

function firstWord(s) {
    if (!s) return '';
    const words = s.split(' ');
    return words[0];
}

function nameFromFile(words) {
    return words.slice(0, 2).join(' ');
}

function getDataFromFilename(file) {
    // e.g. Hoenderloo-Walking-8-Mar-2020-at-15-28.gpx, from ViewRanger
    //      0          1       2 3   4    5  6  7
    const filename = file.replace('.gpx', '');
    //.replace(/-/g, ' ');
    const words = filename.split('-');
    if (words.length > 2) {
        const date = dateFromFile(words);
        return {
            name: nameFromFile(words),
            date,
            start: date,
            creator: 'ViewRanger',
        }
    } else {
        return {
            name: filename
        }
    }
}

module.exports = {getDataFromFilename, hasExtension, firstWord, getFilename};

