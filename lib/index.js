var _ = require('lodash');
var lunr = require('lunr');
var $ = require('jquery');
//var Youtube = require("youtube-api");

//var angular = require('angularjs');
//
////var MainCtrl = require('./controllers/main');
////
//angular
//  .module('trumpsaid', [])
//  .controller('MainCtrl', MainCtrl);

var index;

/**
 * Convert result ref ids [videoIx]-[seconds offset]
 * to a metadata result.
 */
function ref2meta(ref) {
  var idStr = ref.split('-')[0];
  var id = Number.parseInt(idStr);
  var seconds = Number.parseInt(ref.split('-')[1]);
  return {
    videoId: VIDS[id],
    offset: seconds
  };
}

function videoClicked(meta) {
  console.log("meta", `${JSON.stringify(meta)}`);
  // https://youtu.be/kEG_ljecfZY?t=101
  var url = `https://www.youtube.com/embed/${meta.videoId}?start=${meta.offset}`;
  var embed = `<iframe width="640" height="360" target="_top" ' +
    'class="video" src="${url}" frameborder="0" allowfullscreen></iframe>`;
  //console.log('embedUrl', embedUrl);
  //res.append(`<img id="${meta.videoId}" src="dist/metadata/${meta.videoId}.jpg" />`);
  $('.video').remove();
  $('#videoContainer').append(embed);
  //$('#').click(videoClicked.bind(this, meta));
  //$('#videoContainer').html(embedUrl);
  //var vc = $("#videoContainer");
  //window.VC = vc;
  //vc.src(url);
  //$("#videoContainer").show();
}

function appendResult(result) {
  var meta = ref2meta(result.ref);
  var res = $("#results");
  console.log('result', result, meta);
  res.append(`<img id="${meta.videoId}" src="dist/metadata/${meta.videoId}.jpg" />`);
  $(`#${meta.videoId}`).click(videoClicked.bind(this, meta));
  //$("#results" ).append( "<p>""</p>" );
}

window.doSearch = function doSearch() {
  var searchText = $('#search').val();
  console.log('searching for', searchText);
  var results = index.search(searchText);
  if(results) {
    _.forEach(results, appendResult);
  } else {
    appendResult('No results.');
  }
}

function load() {
  index = lunr.Index.loadPacked(window.DATA);
  $('#searchForm').show();
  $('#searchForm').submit(doSearch);
  $('#loading').hide();
}

$().ready(load);
