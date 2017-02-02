#!/usr/bin/env node
var fs = require('fs');
var _ = require('lodash');
var parser = require('subtitles-parser');
var lunr = require('lunr');

if(process.argv.length < 3) {
  var usage = [
    'USAGE: extract.js ./srt/subtitle/dir /where/to/save/index.json',
    '  This tool will read in the srt subtitle files, which are',
    '  found by default in ./srt, and will build a reverse index',
    '  for searching speech transcripts and locting video ID and',
    '  offset time inside video.'
  ];
  _.forEach(usage, process.stderr.write);
  process.exit(1);
}

var outfile = process.argv[process.argv.length - 1];
var indir = process.argv[process.argv.length - 2];
// this controls how many subtitle segments forward to look
// when compiling our intex. a typical subtitle segment is
// anywhere from one to five words, and, basically boils
// down to one closed-captioned "line" displayed on TV
// at a time. increasing this will give a greater chance
// at users being able to search and find things, but also
// will increase the memory requirements and complexity of
// the resulting index
var forward_steps = 3;

// keep reverse mapping from list index -> videoId, this allows
// us to compress our index substantially
var videoIds = [];

var index = lunr(function() {
  this.field('text', {boost: 10});
  this.field('startTime');
  this.field('videoId');
  this.ref('id');
});

/**
 * Take a videoID and insert it into or look it up from
 * our videoIds list and return an index to that list. This
 * shrinks the amount of storage we need for our index.
 */
function videoIdToIndex(videoId) {
  var ix = videoIds.indexOf(videoId);
  return ix > -1 ? ix : videoIds.push(videoId);
}

/**
 * Convert timestamps in thos format 00:00:29,689 to
 * seconds used for offsetting in youtube.
 */
function hmsToSeconds(str) {
  var hms = str.split(',')[0];
  var splitted = hms.split(':');
  var h = Number.parseInt(splitted[0]);
  var m = Number.parseInt(splitted[1]);
  var s = Number.parseInt(splitted[2]);
  return (h * 60 * 60) + (m * 60) + s;
}

function processFile(filename) {
  var filepath = indir + '/' + filename;
  // video ID is embedded by default like so by youtube-dl
  var videoId = filename.match('.*\-(.*)\.en\.vtt\.srt')[1];
  var videoIx = videoIdToIndex(videoId);
  var srt = fs.readFileSync(filepath, 'utf-8');
  var data = parser.fromSrt(srt);

  console.log('Processing', filename);

  for(var i = 0; i < data.length - forward_steps; i++) {
    //var subset = data.slice(i, i + forward_steps);
    var subset = data[i];
    var startTime = hmsToSeconds(subset.startTime);
    index.add({
      id: `${videoId}-${startTime}`,
      startTime: startTime,
      text: subset.text
    });
  }

  console.log('Processing complete!');
}

var filenames = fs.readdirSync( indir);
_.forEach(filenames, processFile);

console.log('saving index to', outfile);
fs.writeFileSync( outfile, JSON.stringify(index.toPackedJSON()));
console.log('saving videoId index to', `${outfile}.videoIds`);
fs.writeFileSync( `${outfile}.videoIds`, JSON.stringify(videoIds));
