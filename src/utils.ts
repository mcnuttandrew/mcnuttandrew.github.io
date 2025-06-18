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
