var fs = require('fs');
var lunr = require('lunr');
var searchIndex = require('./searchIndex.json.js');

//const searchIndexPath = './searchIndex.json';
//const index = lunr.load(JSON.parse(fs.readFileSync(searchIndexPath)));

window.Index = searchIndex;
