import React from 'react';

import {PROJECTS} from '../constants';

class ProjectsPage extends React.Component {
  render() {

    return (
      <div className="page projects-page">
        {PROJECTS.map((project, index) => {
          const {text, link, title, imgLink, sourceLink} = project;
          return (
            <div className="project-block" key={index}>
              <a className="project-title" href={link}>{title}</a>
              <div className="text-block">{text}</div>
              <a className="pic-wrapper" href={link}>
                <img className="project-image" src={imgLink}/>
              </a>
              <div className="project-links">
                {sourceLink && <a href={sourceLink}> SOURCE </a>}
                {link && sourceLink && <span>/</span>}
                {link && <a href={link}> LIVE </a>}
              </div>
            </div>
          );
        })}
        <div className="footer" />
      </div>
    );
  }
}
ProjectsPage.displayName = 'App';
export default ProjectsPage;
