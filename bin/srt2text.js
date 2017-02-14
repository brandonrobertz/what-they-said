#!/usr/bin/env node
var fs = require('fs');
// number of lines to look back to eliminate
// duplicate lines. the lines duplicate every time
// they should be moved up on the screen. i think
// most screens only show three lines of closed
// captioning, but increasing this doesn't hurt
// performance too much
var lookback = 5 * 4;

var infile = process.argv[process.argv.length - 1];
var data = fs.readFileSync(infile);
var lines = data.toString().split('\n');

function output(line) {
  if(line) {
    console.log(line);
  }
}

for(var i = 0; i < lines.length; i++) {
  var line = lines[i].trim();

  // skip the indices
  if(line.match(/^[0-9]+$/)) {
    continue;
  }

  // skip the timecodes. the are in this format:
  // 00:00:07,100 --> 00:00:07,500
  if(line.match(/[0-9:,]+\s*-->\s*[0-9:,]+/)) {
    continue;
  }

  var start = i - lookback;
  var end = i;
  if(i < lookback) {
    start = 0;
    end = i;
  }

  var previous = lines.slice( start, end);

  var inPrev = previous.indexOf(line);

  if( inPrev !== -1) {
    continue;
  }

  output(line);
}
