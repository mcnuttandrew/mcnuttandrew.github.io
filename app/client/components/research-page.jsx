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
    var showPubs = false;
    var pubClassName = showPubs ? 'selected' : '';
    var projClassName = showPubs ? '' : 'selected';
    var content = Data[showPubs ? 'publications' : 'projects'].map(this.renderDescription);
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
          <span classNames={pubClassName}> PUBLICATIONS </span>
          <span> / </span>
          <span classNames={projClassName}> PROJECTS </span>
        </div>
        <div className='page-content'>
          {content}
        </div>
      </div>
    );
  }
});


module.exports = WorkPage;
