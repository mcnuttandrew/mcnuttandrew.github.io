import React from 'react';
import ReactGA from 'react-ga';
import {Link} from 'react-router';

export default React.createClass({
  displayName : 'SideNavLinks',

  getTrack: function getTrack(tabName) {
    return function logPageView() {
      ReactGA.event({
        category: 'User',
        action: `Accessed the ${tabName} tab`
      });
    }
  },

  render() {
    let selected = 'about';
    switch(this.props.location) {
      case '#/work':
        selected = 'work';
        break;
      case '#/research':
        selected = 'research';
        break;
    }

    const aboutLinkClass = `side-nav-li ${selected === 'about' ? 'selected-li' : ''}`;
    const researchLinkClass = `side-nav-li ${selected === 'research' ? 'selected-li' : ''}`;
    const workLinkClass = `side-nav-li ${selected === 'work' ? 'selected-li' : ''}`;
    return (
      <div className='side-nav-links'>
        <span className={aboutLinkClass}>
          <Link className='link' to='#/about' onClick={this.getTrack('About')}>ABOUT</Link>
        </span>
        <span className={researchLinkClass}>
          <Link className='link' to='#/research' onClick={this.getTrack('Research')}>RESEARCH</Link>
        </span>
        <span className={workLinkClass}>
          <Link className='link' to='#/work' onClick={this.getTrack('Work')}>WORK</Link>
        </span>
      </div>
    );
  }
});
