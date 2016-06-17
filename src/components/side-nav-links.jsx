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
    return (
      <div className='side-nav-links'>
        <span className='side-nav-link'>
          <Link className='link' to='#/about' onClick={this.getTrack('About')}>ABOUT</Link>
        </span>
        <span className='side-nav-link'>
          <Link className='link' to='#/research' onClick={this.getTrack('Research')}>RESEARCH</Link>
        </span>
        <span className='side-nav-link'>
          <Link className='link' to='#/work' onClick={this.getTrack('Work')}>WORK</Link>
        </span>
      </div>
    );
  }
});
