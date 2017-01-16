#!/usr/bin/env node
var fs = require('fs');
var parser = require('subtitles-parser');

if(process.argv.length < 2) {
  console.log('USAGE: extract.js /path/to/captionfile.srt');
  process.exit(1);
}

var filename = process.argv[process.argv.length - 1];
var srt = fs.readFileSync(filename, "utf-8");
var data = parser.fromSrt(srt);
console.log('data', data);

// parser.parse("WEBVTT\n\n");
// parser.parse("00:32.500 --> 00:33.500 align:start size:50%\n");
// parser.parse("<v.loud Mary>That's awesome!");
// parser.flush();
