var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;

var Root = require('./components/root.jsx');

ReactDOM.render((
  <Router history={ReactRouter.browserHistory}>
    <Route path="/" component={Root}></Route>
  </Router>
),  document.getElementById('app'))
