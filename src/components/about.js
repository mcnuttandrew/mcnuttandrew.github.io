import React from 'react';
import {RadarChart} from 'react-vis';

import {ABOUT, HISTORY, INTERESTS} from '../constants';

class AboutPage extends React.Component {
  render() {
    const radarProperties = {
      startingAngle: 0,
      height: 320,
      width: 300,
      margin: {
        top: 30,
        bottom: 20,
        left: 30,
        right: 30
      },
      tickFormat: () => ''
    };
    return (
      <div className="page about-page">
        <div className="text-block">{ABOUT}</div>
        {

          // <div className="pic-wrapper">
          // <div className="profpic" />
          // </div>
        }
        <div className="text-block">{HISTORY}</div>
        <div className="radar-wrapper">
          <div className="radar-container">

            <RadarChart
              {...radarProperties}
              style={{polygons: {
                fill: '#20476E',
                stroke: '#20476E',
                fillOpacity: 0.4
              }}}
              domains={
                ['js', 'c', 'ruby', 'java', 'python', 'haskell']
                  .map(name => ({name, domain: [0, 10]}))
              }
              data={[{js: 9, ruby: 4, python: 6, c: 4, java: 2, haskell: 4}]}
              />
            <h3>LANGUGAGES</h3>
          </div>
          <div className="radar-container" >
            <RadarChart
              {...radarProperties}
              startingAngle={2 * Math.PI / 4}
              style={{polygons: {
                fill: '#417783',
                stroke: '#417783',
                fillOpacity: 0.4
              }}}
              domains={['infovis', 'art & design', 'web dev']
                  .map(name => ({name, domain: [0, 10].slice()}))}
              data={[{
                infovis: 9,
                'art & design': 3,
                'web dev': 9
              }]}
              />
            <h3>GENERAL SKILLS</h3>
          </div>
        </div>
        <div className="text-block">{INTERESTS}</div>
        <div className="footer" />
      </div>
    );
  }
}
AboutPage.displayName = 'App';
export default AboutPage;
