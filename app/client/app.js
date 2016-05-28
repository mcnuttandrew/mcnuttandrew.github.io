var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;

var App = require('./components/app.jsx');

ReactDOM.render((
  <Router history={ReactRouter.browserHistory}>
    <Route path="/" component={App}></Route>
  </Router>
),  document.getElementById('app'))
