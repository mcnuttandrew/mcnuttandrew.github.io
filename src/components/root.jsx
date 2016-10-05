import React from 'react';
import Constants from '../constants';

export default React.createClass({
  displayName : 'App',

  renderHeader: function renderHeader() {
    // todo add alts to everything
    return (
      <div className="app-header">
        <div className="name-wrapper">
          <div className='left-box'></div>
          {Constants.title}
        </div>
        <div className='right-links'>
          <a href="http:www.github.com/mcnuttandrew">Github</a>
          <a href="mailto:mcnutt.andrew@gmail.com">Contact</a>
          <a href='../../assets/resume.pdf'>CV</a>
        </div>
      </div>
    );
  },

  renderAboutBlock: function renderAboutBlock() {
    return (
      <div className="about-block section">
        <div className="section-label">
          <div className="main-heading"></div>
        </div>
        <div className="section-content">
          <div className="main-img-wrapper">
            <img className="main-img" src={Constants.profpic}></img>
          </div>
          <div className="info-panel">
            <div className="main-heading">{Constants.title}</div>
            <div className="sub-heading">{Constants.subtitle}</div>
            <div className="body-content">{Constants.about}</div>
          </div>
        </div>
      </div>
    );
  },

  renderPublication: function renderPublication(publication) {
    return (
      <a href={publication.link} className='body-content publication'>{publication.text}</a>
    );
  },

  renderProject: function renderProject(project) {
    return (
      <div className="project-panel">
        <div className="project-img-wrapper">
          <img className="project-img" src={project.imgLink}></img>
        </div>
        <div className="project-info">
          <a className="project-link" href={project.link}>{project.title}</a>
          <div className="body-content">{project.text}</div>
        </div>
      </div>
    );
  },

  renderResearchBlock: function renderResearchBlock() {
    const publications = Constants.publications.map(this.renderPublication);
    const projects = Constants.projects.map(this.renderProject);
    return (
      <div className="research-block section">
        <div className="section-label">
          <div className="main-heading">RESEARCH</div>
        </div>
        <div className="section-content">
          <div className="sub-heading">Publications</div>
          <div className='publications-wrapper'>{publications}</div>
          <div className="sub-heading">Past Projects</div>
          <div className='projects-wrapper'>{projects}</div>
        </div>
      </div>
    );
  },

  renderSkill: function renderSkill(skill) {
    return (
      <div className="skill-content">
        <div className="skill-title">{skill.title}</div>
        <div className="body-content">{skill.content}</div>
      </div>
    )
  },

  renderWorkBlock: function renderWorkBlock() {
    const projects = Constants.onlineWork.map(this.renderProject);
    const skills = Constants.skills.map(this.renderSkill);
    return (
      <div className="work-block section">
        <div className="section-label">
          <div className="main-heading">WORK</div>
        </div>
        <div className="section-content">
          <div className="sub-heading">Skills</div>
          <div className='skills-wrapper'>{skills}</div>
          <div className="sub-heading">Online Work</div>
          <div className='projects-wrapper'>{projects}</div>
        </div>
      </div>
    );
  },

  render: function render() {
    let wrapperClass = 'app';
    switch(this.props.location.hash) {
      case '#/work':
        wrapperClass += ' work';
        break;
      case '#/research':
        wrapperClass += ' research';
        break;
      case '#/about':
        wrapperClass += ' about';
        break;
      case '':
        wrapperClass += ' about';
        break;
      default:
        wrapperClass += ' about';
        break;
    }

    return (
      <div className={wrapperClass}>
        <div className="left-border">
          <div className="left-gradient"></div>
          <div className="left-pattern"></div>
        </div>
        <div className="main-content">
          {this.renderHeader()}
          {this.renderAboutBlock()}
          {this.renderResearchBlock()}
          {this.renderWorkBlock()}
        </div>
      </div>
    );
  }
});
