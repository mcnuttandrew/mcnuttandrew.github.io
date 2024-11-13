import { MISC as miscImport } from "./data/misc";

import { NEWS as newsImport } from "./data/news";
import { PUBLICATIONS as pubsImport } from "./data/publications";
import zineImport from "./data/zines";
export const NEWS = newsImport;
export const MISC = miscImport;
export const PUBLICATIONS = pubsImport;
export const ZINES = zineImport;
/* eslint-disable max-len */

export const SECTIONS = ["about", "publications", "teaching", "misc"];

export const COLLABORATOR_LINKS: Record<string, `http${string}`> = {
  "Aaron Elmore": "http://people.cs.uchicago.edu/~aelmore/",
  "Agatha Seo-Hyun Kim": "https://orcid.org/0000-0002-0806-5410",
  "Alex M. Clark":
    "https://scholar.google.com/citations?user=4Gv4PboAAAAJ&hl=en",
  "Alex Kale": "https://people.cs.uchicago.edu/~kalea/",
  "Allison Morgan": "https://allisonmorgan.github.io/",
  "Anamaria Crisan": "https://amcrisan.github.io/",
  "Anton Outkine": "https://antonoutkine.com/",
  "Blase Ur": "https://www.blaseur.com/",
  "Chenglong Wang": "https://chenglongwang.org/",
  "Chenhao Tan": "https://cs.uchicago.edu/people/chenhao-tan/",
  "Elsie Lee-Robbins": "https://elsiejlee.com/",
  "Gordon Kindlmann": "http://people.cs.uchicago.edu/~glk/",
  "Jane L. Adams": "http://universalities.com/",
  "Jeffrey Heer": "https://homes.cs.washington.edu/~jheer/",
  "Junran Yang": "https://homes.cs.washington.edu/~junran/",
  "Joel Franklin": "http://people.reed.edu/~jfrankli/",
  "Ken Gu": "https://kenqgu.com/",
  "Kevin Bryson": "https://kevinbryson.world/",
  "Krishna Dole":
    "https://scholar.google.com/citations?user=J4TpF1YAAAAJ&hl=en",
  "Kyle Chard": "https://kylechard.com/",
  "Leilani Battle": "https://homes.cs.washington.edu/~leibatt/bio.html",
  "Madeleine Grunde-McLaughlin": "https://madeleinegrunde.github.io/",
  "Maureen C. Stone": "https://mcstone.github.io/",
  "Matthias Miller": "https://www.vis.uni-konstanz.de/mitglieder/miller/",
  "Mennatallah El-Assady": "https://el-assady.com/",
  "Michael Correll": "https://correll.io/",
  "Michael J. McGuffin": "https://www.michaelmcguffin.com/",
  "Michael Littman": "https://www.littmania.com/",
  "Nelia Mann":
    "https://www.union.edu/physics-and-astronomy/faculty-staff/nelia-mann",
  "Nicolas Kruchten": "http://nicolas.kruchten.com/",
  "Ravi Chugh": "http://people.cs.uchicago.edu/~rchugh/",
  "Rob DeLine": "https://www.microsoft.com/en-us/research/people/rdeline/",
  "Sara Di Bartolomeo": "https://picorana.github.io/",
  "Sean Ekins": "https://scholar.google.com/citations?user=6NNfXAMAAAAJ&hl=en",
  "Steven M. Drucker": "https://stevenmdrucker.github.io/#/",
  "Tim Althoff": "https://homes.cs.washington.edu/~althoff/",
  "Varchas Gopalaswamy":
    "https://scholar.google.com/citations?user=PxH1Z7kAAAAJ&hl=en",
  "Victor Schetinger": "https://www.cvast.tuwien.ac.at/team/victor-schetinger",
  "Will Brackenbury": "https://wbrackenbury.github.io/",
  "Yuxin Chen": "https://yuxinchen.org/",
};

const selectedPubs = new Set([
  "mirage",
  "sauce",
  "ai-4-notebooks",
  "color-buddy",
]);
export const SELECTED_PUBLICATIONS = PUBLICATIONS.filter((x) =>
  selectedPubs.has(x.urlTitle)
);

export const PRESENTATIONS: {
  title: string;
  details: string[];
  links?: { name: string; link: string }[];
}[] = [
  {
    title: "Safer Interfaces for Data Visualization",
    details: [
      "VL/HCC, October, 2023, Washington, D.C.",
      "Vega Conf, September, 2023, Seattle, Washington",
    ],
    links: [],
  },
  {
    title: "Safer Interfaces for Data Visualization",
    details: [
      "University of California Berkeley, May, 2023, Berkeley, California",
      "Microsoft Research, April, 2023, Cambridge, England (Virtual)",
      "Roux Institute, March, 2023, Portland, Maine",
      "University of Utah, February, 2023, Salt Lake City, Utah",
    ],
    links: [],
  },
  {
    title: "A Study of Editor Features in a Creative Coding Classroom",
    details: ["SIGCHI, April, 2023, Hamburg, Germany"],
    links: [],
  },
  {
    title: "On the Design of AI-powered Code Assistants for Notebooks",
    details: ["SIGCHI, April, 2023, Hamburg, Germany"],
    links: [],
  },
  {
    title:
      "Understanding and Enhancing JSON-based DSL Interfaces for Visualization",
    details: [
      "Shandong University, November 15, 2022, Qingdao, China. (Virtual)",
      "IEEE VIS Doctoral Colloquium, October 15, 2022, Oklahoma City, Oklahoma. ",
    ],
    links: [],
  },
  {
    title:
      "No Grammar to Rule Them All: A Survey of JSON-Style DSLs for Visualization",
    details: [
      "IEEEVIS, October 19, 2022, Oklahoma City, Oklahoma.",
      " Microsoft Research, July 14, 2022, Redmond, Washington. (Virtual)",
    ],
    links: [],
  },
  {
    title: "On The Potential of Zines as a Medium for Visualization",
    details: ["IEEEVIS, October 27, 2021, New Orleans, Louisiana. (Virtual)"],
    links: [],
  },

  {
    title: "Visualization for Villainy",
    details: ["alt.vis, October 24, 2021, New Orleans, Louisiana. (Virtual)"],
    links: [],
  },

  {
    title:
      "How do we know what a visualization is good for? Algebraic Approaches",
    details: [
      "[RAMPVIS](https://sites.google.com/view/rampvis/events?authuser=0), August 5, 2021, Oxford, England. (Virtual)",
    ],
    links: [
      {
        name: "slides",
        link: "(https://drive.google.com/file/d/1o9-7cBnQXfO8VTMS9V7MZ_5odwYVUkYw/view?usp=sharing",
      },
    ],
  },

  {
    title: "What are Table Cartograms Good for Anyway? An Algebraic Analysis",
    details: [
      "EuroVis, June 15, 2021, Zurich, Switzerland. (Virtual)",
      "City University London, May 18, 2021, London, England. (Virtual)",
    ],
    links: [],
  },

  {
    title:
      "Integrated Visualization Editing via Parameterized Declarative Templates",
    details: [
      "SIGCHI, May 12-13, 2021, Yokohama, Japan (Virtual)",
      "CHIcago Symposium, May 5, 2021, Chicago, Illinois (Virtual)",
    ],
    links: [],
  },

  {
    title:
      "Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading",
    details: ["VIS4DH, October 25, 2020, Salt Lake City, Utah (Virtual)"],
    links: [],
  },

  {
    title: "Surfacing Visualization Mirages",
    details: ["CHIcago Symposium, May 26, 2020, Chicago, IL (Virtual)"],
    links: [],
  },

  {
    title: "Divining Insights: Visual Analytics Through Cartomancy",
    details: ["CHIcago Symposium, May 26, 2020, Chicago, IL (Virtual)"],
    links: [],
  },

  {
    title:
      "Linting for Visualization: Towards a Practical Automated Visualization Guidance System",
    details: ["VIS Guides, October 22, 2018, Berlin, Germany"],
    links: [],
  },

  {
    title:
      "Design and Analysis of Table Cartograms: Simultaneous-Multipurpose Tabular Area-Encoding Displays",
    details: ["University of Chicago, June 12, 2019, Chicago, Illinois"],
    links: [],
  },

  // {
  //   title:
  //     'Linting for Visualization: Towards a Practical Automated Visualization Guidance System',
  //   link: 'assets/vis-lint-talk.pdf',
  //   journal: 'VisGuides 2018. October 22, 2018'
  // },
  {
    // imgLink: 'converted-images/design-patterns-pic.jpg',
    title: "Design Patterns For Data Visualization in React",
    // link: 'http://tinyurl.com/reactvisdesignpatterns',
    details: ["React Chicago. August 29, 2018"],
    // subtitle: 'An overview of four useful patterns for developing visualizations in react',
    links: [
      { name: "slides", link: "http://tinyurl.com/reactvisdesignpatterns" },
    ],
  },
  // {
  //   link: 'assets/nlm-talk.pdf',
  //   title: 'Nonequivalent Lagrangian Mechanics',
  //   journal: 'Reed Physics Seminar. April 8, 2014'
  // },
];

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

export const AWARDS: {
  society: string;
  date: string;
  awardName: string;
  detail?: string;
}[] = [
  {
    society: "IEEE VIS",
    date: "2023",
    awardName: "Special Recognition for Outstanding Review",
  },
  {
    society: "ACM SIGCHI",
    date: "2023",
    awardName: "Special Recognition for Outstanding Review x3",
  },
  {
    society: "Siebel",
    date: "2023",
    awardName: "Siebel Scholars Class of 2023",
  },
  {
    society: "ACM SIGCHI",
    date: "2022",
    awardName: "Special Recognition for Outstanding Review x2",
  },
  {
    society: "ACM UIST",
    date: "2021",
    awardName: "Special Recognition for Outstanding Review",
  },
  {
    society: "UChicago Grad",
    date: "October 2021",
    awardName: "Graduate Council Research Fund",
  },
  {
    society: "Eurographics Working Group on Data Visualization",
    date: "2021",
    awardName: "Honorable Mention for Best Paper",
    detail:
      "(single juried selection) for What are Table Cartograms Good for Anyway? An Algebraic Analysis",
  },
  {
    society: "ACM SIGCHI",
    date: "2021",
    awardName: "Special Recognition for Outstanding Review",
  },
  {
    society: "IEEE VIS",
    date: "October 2020",
    awardName: "InfoVis Honorable Mention Poster Research",
    detail:
      "for A Minimally Constrained Optimization Algorithm for Table Cartograms",
  },
  {
    society: "ACM SIGCHI",
    date: "March 2020",
    awardName: "Best Paper Honorable Mention",
    detail: "(Top 5\\%) for Surfacing Visualization Mirages",
  },
  {
    society: "MindBytes Research Symposium",
    date: "October 2019",
    awardName: "Best Poster in Visualization",
  },
  {
    society: "UChicago Grad",
    date: "October 2019",
    awardName: "Graduate Council Travel Fund",
  },
  {
    society: "Information is Beautiful Awards",
    date: "September 2019",
    awardName: "Long List for Visual Analytics and Unusual Categories",
    detail: "for 'FeX': Forum Explorer and Cycles Rain Seasons in Size",
  },
  {
    society: "University of Chicago, Department of Computer Science",
    date: "June 2019",
    awardName: "Teaching Assistant Prize",
  },
  {
    society: "UChicago Physical Sciences Division ",
    date: "May 2018, May 2019",
    awardName: "Divisional Teaching Award Nominee",
  },
  {
    society: "UChicago Art and Science Expo",
    date: "May 2019",
    awardName: "2nd Place for Best in Show",
  },
  {
    society: "Reed College",
    date: "May 2014",
    awardName: "Commendation of Academic Excellence",
    detail: "Merit given to students exhibiting exemplary scholarship",
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

export const SERVICE: {
  organization: string;
  date: string;
  role: string;
  link?: string;
}[] = [
  {
    organization: "Information+ Conference",
    date: "2023",
    role: "Organizing Committee",
    link: "https://informationplusconference.com/2023/",
  },
  {
    organization: "alt.vis",
    date: "2023",
    role: "Organizing Committee",
    link: "https://altvis.github.io/",
  },
  {
    organization: "alt.vis",
    date: "2022",
    role: "Organizing Committee",
    link: "https://altvis.github.io/",
  },
  {
    organization: "VisGuides",
    date: "2022",
    role: "Program Committee",
    link: "https://visguides-workshop.github.io/",
  },
  {
    organization: "EuroVis",
    date: "2021",
    role: "Student Volunteer",
  },
  {
    organization: "Chicago Public Schools CSEd Week",
    date: "2020",
    role: "Speaker",
  },
  {
    organization: "Open Access VIS  / EuroVIS",
    date: "2019",
    role: "Contributor / Organizer",
    link: "http://oavis.org/",
  },
  {
    organization: "South Side Civic",
    date: "2019",
    role: "Scope-athon Facilitator",
  },
  {
    organization: "UChicago Visualization Research Reading Group",
    date: "February 2019-Match 2021",
    role: "Organizer",
    link: "https://uchicago-vis-pl-lab.github.io/vis-reading-group/",
  },
  {
    organization: "UChicago CS Graduate Student Ministry",
    date: "2018",
    role: "Facilitator of CS Grad Weekly Coffee Break",
  },

  {
    organization: "F.L. Griffin Math-fest",
    date: "Spring 2014",
    role: "Teaching Assistant",
  },
];
