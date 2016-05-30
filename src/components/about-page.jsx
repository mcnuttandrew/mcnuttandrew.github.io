var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var Constants = require('../constants');

var FirstPageContent = React.createClass({
  displayName : 'FirstPageContent',
  render() {
    return (
      <div className="app">
        <div className="container">
          <div className="tagline">
            <div>SF BASED DATA</div>
            <div>VISUALIZATION</div>
            <div className="special-line">PERSON & APPLIED</div>
            <div>MATHER</div>
          </div>
          <div className="name"> ANDREW MCNUTT</div>
          <div className="boring-content">{Constants.about}</div>
          <div className="links">
            <div><Link className="link" to='#/work'>WORK</Link></div>
            <div><Link className="link" to='#/research'>RESEARCH</Link></div>
            <div><Link className="link" to='/'>CV</Link></div>
            <div><Link className="link" to='/'>CONTACT</Link></div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = FirstPageContent;
