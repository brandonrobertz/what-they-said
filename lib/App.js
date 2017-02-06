var React = require('react');
var ReactDOM = require('react-dom');
var classnames = require('classnames');

var Search = require('./search');

var mountNode = document.getElementById('app');

var Video = React.createClass({
  getInitialState: function() {
    return {};
  },

  render: function() {
    // don't render anything if we don't have a video
    if(!this.props.selectedVideo) {
      return <div id="noVideoSelected">
          <div className="title">Did Trump say it?</div>
          <div className="subtitle">search hundreds of campaign speeches and appearances</div>
        </div>;
    }
    var vid = this.props.selectedVideo.videoId;
    var s = this.props.selectedVideo.offset - 2;
    var e = s + 5;

    var url = 'https://www.youtube.com/embed/' + vid +
      '?start=' + s + '&end=' + e +
      '&cc_load_policy=1&autoplay=1&controls=0&hl=en' +
      '&iv_load_policy=3';
    return (
      <div id="playVideo">
      <iframe
        src={url}
        width='560' height='340'
        frameBorder='0'
        allowFullScreen
      />
      </div>
    );
  }
});

var Result = React.createClass({
  getInitialState: function() {
    return {
      active: this.props.active
    };
  },

  click: function() {
    this.props.onSelectVideo(this.props.meta);
    this.setState({active: true});
  },

  render: function() {
    var that = this;
    var meta = that.props.meta;
    var classes = classnames('thumb', {active: this.state.active});
    var imgUrl = 'dist/metadata/' + meta.videoId + '.jpg';
    return (
      <span className='searchResult'
          onClick={that.click}>
        <img className={classes} src={imgUrl} />
      </span>
    );
  }
});

var Results = React.createClass({
  getInitialState: function() {
    return {
      search: this.props.search
    };
  },

  render: function() {
    var that = this;
    return (
      <div id="searchResults">
        {that.props.searchResults.map(function(result){
          var meta = that.state.search.ref2meta(result.ref);
          return (<Result
            key={result.ref}
            onSelectVideo={that.props.onSelectVideo}
            active={false}
            meta={meta}
          />);
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
    this.setState({
      search: this.props.searchIndex,
      videoIds: this.props.videoIds
    });
  },

  handleSubmit: function(e) {
    this.setState({
      searchResults: this.state.search.query(this.state.query)
    });
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
    this.setState({
      selectedVideo: meta
    });
  },

  render: function() {
    /*<input type="submit" id="searchSubmit" value="Submit" />*/
    return (
      <div>
        <Video selectedVideo={this.state.selectedVideo} />
        <form onSubmit={this.handleSubmit}>
          <input type="text"
            id="searchInput"
            onChange={this.handleChangeQuery}
            value={this.state.query} />
        </form>
        <Results
          id="searchResults"
          searchResults={this.state.searchResults}
          search={this.state.search}
          onSelectVideo={this.onSelectVideo}
        />
        <div id="footer">
          Built by <a target="_blank" href="https://twitter.com/bxrobertz">Brandon Roberts</a>.
          Copyright 2017.</div>
      </div>
    );
  }
});

var Prefetch = React.createClass({
  getInitialState: function() {
    return {
      status: 'Loading ...',
      fetched: false,
      progress: 0.0,
      error: false,
      searchIndex: null,
      videoIds: null
    };
  },

  fetchData: function(url, callback) {
    var that = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onprogress = function (e) {
      if (e.lengthComputable) {
        var pct = e.loaded / e.total;
        that.setState({
          progress: pct
        });
      }
    }
    xhr.onload = function() {
      var responseText = this.responseText;
      that.setState({
        progress: 1.0,
        status: 'Rendering data'
      }, function() {
        var data = JSON.parse(responseText);
        that.setState({
          status: 'Rendering complete'
        });
        callback(null, data);
      });
    }
    xhr.onerror = function() {
      that.setState({
        status: 'Failure!',
        error: true
      });
    }
    xhr.send();
  },

  componentDidMount: function() {
    var that = this;
    that.setState({
      progress: 0.0,
      status: 'Downloading searchIndex'
    }, function() {
      // this is very ugly but I don't want to pull in async or promise lib
      that.fetchData('dist/searchIndex.js', function(err, searchIndex) {
        if(err) {
          that.setState({error: true});
          return console.error('Error fetching searchIndex', err);
        }
        that.setState({
          progress: 0.0,
          status: 'Downloading video IDs'
        }, function() {
          that.fetchData('dist/videoIds.js', function(err, videoIds) {
            if(err) {
              that.setState({error: true});
              return console.error('Error fetching videoIds', err);
            }
            that.setState({
              progress: 1.0,
              status: 'Building search index'
            }, function() {
              var search = new Search(searchIndex, videoIds);
              that.setState({
                progress: 1.0,
                status: 'Starting app'
              });
              that.setState({
                fetched: true,
                searchIndex: search,
                videoIds: videoIds
              });
            });
          });
        });
      });
    });

  },

  render: function() {
    if(this.state.fetched) {
      return <App
        searchIndex={this.state.searchIndex}
        videoIds={this.state.videoIds}
      />;
    }
    if(this.state.error) {
      return (
        <div id="loadFailure">
          A fatal error has occurred. Try reloading the page.
        </div>
      );
    }
    if(this.state.progress !== 1.0 && this.state.progress > 0) {
      var pct = (this.state.progress * 100).toFixed(2);
      return (
        <div id='progress'>
          <span>{this.state.status}</span>&nbsp;
          <span className={this.state.progress}>{pct}%</span>
        </div>
      );
    }
    return (
      <div id='progress'>
        <span>{this.state.status}</span>
      </div>
    );
  }
});

ReactDOM.render(
  <Prefetch />,
  mountNode
);
