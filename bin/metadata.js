#!/usr/bin/env node
var _ = require('lodash');
var fs = require('fs.extra');

if(process.argv.length < 4) {
  var usage = [
    'USAGE: metadata.js inputdir outputdir',
    '  This tool takes all the thumbails download by youtube-dl',
    '  (found in the ./download directory by default) and extracts',
    '  the video ID from the filename, and copies it to the',
    '  output dir as [youtubeID].jpg',
  ];
  _.forEach(usage, (u) => {
    process.stderr.write(u);
    process.stderr.write('\n');
  });
  process.exit(1);
}

var indir = process.argv[process.argv.length - 2];
var outdir = process.argv[process.argv.length - 1];

function filterThumbnail(filename) {
  return filename.match(/.*\.jpg/);
}

function processThumbnail(filename) {
  var videoId = filename.match(/.*\-(.{11,})\.jpg/)[1];
  var newName = `${videoId}.jpg`;
  console.log(`Copying ${filename} to ${videoId}.jpg`);
  fs.copy(`${indir}/${filename}`, `${outdir}/${newName}`, { replace: true}, (err)=>{
    if(err) {
      console.error('Copy error', err);
    }
  });
}

var filenames = fs.readdirSync( indir).filter(filterThumbnail);
_.forEach(filenames, processThumbnail);
