import React from 'react';
import {Link} from 'react-router';

export default React.createClass({
  displayName : 'SideNavLinks',
  render() {
    return (
      <div className='side-nav-links'>
        <span className='side-nav-link'>
          <Link className='link' to='#/about'>ABOUT</Link>
        </span>
        <span className='side-nav-link'>
          <Link className='link' to='#/research'>RESEARCH</Link>
        </span>
        <span className='side-nav-link'>
          <Link className='link' to='#/work'>WORK</Link>
        </span>
      </div>
    );
  }
});
