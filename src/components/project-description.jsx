import React from 'react';
import ReactGa from 'react-ga';
import {Link} from 'react-router';

export default React.createClass({
  displayName : 'ProjectDescription',

  track: function track(linkType) {
    ReactGa.event({
      category: 'User',
      action: `User clicked ${linkType} link for ${this.props.title}`
    });
  },

  render: function render() {
    var liveLink = '';
    var sourceLink = '';
    var title = this.props.title;
    if (this.props.liveLink) {
      liveLink = (
        <a href={this.props.liveLink} onClick={this.track.bind(null, 'live')}>live</a>
      );
    }
    if (this.props.sourceLink) {
        sourceLink = (<a href={this.props.sourceLink} onClick={this.track.bind(null, 'source')}>source</a>
      );
    }
    if (this.props.link) {
      title = (
        <a href={this.props.link} className='title' onClick={this.track.bind(null, 'main')}>{this.props.title}</a>);
    }
    return (
      <div className='project'>
        <div className='project-header'>
          {title}
          {liveLink}
          {sourceLink}
        </div>
        <div className='project-body'>
          {this.props.text}
        </div>
      </div>
    );
  }
});
