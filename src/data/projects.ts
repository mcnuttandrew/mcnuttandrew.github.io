interface Project {
  title: string;
  dates: string;
  sourceLink: string;
  link: string;
  imgLink: string;
  text: string;
  tags: ('visualization' | 'tech' | 'art')[];
}

export const PROJECTS: Project[] = [
  {
    title: 'Prong Editor',
    dates: 'September 2021 - ',
    sourceLink: 'https://github.com/mcnuttandrew/prong',
    link: 'http://prong-editor.netlify.app/',
    imgLink: 'converted-images/prong-logo.jpg',
    text: 'A projectional editor for JSON-based DSLs',
    tags: ['visualization', 'tech']
  },
  {
    title: 'Zines',
    dates: 'May 2019 - ',
    sourceLink: 'https://www.mcnutt.in/#/zines',
    link: 'https://www.mcnutt.in/#/zines',
    imgLink: 'converted-images/bison-eylsium-cover.jpg',
    text: 'Zines are cool and I make them for various reasons',
    tags: ['art', 'tech', 'visualization']
  },

  {
    title: 'Ivy',
    dates: 'November 2019 - August 2020',
    sourceLink: 'https://github.com/mcnuttandrew/ivy',
    link: 'http://ivy-vis.netlify.app/',
    imgLink: 'converted-images/ivy.jpg',
    text: "A meta-level approach to visual analytics. Information is Beautiful Awards '22 Long List.",
    tags: ['visualization', 'tech']
  },
  {
    title: 'table-cartogram.ts',
    dates: 'September 2020',
    sourceLink: 'https://github.com/mcnuttandrew/table-cartogram',
    link: 'https://www.mcnutt.in/table-cartogram/',
    imgLink: 'converted-images/taco-ts.jpg',
    text: 'A library for constructing table cartograms in the browser.',
    tags: ['visualization', 'tech']
  },
  {
    title: 'Sortilège',
    dates: 'January 2020',
    sourceLink: 'https://github.com/vis-tarot/vis-tarot',
    link: 'https://vis-tarot.github.io/vis-tarot/',
    imgLink: 'converted-images/vis-tarot-back.jpg',
    text: 'A tarot based visual analytics system. It guides users analytics process via the divine hands of fate.',
    tags: ['visualization']
  },
  {
    title: 'Data is Plural Search',
    dates: 'May 2020',
    sourceLink: 'https://github.com/mcnuttandrew/data-is-plural-search',
    link: 'https://data-is-plural-search.netlify.app/',
    imgLink: 'converted-images/data-is-plural.jpg',
    text: 'A simple web view for the data is plural news letter by Singer-Vine.',
    tags: ['tech']
  },

  {
    title: 'Cycles & Rain / Seasons In Size',
    dates: 'July 2019',
    sourceLink: 'https://github.com/mcnuttandrew/cycles-rain-seasons-in-size/',
    link: 'https://www.mcnutt.in/cycles-rain-seasons-in-size/',
    imgLink: 'converted-images/cycles-in-rain.jpg',
    text: "A little infographic about bicycle ridership in Seattle featuring table cartograms. Information is Beautiful Awards '19 Long List.",
    tags: ['visualization', 'art']
  },
  {
    title: 'CSSQL',
    dates: 'May 2019',
    sourceLink: 'https://github.com/mcnuttandrew/cssql',
    link: 'https://www.npmjs.com/package/node-cssql',
    imgLink: 'converted-images/cssql-logo.jpg',
    text: 'A new answer to this css-in-js question: css in sql. A sql-ddl to css transpiler written in haskell, available on npm.',
    tags: ['tech']
  },
  {
    title: 'Forum Explorer',
    dates: 'April 2019',
    sourceLink: 'https://github.com/mcnuttandrew/forum-explorer',
    link: 'https://www.mcnutt.in/forum-explorer/',
    imgLink: 'converted-images/forum-ex-pic.jpg',
    text: "A chrome extension and website that allows users to explore threaded conversations using trees.  Information is Beautiful Awards '19 Long List.",
    tags: ['visualization', 'tech']
  },
  {
    title: 'tap-react-browser',
    dates: 'February - April 2018',
    link: 'https://github.com/mcnuttandrew/tap-react-browser/',
    sourceLink: 'https://github.com/mcnuttandrew/tap-react-browser/',
    imgLink: 'converted-images/tap-react-browser.jpg',
    text: `A lightweight wrapper on tape that spits out react components.`,
    tags: ['tech']
  },
  {
    title: 'Constellations of Home - XMAS CARDS 2017',
    dates: 'December 2017',
    link: 'http://www.mcnutt.in/home-graphs/',
    sourceLink: 'https://github.com/mcnuttandrew/home-graphs',
    imgLink: 'converted-images/home-graphs.jpg',
    text: `Over the 2017 holidays I spent some time meditating on memory, home, and
    graph theory, which led to my making these christmas cards.`,
    tags: ['visualization', 'art']
  },
  {
    title: 'On The Shape of American Cities I/II',
    dates: 'July 2017',
    link: 'http://www.mcnutt.in/city-size/',
    sourceLink: 'https://github.com/mcnuttandrew/city-size',
    imgLink: 'converted-images/city-size.jpg',
    text: 'A print graphic describing the shape of the 100 most populous American cities.',
    tags: ['visualization', 'art']
  },
  {
    title: 'Pantone: Color of the year',
    dates: 'Updated yearly, starting 2016-2020',
    link: 'http://www.mcnutt.in/color-of-the-year/',
    sourceLink: 'https://github.com/mcnuttandrew/color-of-the-year',
    imgLink: 'converted-images/color-of-year.jpg',
    text: `A small exploration of the glory and wonder that is Pantone's color of the year.`,
    tags: ['visualization']
  },
  {
    title: 'react-vis',
    dates: '2016 - 2019',
    link: 'http://uber.github.io/react-vis/#/',
    sourceLink: 'https://github.com/uber/react-vis',
    imgLink: 'converted-images/react-vis-image.jpg',
    text: 'A charting library for the react ecosystem.',
    tags: ['visualization', 'tech']
  },
  {
    title: 'Unnamed Tarot Deck',
    dates: 'Dec 2015 - June 2016',
    link: 'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
    sourceLink: 'https://github.com/mcnuttandrew/tarot-deck',
    imgLink: 'converted-images/tarot-image.jpg',
    text: 'A tarot tech themed around the signage and spirit of the American highway system.',
    tags: ['art']
  }
];
