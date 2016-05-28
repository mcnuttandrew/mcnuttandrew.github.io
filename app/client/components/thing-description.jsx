var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var ThingDescription = React.createClass({
  displayName : 'ThingDescription',
  render() {
    return (
      <div className='thing'>
        <div className='thing-header'>
          {this.props.title}
        </div>
        <div className='thing-body'>
          {this.props.text}
        </div>
      </div>
    );
  }
});


module.exports = ThingDescription;
