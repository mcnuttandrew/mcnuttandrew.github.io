import React from 'react';
import ReactDOM from 'react-dom';

import './stylesheets/main.scss';
import Root from './components/root.js';
import {BrowserRouter as Router} from 'react-router-dom';

ReactDOM.render((
  <Router>
    <Root />
  </Router>
), document.getElementById('app'));
