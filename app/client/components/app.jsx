var React = require('react');
var FirstPageContent = require('./first-page-content.jsx');

var FirstPageContent = require('./first-page-content.jsx');
var ResearchPage = require('./research-page.jsx');
var WorkPage = require('./work-page.jsx');
var SideNavLinks = require('./side-nav-links.jsx');

module.exports = React.createClass({
  displayName : 'App',
  render() {
    // janky fake router
    var content;
    switch(this.props.location.hash) {
      case '#/work':
        content = (<WorkPage />);
        break;
      case '#/research':
        content = (<ResearchPage />);
        break;
      case '#/about':
        content = (<FirstPageContent />);
        break;
      case '':
        content = (<FirstPageContent />);
        break;
      default:
        content = (<FirstPageContent />);
        break;
    }
    return (
      <div className="app">
        <SideNavLinks location={this.props.location.hash} />
        {content}
      </div>);
  }
});
