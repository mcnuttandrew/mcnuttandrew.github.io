var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var ThingDescription = React.createClass({
  displayName : 'ThingDescription',
  render: function render() {
    var liveLink = '';
    var sourceLink = '';
    if (this.props.liveLink) {
      liveLink = (<a href={this.props.liveLink}>live</a>);
    }
    if (this.props.sourceLink) {
      sourceLink = (<a href={this.props.sourceLink}>source</a>);
    }
    return (
      <div className='thing'>
        <div className='thing-header'>
          {this.props.title}
          {liveLink}
          {sourceLink}
        </div>
        <div className='thing-body'>
          {this.props.text}
        </div>
      </div>
    );
  }
});


module.exports = ThingDescription;
