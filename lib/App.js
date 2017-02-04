var React = require('react');
var ReactDOM = require('react-dom');

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
    return {};
  },

  render: function() {
    return (
      <div></div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      searchQuery: '',
      videoIds: null,
      searchIndex: null,
      selectedVideo: {},
      searchResults: []
    };
  },

  handleSubmit: function(e) {
    console.log('searchQuery', this.state.searchQuery);
    // set to a searching state
    // do index lookup here
    // searchResults = [results]
    e.preventDefault();
    e.stopPropagation();
    return false;
  },

  handleChangeQuery: function(event) {
    this.setState({
      searchQuery: event.target.value
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
            value={this.state.searchQuery} />
          <input type="submit" value="Submit" />
        </form>
        <Results searchResult={this.searchResults} />
      </div>
    );
  }
});

ReactDOM.render(
  <App />,
  mountNode
);
