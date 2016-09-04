import React from 'react';
import ReactGA, {OutboundLink} from 'react-ga';
import {Link} from 'react-router';
import Constants from '../constants';

const AboutPage = React.createClass({
  displayName: 'AboutPage',

  getTrack: function getTrack(tabName) {
    return function logPageView() {
      ReactGA.event({
        category: 'User',
        action: `Accessed the ${tabName} tab`
      });
    }
  },

  render: function render() {
    return (
      <div className="app about-page">
        <div className="container">
          <div className="tagline">
            <div>SF BASED DATA</div>
            <div>VISUALIZATION</div>
            <div className="special-line">EXPERT & APPLIED</div>
            <div>MATHER</div>
          </div>
          <div className="name"> ANDREW MCNUTT</div>
          <div className="boring-content">{Constants.about}</div>
          <div className="links">
            <span><Link className="link" to='#/work' onClick={this.getTrack('Work')}>WORK</Link></span>
            <span><Link className="link" to='#/research' onClick={this.getTrack('Research')}>RESEARCH</Link></span>
            <span>
              <OutboundLink
                className="link"
                to='../../assets/resume.pdf'
                eventLabel={"Click resume link"}>
                CV
              </OutboundLink></span>
            <span><a href='mailto:mcnutt.andrew@gmail.com'>CONTACT</a></span>
          </div>
        </div>
      </div>
    );
  }
});

export default AboutPage;
