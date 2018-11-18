import React from 'react';

import {PROJECTS} from '../constants';

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
          <a className="project-title" href={link}>{title}</a>
          {dates && <div className="project-dates">{dates}</div>}
          <div className="project-links">
            {sourceLink && <a href={sourceLink}> SOURCE </a>}
            {link && sourceLink && <span>/</span>}
            {link && <a href={link}> LIVE </a>}
          </div>
          <div className="text-block">{text}</div>
          <a className="pic-wrapper" href={link}>
            <img className="project-image" src={imgLink}/>
          </a>
        </div>
      );
    })}
    <div className="footer" />
  </div>
);

export default Projects;
