import React from 'react';
import {OutboundLink} from 'react-ga';
import {Link} from 'react-router';

export default React.createClass({
  displayName : 'ProjectDescription',

  render: function render() {
    var liveLink = '';
    var sourceLink = '';
    var title = this.props.title;
    if (this.props.liveLink) {
      liveLink = (
        <OutboundLink
          eventLabel={`Click live link for ${this.props.title}`}
          to={this.props.liveLink}>
          live
        </OutboundLink>
      );
    }
    if (this.props.sourceLink) {
        sourceLink = (
          <OutboundLink
            eventLabel={`Click source link for ${this.props.title}`}
            to={this.props.sourceLink}>
            source
          </OutboundLink>
      );
    }
    if (this.props.link) {
      title = (
        <OutboundLink
          eventLabel={`Click live link for ${this.props.title}`}
          to={this.props.link}
          className='title'>
          {this.props.title}
        </OutboundLink>);
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
