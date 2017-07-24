import React from 'react';
import {RadarChart, LabelSeries} from 'react-vis';

import {ABOUT, TECHNOLOGIES, INTERESTS} from '../constants';

class AboutPage extends React.Component {
  render() {
    const radarProperties = {
      startingAngle: 0,
      height: 300,
      width: 300,
      margin: {
        bottom: 60,
        left: 60,
        top: 60,
        right: 60
      },
      tickFormat: () => ''
    };
    return (
      <div className="page about-page">
        <div className="text-block">{ABOUT}</div>
        <div className="pic-wrapper">
          <div className="profpic" />
        </div>
        <div className="text-block">{TECHNOLOGIES}</div>
        <div className="radar-wrapper">
          <RadarChart
            {...radarProperties}
            style={{polygons: {
              fill: '#20476E',
              stroke: '#20476E',
              fillOpacity: 0.4
            }}}
            domains={[
              {name: 'javascript', domain: [0, 10]},
              {name: 'c', domain: [0, 10]},
              {name: 'ruby', domain: [0, 10]},
              {name: 'python', domain: [0, 10]},
              {name: 'java', domain: [0, 10]}
            ]}
            data={[{
              javascript: 9,
              ruby: 4,
              python: 6,
              c: 1,
              java: 2
            }]}
            >
            <LabelSeries
              className="chart-label"
              data={[
                {x: 0.35, y: 1, label: 'LANGUAGES'},
                {x: 0.35, y: 0.8, label: 'I KNOW'}
              ]} />
          </RadarChart>
          <RadarChart
            {...radarProperties}
            startingAngle={Math.PI}
            style={{polygons: {
              fill: '#417783',
              stroke: '#417783',
              fillOpacity: 0.4
            }}}
            domains={[
              {name: 'infovis', domain: [0, 10]},
              {name: 'art & design', domain: [0, 10]},
              {name: 'web dev', domain: [0, 10]}
            ]}
            data={[{
              infovis: 9,
              'art & design': 3,
              'web dev': 9
            }]}
            >
            <LabelSeries
              className="chart-label"
              data={[
                {x: -1.3, y: -0.7, label: 'GENERAL'},
                {x: -1.3, y: -0.9, label: 'proficiencies'}
              ]} />
          </RadarChart>
        </div>
        <div className="text-block">{INTERESTS}</div>
        <div className="footer" />
      </div>
    );
  }
}
AboutPage.displayName = 'App';
export default AboutPage;
