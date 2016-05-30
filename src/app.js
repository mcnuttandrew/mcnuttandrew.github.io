import React from 'react';
import ReactDOM from 'react-dom';
import {browserHistory, Router, Route} from 'react-router';

import Root from './components/root.jsx';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={Root}></Route>
  </Router>
),  document.getElementById('app'))
