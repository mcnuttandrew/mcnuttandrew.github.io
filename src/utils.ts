import type { Publication } from "./data/publications";
import { PUBLICATIONS, COLLABORATOR_LINKS } from "./constants";

const routes = new Set([
  "publications",
  "about",
  "teaching",
  "zines",
  "lab",
  "news",
  "misc",
  "hiring-24",
]);
export function getRoute() {
  const locationSplit = location.href.split("/").filter((d) => d.length);
  const naiveLocation = locationSplit[locationSplit.length - 1].toLowerCase();
  if (
    location.href.includes("research") &&
    naiveLocation !== "research" &&
    PUBLICATIONS.map((d) => d.urlTitle).includes(naiveLocation)
  ) {
    return "show-page";
  }

  return routes.has(naiveLocation) ? naiveLocation : "about";
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
  return Object.entries(COLLABORATOR_LINKS).reduce((str, [key, link]) => {
    return str.replace(key, `[${key}](${link})`);
  }, authors.replace("Andrew McNutt", "__Andrew McNutt__"));
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
  const name = publication.authors.split(",").at(0)?.split(" ").at(-1);
  const titleKey = publication.title.split(" ").at(0);
  const key = `${name}${publication.year}${publication.year}${titleKey}`;
  if (publication.type === "theses / book chapters") {
    return "";
  }
  return `
\`\`\`  
@inproceedings{${key},
    title={${publication.title}},
    author    = {${formatAuthorsForLatex(publication.authors)}},
    journal   = {${publication.pureJournal}},
    year      = {${publication.year}}

}
\`\`\`  `;
}
