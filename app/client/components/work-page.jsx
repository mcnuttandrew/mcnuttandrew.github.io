var React = require('react');

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
          <div className="name">WORK</div>
          <div className="boring-content">I am an applied mathematician currently working in the wild world of San Francisco based web development. I am a full stack developer, but I am more or less front-end/data-visualization leaning. My educational background is in physics, specifically in mechaincs, and traditional rails oriented web development. I feel greatly for the plight of the American desert.</div>
          <div className="links">
            <div><a className="link" href='/work'>WORK</a></div>
            <div><a className="link" href='/research'>RESEARCH</a></div>
            <div><a className="link" href='/work'>CV</a></div>
            <div><a className="link" href='/work'>CONTACT</a></div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = FirstPageContent;
