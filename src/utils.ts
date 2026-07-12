import type { Publication } from "./data/publications";
import { COLLABORATOR_LINKS } from "./constants";

import About from "./components/About.svelte";
import Misc from "./components/Misc.svelte";
import Publications from "./components/Publications.svelte";
import Teaching from "./components/Teaching.svelte";
import News from "./components/News.svelte";
import Zines from "./components/Zines.svelte";
import Lab from "./components/Lab.svelte";
import FullBib from "./components/FullBib.svelte";
// @ts-ignore
import HIRING24 from "./text-chunks/hiring-24.md?raw";
// @ts-ignore
import HIRING26 from "./text-chunks/hiring-26.md?raw";
import Post from "./components/Post.svelte";

const post = (
  content: string,
): { component: any; props: Record<string, any> } => ({
  component: Post,
  props: { content },
});
export const routing: Record<
  string,
  { component: any; props?: Record<string, any> }
> = {
  publications: { component: Publications },
  misc: { component: Misc },
  lab: { component: Lab },
  teaching: { component: Teaching },
  news: { component: News },
  zines: { component: Zines },
  "hiring-24": post(HIRING24),
  "hiring-26": post(HIRING26),
  "full-bib": { component: FullBib },
  about: { component: About },
};
export function getRoute() {
  const locationSplit = location.href.split("/").filter((d) => d.length);
  const naiveLocation = locationSplit[locationSplit.length - 1].toLowerCase();

  return routing[naiveLocation] ? naiveLocation : "about";
}

export function getShowPage() {
  const locationSplit = location.href.split("/");
  const naiveLocation = locationSplit[locationSplit.length - 1].toLowerCase();
  return naiveLocation;
}

export function groupBy(data: any[], key: string) {
  return data.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || []).concat(row);
    return acc;
  }, {});
}

export function addLinks(authors: string) {
  return Object.entries(COLLABORATOR_LINKS).reduce(
    (str, [key, link]) => {
      return str.replace(key, `[${key}](${link})`);
    },
    authors.replace("Andrew McNutt", "__Andrew McNutt__"),
  );
}

function formatAuthorsForLatex(authors: string): string {
  return authors
    .split(",")
    .map((author) => {
      const names = author.split(" ").filter((x) => x.length > 1);
      return `${names.at(-1)}, ${names.slice(0, names.length - 1).join(" ")}`;
    })
    .join(" and ");
}

export function buildBibTexEntry(publication: Publication): string {
  const name =
    publication.authors.split(",").at(0)?.split(" ").at(-1)?.toLowerCase() ||
    "";
  const titleKey = publication.title.split(" ").at(0);
  const entryType =
    publication.type === "thesis" ? "phdthesis" : "inproceedings";
  let key = `${name}${publication.year}${publication.year}${titleKey}`.replace(
    ":",
    "",
  );

  const fields: Record<string, string | number> = {
    title: publication.title,
    author: formatAuthorsForLatex(publication.authors),
    journal: publication.journal,
    year: publication.year,
  };
  if (publication.doi !== "NA") {
    fields.doi = publication.doi;
  }
  if (publication.type === "thesis") {
    fields.authors = publication.authors;
    key = publication.paperKey || key;
  }

  return `
\`\`\`  

@${entryType}{${key},
  ${Object.entries(fields)
    .map(([k, v]) => `${k} = {${v}}`)
    .join(",\n  ")}
}

\`\`\`  `;
}
