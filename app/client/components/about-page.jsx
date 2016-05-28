var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

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
          <div className="boring-content">I am an applied mathematician currently working in the wild world of San Francisco based web development. I am a full stack developer, but I am more or less front-end/data-visualization leaning. My educational background is in physics, specifically in mechaincs, and traditional rails oriented web development. I feel greatly for the plight of the American desert.</div>
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
