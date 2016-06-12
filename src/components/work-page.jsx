import React from 'react';
import ProjectDescription from './project-description.jsx';
import Constants from '../constants';

export default React.createClass({
  displayName : 'WorkPage',
  getInialState: function getInialState() {
    return {
      publicationShowing: true
    }
  },

  renderDescription: function renderDescription(project) {
    var props = {
      title: project.title,
      text: project.text
    }
    if (project.liveLink) {
      props.liveLink = project.liveLink
    }
    if (project.sourceLink) {
      props.sourceLink = project.sourceLink
    }
    return (<ProjectDescription {...props}/>)
  },

  render: function render() {
    var content = Constants.onlineWork.map(this.renderDescription);
    return (
      <div className="container work-page">
        <div className="page-title">
          <div>WORK</div>
        </div>
        <div className='page-content'>
          <div className='section-title'>ONLINE WORK</div>
          {content}
        </div>
        <div className='skillz-wrapper'>
          <div className='section-title'>SKILLS</div>
          <div className='section'>
            PERSONAL: information design, physics, <a href='http://mcnuttart.tumblr.com/'>arts</a>
            <br/>
            WEB DEV: d3, react, flux/redux, node, backbone, processing, jquery, ruby, ruby on rails, python, flask, sketch
            SCI-COM: mathematica, grid mathematica, numpy, pandas
          </div>
        </div>
      </div>
    );
  }
});
