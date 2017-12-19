import React from 'react';
import ReactGA from 'react-ga';

import HamburgerMenu from './hamburger-menu';
import LinkMenu from './link-menu';

import AboutPage from './about';
import ProjectsPage from './projects';
import ResearchPage from './research';

export const LINKS = [
  {title: 'github', href: 'https://github.com/mcnuttandrew/'},
  // {title: 'twitter', href: 'https://twitter.com/_mcnutt_'},
  {title: 'linkedin', href: 'https://www.linkedin.com/in/mcnuttandrew/'},
  {title: 'CV', href: '../assets/resume.pdf'}
];

// need to be fancy, in order to deal with routing
function getRoute(location) {
  if (location === 'research') {
    return <ResearchPage />;
  }
  if (location === 'projects') {
    return <ProjectsPage />;
  }
  return <AboutPage />;
}

class RootApp extends React.Component {
  componentDidMount() {
    ReactGA.event({
      category: 'User',
      action: 'Page was loaded'
    });
  }

  render() {
    const locationSplit = location.href.split('/');
    return (
      <div className={`${locationSplit[locationSplit.length - 1]} root-wrapper`}>
        <HamburgerMenu />
        <div className="top-links">
          <div className="top-link-title">ANDREW MCNUTT</div>
          <LinkMenu />
        </div>
        <div className="left-panel">
          <div className="title">ANDREW MCNUTT</div>
          <div className="subtitle">VISUALIZATION</div>
          <div className="social-links">
            {LINKS.map(link => (
              <a className="social-link" key={link.title} href={link.href}>
                {link.title}
              </a>
            ))}
          </div>
        </div>
        <div className="right-panel">
          <LinkMenu />
          {getRoute(locationSplit[locationSplit.length - 1])}
        </div>
      </div>
    );
  }
}
RootApp.displayName = 'App';
export default RootApp;
