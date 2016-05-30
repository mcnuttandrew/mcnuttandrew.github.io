var React = require('react');
var AboutPage = require('./about-page.jsx');
var ResearchPage = require('./research-page.jsx');
var WorkPage = require('./work-page.jsx');
var SideNavLinks = require('./side-nav-links.jsx');

module.exports = React.createClass({
  displayName : 'App',
  render() {
    // janky fake router
    var content;
    var links;
    switch(this.props.location.hash) {
      case '#/work':
        links = (<SideNavLinks location={this.props.location.hash} />);
        content = (<WorkPage />);
        break;
      case '#/research':
        links = (<SideNavLinks location={this.props.location.hash} />);
        content = (<ResearchPage />);
        break;
      case '#/about':
        links = (<SideNavLinks location={this.props.location.hash} />);
        content = (<AboutPage />);
        break;
      case '':
        content = (<AboutPage />);
        break;
      default:
        content = (<AboutPage />);
        break;
    }
    return (
      <div className="app">
        {links}
        {content}
      </div>);
  }
});
