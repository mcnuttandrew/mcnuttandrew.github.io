import {PUBLICATIONS, COLLABORATOR_LINKS} from './constants';

export function classnames(classObject) {
  return Object.keys(classObject)
    .filter((name) => classObject[name])
    .join(' ');
}

const routes = new Set(['cv', 'publications', 'projects', 'about', 'teaching', 'zines', 'news']);
export function getRoute() {
  const locationSplit = location.href.split('/');
  const naiveLocation = locationSplit[locationSplit.length - 1].toLowerCase();
  if (
    location.href.includes('research') &&
    naiveLocation !== 'research' &&
    PUBLICATIONS.map((d) => d.urlTitle).includes(naiveLocation)
  ) {
    return 'show-page';
  }

  return routes.has(naiveLocation) ? naiveLocation : 'about';
}

export function getShowPage() {
  const locationSplit = location.href.split('/');
  const naiveLocation = locationSplit[locationSplit.length - 1].toLowerCase();
  return naiveLocation;
}

export function groupBy(data, key) {
  return data.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || []).concat(row);
    return acc;
  }, {});
}

export function addLinks(authors) {
  return Object.entries(COLLABORATOR_LINKS).reduce((str, [key, link]) => {
    return str.replace(key, `[${key}](${link})`);
  }, authors.replace('Andrew McNutt', '__Andrew McNutt__'));
}

/**
 *
 * @param {*} wrapped
 * @param {*} eventConfig - {type: string; context: string; value: string}
 * @returns
 */
export function wrapEvent(wrapped, eventConfig) {
  const eventName = eventConfig.context
    ? `${eventConfig.type}|${eventConfig.context}|${eventConfig.value}`
    : `${eventConfig.type}|${eventConfig.value}`;
  return function (e) {
    umami(eventName);
    wrapped(e);
  };
}
