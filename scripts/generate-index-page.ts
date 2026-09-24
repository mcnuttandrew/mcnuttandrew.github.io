import { writeFile, readFile } from "fs/promises";
import markdownit from "markdown-it";
import { NEWS, PUBLICATIONS } from "../src/constants";

// const {writeFile, readFile} = require('fs/promises');
// const constants = require('../src/constants');
// const publications = require('../src/data/publications');

const SITE_URL = "https://www.mcnutt.in";
const DESCRIPTION =
  "Andrew McNutt is an assistant professor of Computer Science at the University of Utah, where he leads the HAVOC Lab and works on HCI, visualization, and programming interfaces.";

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
});

async function main() {
  const about = await readFile("./src/text-chunks/about.md", "utf-8");
  const content = `
# Andrew McNutt
### Professor of HCI / Visualization
${about}

## News
${NEWS.map(({ date, content }) => `* **${date}**: ${content}`)
  .slice(0, 5)
  .join("\n")}

## Publications
${PUBLICATIONS.map(
  ({ link, title, authors, journal }) =>
    `* [${title}](${link}): ${authors}, ${journal}`,
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
    <meta name="description" content="${DESCRIPTION}" />
    <link rel="canonical" href="${SITE_URL}/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Andrew McNutt" />
    <meta property="og:title" content="Andrew McNutt" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:image" content="${SITE_URL}/assets/social-card.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Logo for the HAVOC (Human And Visualization Oriented Computing) Lab" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Andrew McNutt" />
    <meta name="twitter:description" content="${DESCRIPTION}" />
    <meta name="twitter:image" content="${SITE_URL}/assets/social-card.jpg" />
  </head>

  <body>
    <noscript>
    <div id="no-script">
    <div id="no-script-content">
    ${md.render(content)}
    </div>
    </div></noscript>
    <script type="module" src="/src/main.ts"></script>
    <a href="https://hci.social/@mcnuttandrew" rel="me"></a>
  </body>
</html>

  `;

  writeFile("./index.html", noScriptContents);
}
main();
