var React = require('react');
var ThingDescription = require('./thing-description.jsx');
var Constants = require('../constants');

var WorkPage = React.createClass({
  displayName : 'WorkPage',
  getInialState: function getInialState() {
    return {
      publicationShowing: true
    }
  },

  renderDescription: function renderDescription(thing) {
    var props = {
      title: thing.title,
      text: thing.text
    }
    if (thing.liveLink) {
      props.liveLink = thing.liveLink
    }
    if (thing.sourceLink) {
      props.sourceLink = thing.sourceLink
    }
    return (<ThingDescription {...props}/>)
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


module.exports = WorkPage;
