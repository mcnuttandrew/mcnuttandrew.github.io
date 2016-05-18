var React = require('react');
var FirstPageContent = require('./first-page-content.jsx');

module.exports = React.createClass({
  displayName : 'App',
  render() {
    return (<div className="app">{this.props.children}</div>);
  }
});
