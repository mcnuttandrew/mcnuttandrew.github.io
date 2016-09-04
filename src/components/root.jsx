import React from 'react';
import AboutPage from './about-page.jsx';
import ResearchPage from './research-page.jsx';
import WorkPage from './work-page.jsx';
import SideNavLinks from './side-nav-links.jsx';

export default React.createClass({
  displayName : 'App',
  render() {
    let wrapperClass = 'app';
    switch(this.props.location.hash) {
      case '#/work':
        wrapperClass += ' work';
        break;
      case '#/research':
        wrapperClass += ' research';
        break;
      case '#/about':
        wrapperClass += ' about';
        break;
      case '':
        wrapperClass += ' about';
        break;
      default:
        wrapperClass += ' about';
        break;
    }

    return (
      <div className={wrapperClass}>
        <SideNavLinks location={this.props.location.hash} />
        <WorkPage />
        <AboutPage />
        <ResearchPage />
      </div>);
  }
});
