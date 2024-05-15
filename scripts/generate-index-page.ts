import { writeFile, readFile } from "fs/promises";
import markdownit from "markdown-it";
import { NEWS, PUBLICATIONS } from "../src/constants";

// const {writeFile, readFile} = require('fs/promises');
// const constants = require('../src/constants');
// const publications = require('../src/data/publications');

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
});

async function main() {
  const about = await readFile("./src/text-chunks/about.md", "utf-8");
  const content = `
# Andrew McNutt
## Post Doc in HCI / Visualization
${about}

## News
${NEWS.map(({ date, content }) => `* **${date}**: ${content}`)
  .slice(0, 5)
  .join("\n")}

## Publications
${PUBLICATIONS.map(
  ({ link, title, authors, journal }) =>
    `* [${title}](${link}): ${authors}, ${journal}`
).join("\n")}
  `;

  const noScriptContents = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="stylesheet" href="./noscript.css" />
    <title>Andrew McNutt</title>
  </head>

  <body>
    <noscript>
    <div id="no-script">
    <div id="no-script-content">
    ${md.render(content)}
    </div>
    </div></noscript>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>

  `;

  writeFile("./index.html", noScriptContents);
}
main();
