import { MISC as miscImport } from "./data/misc";

import { NEWS as newsImport } from "./data/news";
import { PUBLICATIONS as pubsImport } from "./data/publications";
import zineImport from "./data/zines";
export const NEWS = newsImport;
export const MISC = miscImport;
export const PUBLICATIONS = pubsImport;
export const ZINES = zineImport;

export const SECTIONS = ["about", "publications", "teaching", "misc"];

export const COLLABORATOR_LINKS: Record<string, `http${string}`> = {
  "Aaron Elmore": "http://people.cs.uchicago.edu/~aelmore/",
  "Agatha Seo-Hyun Kim": "https://orcid.org/0000-0002-0806-5410",
  "Alex Kale": "https://people.cs.uchicago.edu/~kalea/",
  "Alex M. Clark":
    "https://scholar.google.com/citations?user=4Gv4PboAAAAJ&hl=en",
  "Alexander Lex": "https://vdl.sci.utah.edu/team/lex/",
  "Allison Morgan": "https://allisonmorgan.github.io/",
  "Anamaria Crisan": "https://amcrisan.github.io/",
  "Anton Outkine": "https://antonoutkine.com/",
  "Blase Ur": "https://www.blaseur.com/",
  "Brian Bollen": "https://www.briancbollen.com/",
  "Chenglong Wang": "https://chenglongwang.org/",
  "Chenhao Tan": "https://cs.uchicago.edu/people/chenhao-tan/",
  "El Kindi Rezig": "https://elkindi.github.io/",
  "Elsie Lee-Robbins": "https://elsiejlee.com/",
  "Gordon Kindlmann": "http://people.cs.uchicago.edu/~glk/",
  "Hilson Shrestha": "https://hilsonshrestha.com.np/",
  "Jack Wilburn": "https://vdl.sci.utah.edu/team/wilburn/",
  "Jane L. Adams": "http://universalities.com/",
  "Jeffrey Heer": "https://homes.cs.washington.edu/~jheer/",
  "Joel Franklin": "http://people.reed.edu/~jfrankli/",
  "Junran Yang": "https://homes.cs.washington.edu/~junran/",
  "Ken Gu": "https://kenqgu.com/",
  "Kevin Bryson": "https://kevinbryson.world/",
  "Krishna Dole":
    "https://scholar.google.com/citations?user=J4TpF1YAAAAJ&hl=en",
  "Kyle Chard": "https://kylechard.com/",
  "Lane Harrison": "https://web.cs.wpi.edu/~ltharrison/",
  "Leilani Battle": "https://homes.cs.washington.edu/~leibatt/bio.html",
  "Madeleine Grunde-McLaughlin": "https://madeleinegrunde.github.io/",
  "Matthias Miller": "https://www.vis.uni-konstanz.de/mitglieder/miller/",
  "Maureen C. Stone": "https://mcstone.github.io/",
  "Mennatallah El-Assady": "https://el-assady.com/",
  "Michael Correll": "https://correll.io/",
  "Michael J. McGuffin": "https://www.michaelmcguffin.com/",
  "Michael Littman": "https://www.littmania.com/",
  "Nelia Mann":
    "https://www.union.edu/physics-and-astronomy/faculty-staff/nelia-mann",
  "Nicolas Kruchten": "http://nicolas.kruchten.com/",
  "Paul Rosen": "https://cspaul.com/",
  "Ravi Chugh": "http://people.cs.uchicago.edu/~rchugh/",
  "Rob DeLine": "https://www.microsoft.com/en-us/research/people/rdeline/",
  "Sam Cohen": "https://sbcohen.net/",
  "Sara Di Bartolomeo": "https://picorana.github.io/",
  "Sean Ekins": "https://scholar.google.com/citations?user=6NNfXAMAAAAJ&hl=en",
  "Steven M. Drucker": "https://stevenmdrucker.github.io/#/",
  "Tim Althoff": "https://homes.cs.washington.edu/~althoff/",
  "Victor Schetinger": "https://www.cvast.tuwien.ac.at/team/victor-schetinger",
  "Will Brackenbury": "https://wbrackenbury.github.io/",
  "Yuxin Chen": "https://yuxinchen.org/",
};

const selectedPubs = new Set([
  "mirage",
  // "sauce",
  "tattoo",
  // "no-grammar",
  "ai-4-notebooks",
  "color-buddy",
]);
export const SELECTED_PUBLICATIONS = PUBLICATIONS.filter((x) =>
  selectedPubs.has(x.urlTitle)
);

export const BLOG_POSTS = [
  {
    imgLink: "converted-images/tarot-image.jpg",
    title:
      "A Brief Saga Concerning the Making of a Tarot Deck About the American Highway System",
    subtitle: "A little essay about making",
    date: "Personal Blog. December 10, 2018",
    link: "https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8",
    links: [
      {
        name: "blog post",
        link: "https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8",
      },
      { name: "github", link: "https://github.com/mcnuttandrew/tarot-deck" },
    ],
  },
  {
    imgLink: "converted-images/advanced-react-vis-pic.jpg",
    title: "Advanced Visualization with react-vis",
    subtitle:
      "Using Voronois, single pass rendering, and canvas components for amazing user experiences",
    date: "Towards Data Science. May 21, 2018",
    link: "https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4",
    links: [
      {
        name: "blog post",
        link: "https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4",
      },
      // {name: 'talk', link: 'http://tinyurl.com/reactvisdesignpatterns'},
      {
        name: "code",
        link: "https://github.com/mcnuttandrew/advanced-react-vis-tutorial",
      },
    ],
  },
];

export const TEACHING = [
  {
    title: "CS6967: Critical VIS+HCI",
    date: "Spring 2025",
    role: "Instructor",
    location: "University of Utah",
    link: "https://www.mcnutt.in/critical-hci-vis-class/",
  },
  {
    title: "COMP 1010 - Programming for All 1",
    date: "Fall 2024",
    role: "Instructor",
    location: "University of Utah",
    link: "https://utah.instructure.com/courses/1001929",
  },
  {
    title: "CAPP 30239 - Data Visualization For Public Policy",
    date: "Winter 2021",
    role: "Instructor",
    location: "UChicago",
    link: "https://capp-30239-winter-2021.netlify.app/",
  },
  {
    title: "DATA 22700 - Data Visualization and Communication",
    date: "Spring 2023",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "https://github.com/kalealex/data227-sp23",
  },
  {
    title: "CMSC 11111 - Creative Coding",
    date: "Winter 2022",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "https://www.classes.cs.uchicago.edu/archive/2022/winter/11111-1/",
  },
  {
    title: "Art with Science: Creative Coding",
    date: "Summer 2021",
    role: "Teaching Assistant",
    // location: "Collegiate Scholars Program (Highschool students)",
    location: "UChicago",
    link: "https://www.classes.cs.uchicago.edu/archive/2021/summer/creative-coding/csp/",
  },
  {
    title: "Introduction to Creative Coding",
    date: "Summer 2021",
    role: "Teaching Assistant",
    // location: "UChicago (Highschool students)",
    location: "UChicago",
    link: "https://www.classes.cs.uchicago.edu/archive/2021/summer/creative-coding/immersion/",
  },
  {
    title: "CMSC 11111 - Creative Coding",
    date: "Spring 2021",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "https://www.classes.cs.uchicago.edu/archive/2021/spring/11111-1/",
  },
  {
    title: "CMSC 23900 - Data Visualization",
    date: "Spring 2020",
    role: "Instructor",
    location: "UChicago",
  },
  {
    title: "CAPP 30239 - Data Visualization For Public Policy",
    date: "Winter 2020",
    role: "Instructor",
    location: "UChicago",
    link: "https://capp-30239-winter-2020.netlify.app/",
  },
  // {
  //   title: 'Visualization Research Reading Group',
  //   date: 'February 2019-Present',
  //   role: 'Other',
  //   location: 'UChicago',
  //   fancyTitle: 'Director',
  //   link: 'https://uchicago-vis-pl-lab.github.io/vis-reading-group/'
  // },

  {
    title: "CMSC 23900 - Data Visualization",
    date: "Spring 2019",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "http://people.cs.uchicago.edu/~glk/class/datavis19/",
  },
  {
    title: "CAPP 30239 - Data Visualization For Public Policy",
    date: "Winter 2019",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "https://twitter.com/AlexCEngler/status/1101245224733605891?s=20",
  },
  {
    title: "CAPP 30121 - Computer Science with Applications 1",
    date: "Fall 2018",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "https://classes.cs.uchicago.edu/archive/2018/fall/30121-1/",
  },
  {
    title: "CMSC 23900 - Data Visualization",
    date: "Spring 2018",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "http://people.cs.uchicago.edu/~glk/class/datavis18/",
  },
  {
    title: "CMSC 15100 - Introduction to Computer Science 1",
    date: "Winter 2018",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "https://www.classes.cs.uchicago.edu/archive/2018/winter/15100-1/syllabus.html",
  },
  {
    title: "CMSC 12100 - Computer Science with Applications 1",
    date: "Fall 2017",
    role: "Teaching Assistant",
    location: "UChicago",
    link: "https://www.classes.cs.uchicago.edu/archive/2017/fall/12100-1/",
  },
  {
    title: "Uberversity Speaker",
    date: "2016-2017",
    role: "Instructor",
    fancyTitle: "Lecturer",
    location: "Uber",
  },
  {
    title: "Visualization Eng-ucation",
    date: "2015-2017",
    role: "Instructor",
    fancyTitle: "Lecturer",
    location: "Uber",
  },
  {
    title: "Physics 101 - General Physics I",
    date: "2012",
    role: "Teaching Assistant",
    location: "Reed College",
  },
  {
    title: "F.L. Griffin Math-fest",
    date: "2014",
    role: "Teaching Assistant",
    location: "Reed College",
  },
];
