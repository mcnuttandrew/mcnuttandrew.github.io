import React from 'react';
import ReactGA, {OutboundLink} from 'react-ga';
import {Link} from 'react-router';

import Constants from '../constants';
import ProjectDescription from './project-description.jsx';

export default React.createClass({
  displayName : 'ResearchPage',

  getInitialState: function getInitialState() {
    return {publicationShowing: true};
  },

  renderDescription: function renderDescription(project) {
    var props = {
      title: project.title,
      text: project.text,
      link: project.link
    };
    return (<ProjectDescription {...props} />);
  },

  toggleMenu: function toggleMenu(option) {
    this.setState({publicationShowing: option})
  },

  getTrack: function getTrack(tabName) {
    return function logPageView() {
      ReactGA.event({
        category: 'User',
        action: `Accessed the ${tabName} tab`
      });
    }
  },

  render: function render() {
    var showPubs = this.state.publicationShowing;
    var pubClassName = showPubs ? 'selected' : '';
    var projClassName = showPubs ? '' : 'selected';
    var content = Constants[showPubs ? 'publications' : 'projects'].map(this.renderDescription);
    return (
      <div className="container research-page">
        <div className="page-title">
          <div className='special-justify'>RESEA</div>
          <div>RCH</div>
        </div>
        <div className='interests-wrapper'>
          <div className='section-title'>INTERESTS</div>
          <div className='section'>FIELDS: MACHINE LEARNING, MECHANICS, DATA VISUALIZATION</div>
          <div className='section'>PHENOMENA: VEHICLE TRAFFIC, GRAVITY, VIRTUAL & AUGMENTED REALITY</div>
        </div>
        <div className='subsection-selector'>
          <span
            className={pubClassName}
            onClick={this.toggleMenu.bind(null, true)}>PUBLICATIONS </span>
          <span> / </span>
          <span
            className={projClassName}
            onClick={this.toggleMenu.bind(null, false)}> PROJECTS </span>
        </div>
        <div className='page-content'>
          {content}
        </div>
        <div className="links">
          <span><Link className="link" to='#/about' onClick={this.getTrack('About')}>ABOUT</Link></span>
          <span><Link className="link" to='#/work' onClick={this.getTrack('Work')}>WORK</Link></span>
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
    );
  }
});
