#!/usr/bin/env node
var fs = require('fs');
var _ = require('lodash');
var parser = require('subtitles-parser');
var lunr = require('lunr');

if(process.argv.length < 3) {
  process.stderr.write('USAGE: extract.js ./srt/subtitle/dir /where/to/save/index.json');
  process.stderr.write('  This tool will read in the srt subtitle files, which are');
  process.stderr.write('  sound by default in ./srt, and will build a reverse index');
  process.stderr.write('  for searching speech transcripts and locting video ID and');
  process.stderr.write('  offset time inside video.');
  process.exit(1);
}

const outfile = process.argv[process.argv.length - 1];
const indir = process.argv[process.argv.length - 2];
// this controls how many subtitle segments forward to look
// when compiling our intex. a typical subtitle segment is
// anywhere from one to five words, and, basically boils
// down to one closed-captioned "line" displayed on TV
// at a time. increasing this will give a greater chance
// at users being able to search and find things, but also
// will increase the memory requirements and complexity of
// the resulting index
const forward_steps = 3;

var index = lunr(function() {
  this.field('text', {boost: 10});
  this.field('startTime');
  this.field('video');
  this.ref('id');
});

function writeOut(data) {
  fs.writeFileSync( outfile, JSON.stringify(data));
}

function processFile(filename) {
  var filepath = indir + '/' + filename;
  // video ID is embedded by default like so by youtube-dl
  var videoId = filename.match('.*\-(.*)\..*\.srt')[1];
  var srt = fs.readFileSync(filepath, 'utf-8');
  var data = parser.fromSrt(srt);

  console.log('Processing', filename);

  for(var i = 0; i < data.length - forward_steps; i++) {
    //var subset = data.slice(i, i + forward_steps);
    var subset = data[i];
    index.add({
      id: `${videoId}-${subset.startTime}`,
      text: subset.text
    });
  }

  console.log('Processing complete!');
}

var filenames = fs.readdirSync( indir);
_.forEach(filenames, processFile);

console.log('saving index to', outfile);
writeOut(index.toJSON());

