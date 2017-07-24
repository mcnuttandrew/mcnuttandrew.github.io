import React from 'react';

import {PUBLICATIONS} from '../constants';

class ResearchPage extends React.Component {
  render() {

    return (
      <div className="page research-page">
        <div className="publication-section-headline">PUBLICATIONS</div>
        {PUBLICATIONS.map(pub => {
          return (
            <div className="publication-block" key={pub.title}>
              <a
                href={pub.link}
                className="publication-title">{pub.title}</a>
              <div className="publication-authors">{pub.authors}</div>
              <div className="publication-journal">{pub.journal}</div>
            </div>
          );
        })}
        <div className="footer" />
      </div>
    );
  }
}
ResearchPage.displayName = 'App';
export default ResearchPage;
