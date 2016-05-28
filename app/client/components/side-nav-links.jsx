var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var SideNavLinks = React.createClass({
  displayName : 'SideNavLinks',
  render() {
    return (
      <div className='side-nav-links'>
        <span className='side-nav-link'>
          <Link className='link' to='#/aout'>ABOUT</Link>
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


module.exports = SideNavLinks;
