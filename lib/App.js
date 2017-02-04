var React = require('react');
var ReactDOM = require('react-dom');

var Search = require('./search');

var mountNode = document.getElementById('app');

var Video = React.createClass({
  getInitialState: function() {
    return {
      videoId: null,
      offset: null
    };
  },

  render: function() {
    return (
      <div></div>
    );
  }
});

var Results = React.createClass({
  getInitialState: function() {
    return {
      search: this.props.search
    };
  },

  componentWillUpdate: function(nextProps, nextState){
    console.log('nextProps', nextProps, 'nextState', nextState);
    // perform any preparations for an upcoming update
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
            <span className='video' key={result.ref}>
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

  render: function() {
    return (
      <div>
        <Video selectedVideo={this.selectedVideo} />
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
        />
      </div>
    );
  }
});

ReactDOM.render(
  <App />,
  mountNode
);
