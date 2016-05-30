import React from 'react';
import {Link} from 'react-router';

export default React.createClass({
  displayName : 'ThingDescription',
  render: function render() {
    var liveLink = '';
    var sourceLink = '';
    var title = this.props.title;
    if (this.props.liveLink) {
      liveLink = (<a href={this.props.liveLink}>live</a>);
    }
    if (this.props.sourceLink) {
      sourceLink = (<a href={this.props.sourceLink}>source</a>);
    }
    if (this.props.link) {
      title = (<a href={this.props.link} className='title'>{this.props.title}</a>);
    }
    return (
      <div className='thing'>
        <div className='thing-header'>
          {title}
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
