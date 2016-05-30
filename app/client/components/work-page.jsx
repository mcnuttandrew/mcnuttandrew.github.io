var React = require('react');
var ThingDescription = require('./thing-description.jsx');
var Data = require('./data');

var WorkPage = React.createClass({
  displayName : 'WorkPage',
  getInialState: function getInialState() {
    return {
      publicationShowing: true
    }
  },

  renderDescription: function renderDescription(thing) {
    return (<ThingDescription title={thing.title} text={thing.text} />)
  },

  render: function render() {
    var content = Data.onlineWork.map(this.renderDescription);
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
          <div className='section'>PERSONAL: information design, mechanics</div>
          <div className='section'>WEB DEV: d3, react, flux/redux, node, backbone, processing, jquery, ruby, ruby on rails, python, flask, sketch </div>
          <div className='section'>SCI-COM: mathematica, grid mathematica, numpy, pandas</div>
        </div>
      </div>
    );
  }
});


module.exports = WorkPage;
