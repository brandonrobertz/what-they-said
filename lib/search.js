var _ = require('lodash');
var lunr = require('lunr');

var Search = function Search(data) {
  // TODO: emit events as we load this
  console.log('loading index');
  this.index = lunr.Index.loadPacked(data);
}

/**
 * Convert result ref ids [videoIx]-[seconds offset]
 * to a metadata result in this format:
 * {
 *    videoId: '1Ilakf8_91a'
 *    offset: 800
 * }
 */
Search.prototype.ref2meta = function ref2meta(ref) {
  var parts = ref.split('-');
  var idStr = parts[0];
  var id = Number.parseInt(idStr);
  var seconds = Number.parseInt(parts[1]);
  return {
    videoId: VIDS[id],
    offset: seconds
  };
}

/**
 * Perform a search of our index for a given query
 */
Search.prototype.query = function query(q) {
  return this.index.search(q);
}

function videoClicked(meta) {
  console.log("meta", `${JSON.stringify(meta)}`);
  var url = `https://www.youtube.com/embed/${meta.videoId}?start=${meta.offset}`;
  var embed = `<iframe width="640" height="360" target="_top" ' +
    'class="video" src="${url}" frameborder="0" allowfullscreen></iframe>`;
  $('.video').remove();
  $('#videoContainer').append(embed);
}

function appendResult(result) {
  var meta = ref2meta(result.ref);
  var res = $("#results");
  console.log('result', result, meta);
  res.append(`<img id="${meta.videoId}" src="dist/metadata/${meta.videoId}.jpg" />`);
  $(`#${meta.videoId}`).click(videoClicked.bind(this, meta));
  //$("#results" ).append( "<p>""</p>" );
}

function searchIndex(query) {
  return index.search(query);
}

function load() {
  var index = lunr.Index.loadPacked(window.DATA);
  $('#searchForm').show();
  $('#searchForm').submit(doSearch);
  $('#loading').hide();
}

module.exports = Search;
