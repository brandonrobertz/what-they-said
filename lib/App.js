var React = require('react');
var ReactDOM = require('react-dom');

var Search = require('./search');

var mountNode = document.getElementById('app');

var Video = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentWillUpdate: function(p, s) {
    console.log('componentWillUpdate p', p, 's', s);
  },

  render: function() {
    // don't render anything if we don't have a video
    if(!this.props.selectedVideo) {
      return <div id="noVideoSelected"></div>;
    }
    var vid = this.props.selectedVideo.videoId;
    var s = this.props.selectedVideo.offset - 2;
    var e = s + 5;

    var url = `https://www.youtube.com/embed/${vid}?start=${s}&end=${e}&cc_load_policy=1&autoplay=1`;
    return (
      <div id="playVideo">
      <p>VIDEO HERE</p>
      <iframe
        src={url}
        width='560' height='340'
        frameBorder='0'
        webkitAllowFullScreen
        mozallowfullscreen
        allowFullScreen
      />
      </div>
    );
  }
});

var Results = React.createClass({
  getInitialState: function() {
    return {
      search: this.props.search
    };
  },

  videoClicked: function videoClicked(meta) {
    console.log('Results: video clicked', meta);
    this.props.onSelectVideo(meta);
    //var url = `https://www.youtube.com/embed/${meta.videoId}?start=${meta.offset}`;
    //var embed = `<iframe width="640" height="360" target="_top" ' +
    //'class="video" src="${url}" frameborder="0" allowfullscreen></iframe>`;
    //$('.video').remove();
    //$('#videoContainer').append(embed);
  },

  render: function() {
    var that = this;
    return (
      <div id="searchResults">
        {that.props.searchResults.map(function(result){
          console.log('result', result);
          var meta = that.state.search.ref2meta(result.ref);
          var imgUrl = `dist/metadata/${meta.videoId}.jpg`;
          return (
            <span className='searchResult' key={result.ref}
              onClick={that.videoClicked.bind(that, meta)}>
              <img className='thumb' src={imgUrl} />
            </span>
          );
        })}
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      // store our initialized search here
      search: null,
      // our query will be populated/updated here
      query: '',
      // video ids list will end up here, this is our
      // mapping from ordinal index to youtube video id
      videoIds: null,
      // when a user selects a video, we will place it here
      selectedVideo: null,
      // and when we get a set of results, we'll put them here
      searchResults: []
    };
  },

  componentWillMount: function() {
    console.log('loading data');
    var search = new Search(window.DATA);
    console.log('loading videoIds');
    var videoIds = window.VIDS;
    this.setState({
      search: search,
      videoIds: videoIds
    });
  },

  handleSubmit: function(e) {
    console.log('search query', this.state.query);
    this.setState({
      searchResults: this.state.search.query(this.state.query)
    });
    console.log('results', this.state.searchResults);
    e.preventDefault();
    e.stopPropagation();
    return false;
  },

  handleChangeQuery: function(event) {
    this.setState({
      query: event.target.value
    });
  },

  onSelectVideo: function(meta) {
    console.log('App: videoSelected', meta);
    this.setState({
      selectedVideo: meta
    });
  },

  render: function() {
    return (
      <div>
        <Video selectedVideo={this.state.selectedVideo} />
        <form onSubmit={this.handleSubmit}>
          <input type="text"
            placeholder="Did he say it?"
            onChange={this.handleChangeQuery}
            value={this.state.query} />
          <input type="submit" value="Submit" />
        </form>
        <Results
          searchResults={this.state.searchResults}
          search={this.state.search}
          onSelectVideo={this.onSelectVideo}
        />
      </div>
    );
  }
});

ReactDOM.render(
  <App />,
  mountNode
);
