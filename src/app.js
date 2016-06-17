import React from 'react';
import ReactDOM from 'react-dom';
import ReactGa from 'react-ga';
import {browserHistory, Router, Route} from 'react-router';

import Root from './components/root.jsx';

ReactGa.initialize('UA-79506537-1');

function logPageView() {
  ReactGa.pageview(window.location.pathname);
}

ReactDOM.render((
  <Router history={browserHistory} onUpdate={logPageView}>
    <Route path="/" component={Root}></Route>
  </Router>
),  document.getElementById('app'))
