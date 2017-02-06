var lunr = require('lunr');

var Search = function Search(searchData, videoIds) {
  this.index = lunr.Index.loadPacked(searchData);
  this.videoIds = videoIds;
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
    videoId: this.videoIds[id],
    offset: seconds
  };
}

/**
 * Perform a search of our index for a given query
 */
Search.prototype.query = function query(q) {
  return this.index.search(q);
}

module.exports = Search;
