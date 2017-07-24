import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';

import './stylesheets/main.scss';
import Root from './components/root.js';
import {BrowserRouter as Router} from 'react-router-dom';

ReactGA.initialize('UA-79506537-1');

ReactDOM.render((
  <Router>
    <Root />
  </Router>
), document.getElementById('app'));
