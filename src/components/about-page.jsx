import React from 'react';
import {Link} from 'react-router';
import Constants from '../constants';

const FirstPageContent = React.createClass({
  displayName: 'FirstPageContent',
  render: function render() {
    return (
      <div className="app about-page">
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
            <div><a className="link" href='../../assets/resume.pdf'>CV</a></div>
            <div><a href='mailto:mcnutt.andrew@gmail.com'>CONTACT</a></div>
          </div>
        </div>
      </div>
    );
  }
});

export default FirstPageContent;
