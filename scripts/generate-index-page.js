const {writeFile} = require('fs/promises');
const constants = require('../src/constants');

const content = [
  '<h1>Andrew McNutt</h1>',
  '<h3>PhD Student in Visualization</h3>',
  `<p>${constants.ABOUT}</p>`,
  '<h3>News</h3>',
  '<ul>',
  constants.NEWS.map(({date, content}) => `<li>${date}: ${content}</li>`).join('\n'),
  '</ul>',
  '<h3>Publications</h3>',
  '<ul>',
  constants.PUBLICATIONS.map(
    ({link, title, authors, journal}) => `<li><a href=${link}>${title}</a>: ${authors}, ${journal}</li>`
  ).join('\n'),
  '</ul>',
  '<p>For more information please see the javascript enabled version of this site.</p>'
].join('\n');

const noScriptContents = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />

    <title>Andrew McNutt</title>

    <link rel="stylesheet" href="/global.css" />
    <link rel="stylesheet" href="/build/bundle.css" />

    <script defer src="/build/bundle.js"></script>
  </head>

  <body>
    <noscript>${content}</noscript>
  </body>
</html>
`;

writeFile('./index.html', noScriptContents);
