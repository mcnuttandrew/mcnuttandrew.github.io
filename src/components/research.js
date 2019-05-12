import React from 'react';

import {PUBLICATIONS, BLOG_POSTS} from '../constants';

class Publication extends React.Component {
  constructor() {
    super();
    this.state = {
      showAbstract: false
    };
  }

  render() {
    const {
      imgLink,
      title,
      link,
      links,
      authors,
      journal,
      date,
      subtitle,
      abstract
    } = this.props;
    const {showAbstract} = this.state;
    return (
      <div className="publication-block" key={title}>
        <div className="publication-content-container">
          <div className="research-img-wrapper">
            <a href={link}>
              <img className="research-image" src={imgLink}/>
            </a>
          </div>
          <div className="publication-content">
            {link ?
              <a href={link} className="publication-title">{title}</a> :
              <div className="publication-title">{title}</div>
            }
            {authors && <div className="publication-authors">{authors}</div>}
            {journal && <div className="publication-journal">{journal}</div>}
            {subtitle && <div className="publication-blogs">{subtitle}</div>}
            {date && <div className="publication-date">{date}</div>}
            {links && <div className="publication-links">
              {links.map(d => <a href={d.link} key={d.link}>{d.name}</a>)}
              {abstract && <a
                onClick={() => this.setState({showAbstract: !showAbstract})}
                className="abstract-link">{`abstract (${showAbstract ? '-' : '+'})`}</a>}
            </div>}
          </div>
        </div>
        {abstract && showAbstract && <div className="publication-abstract">{abstract}</div>}
      </div>
    );
  }
}

class ResearchPage extends React.PureComponent {
  render() {

    return (
      <div className="page research-page">
        <div className="publication-section-headline">PUBLICATIONS</div>
        {PUBLICATIONS.map((d, idx) => <Publication {...d} key={idx} />)}
        <div className="publication-section-headline">BLOG POSTS</div>
        {BLOG_POSTS.map((d, idx) => <Publication {...d} key={`${idx}-blogpost`} />)}
        <div className="footer" />
      </div>
    );
  }
}
ResearchPage.displayName = 'ResearchPage';
export default ResearchPage;
