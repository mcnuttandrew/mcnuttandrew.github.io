var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;

var App = require('./components/app.jsx');
var FirstPageContent = require('./components/first-page-content.jsx');
var ResearchPage = require('./components/research-page.jsx');
var WorkPage = require('./components/work-page.jsx');

ReactDOM.render((
  <Router history={ReactRouter.browserHistory}>
    <Route path="/" component={App}>
    </Route>
  </Router>
),  document.getElementById('app'))
// <IndexRoute component={FirstPageContent}> </IndexRoute>
// <Route path="/about" component={FirstPageContent}> </Route>
// <Route path="/research" component={ResearchPage}> </Route>
// <Route path="/work" component={WorkPage}> </Route>
