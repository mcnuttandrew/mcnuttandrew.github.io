import React from 'react';
import AboutPage from './about-page.jsx';
import ResearchPage from './research-page.jsx';
import WorkPage from './work-page.jsx';
import SideNavLinks from './side-nav-links.jsx';

export default React.createClass({
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
