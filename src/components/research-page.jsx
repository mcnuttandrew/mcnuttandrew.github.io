import React from 'react';
import ProjectDescription from './project-description.jsx';
import Constants from '../constants';

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
      </div>
    );
  }
});
