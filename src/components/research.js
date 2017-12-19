import React from 'react';

import {PUBLICATIONS, PRESENTATIONS} from '../constants';

function makePubBloc(pub) {
  const {title, link, authors, journal, date} = pub;
  return (
    <div className="publication-block" key={title}>
      {link ?
        <a href={link} className="publication-title">{title}</a> :
        <div className="publication-title">{title}</div>
      }
      {authors && <div className="publication-authors">{authors}</div>}
      {journal && <div className="publication-journal">{journal}</div>}
      {date && <div className="publication-date">{date}</div>}
    </div>
  );
}

class ResearchPage extends React.Component {
  render() {

    return (
      <div className="page research-page">
        <div className="publication-section-headline">PUBLICATIONS</div>
        {PUBLICATIONS.map(makePubBloc)}
        <div className="publication-section-headline">PRESENTATIONS</div>
        {PRESENTATIONS.map(makePubBloc)}
        <div className="footer" />
      </div>
    );
  }
}
ResearchPage.displayName = 'ResearchPage';
export default ResearchPage;
