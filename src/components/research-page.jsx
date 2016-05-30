import React from 'react';
import ThingDescription from './thing-description.jsx';
import Constants from '../constants';

export default React.createClass({
  displayName : 'ResearchPage',

  getInitialState: function getInitialState() {
    return {publicationShowing: true};
  },

  renderDescription: function renderDescription(thing) {
    var props = {
      title: thing.title,
      text: thing.text,
      link: thing.link
    };
    return (<ThingDescription {...props} />);
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
          <div className='section'>FIELDS: MACHINE LEARNING, MECHACNICS, DATA VISUALIZATION</div>
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
