import React from 'react';

import {PROJECTS} from '../constants';
import GithubIcon from './github-icon';

const Projects = () => (
  <div className="page projects-page">
    {PROJECTS.map((project, index) => {
      const {
        text,
        dates,
        link,
        title,
        imgLink,
        sourceLink
      } = project;
      return (
        <div className="project-block" key={index}>
          <a className="pic-wrapper" href={link || sourceLink}>
            <img className="project-image" src={imgLink}/>
          </a>
          <a className="project-title" href={link || sourceLink}>{title}</a>
          {dates && <div className="project-dates">{dates}</div>}
          <div className="project-links">
            {sourceLink && <a href={sourceLink}>
              <GithubIcon />
            </a>}

            {link && <a href={link}> LIVE </a>}
          </div>
          <div className="text-block">{text}</div>
        </div>
      );
    })}
    <div className="footer" />
  </div>
);

export default Projects;
