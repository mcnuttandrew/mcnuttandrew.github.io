/* eslint-disable max-len */
export const ABOUT = `
  My name is Andrew McNutt, and I am a PhD student in Computer Science at the University of Chicago. My work focuses on information visualization in general and on automated guidance systems, unusual or xenographical data visualizations, and web applications as a visualization medium. I'm advised by Gordon Kindlmann.
  `;

export const HISTORY = `
  In the very near past I worked as a Data Visualization Engineer for a variety of
  companies in San Francisco, where I made visual analytic software.
  I got a formal education in physics from Reed College in Portland, and an informal
  education in web development from App Academy in San Francisco. I really like deserts,
  buffalo, and motorcycles.
  `;
// export const INTERESTS = `
//   I\'m familiar with a wide variety of technologies, including (but not limited to):
//   d3, react, flux/redux, node, backbone, processing, jquery, ruby, ruby on rails,
//   python, flask, sketch, mathematica, grid mathematica, numpy, pandaz, git.
//   (Above are some glib radar charts about skills I possess)
//   I\'m excited about info-vis, databases, applied category theory, dashboards, testing,
//   and pretty much anything in the wild world of javascript.`;
export const INTERESTS = `
    I\'m excited about info-vis, databases, applied category theory, dashboards, testing,
    and pretty much anything in the wild world of javascript.`;

export const skills = [
  {
    title: "PERSONAL",
    content: "information design, physics, arts"
  },
  {
    title: "WEB DEV",
    content:
      "d3, react, flux/redux, node, backbone, processing, jquery, ruby, ruby on rails, python, flask, sketch"
  },
  {
    title: "SCI-COM",
    content: "mathematica, grid mathematica, numpy, pandaz"
  }
];

export const PUBLICATIONS = [
  {
    link: "assets/forum-explorer-paper.pdf",
    imgLink: "assets/forested-tree-view-example.jpg",
    title:
      "Improving the Scalability of Interactive Visualization Systems for Exploring Threaded Conversations",
    authors: "Andrew McNutt, Gordon Kindlmann",
    journal: "EuroVis - Extended Abstract. June 2019",
    links: [
      { name: "paper", link: "assets/forum-explorer-paper.pdf" },
      { name: "poster", link: "assets/forum-explorer-poster.pdf" },
      { name: "live", link: "https://www.mcnutt.in/forum-explorer/" },
      { name: "code", link: "https://github.com/mcnuttandrew/forum-explorer" },
      { name: "osf", link: "https://osf.io/nrhqw/" }
    ],
    abstract: `
    Large threaded conversations, such as those found on YCombinator’s HackerNews,
    are typically presented in a way that shows individual comments clearly,
    but can obscure larger trends or patterns within the conversational corpus.
    Previous research has addressed this problem through graphical-overviews and NLP-generated summaries.
    These efforts have generally assumed a particular (and modest) data size,
    which limits their utility for large or deeply-nested conversations, and often
    require non-trivial offline processing time, which makes them impractical for day-to-day usage.
    We describe here Forum Explorer, a Chrome extension that combines and expands upon
    prior art through a collection of techniques that enable this type of
    representation to handle wider ranges of data in real time. Materials for this project are available at https://osf.io/nrhqw/.
    `,
    bibTex: `
    @inproceedings{McNuttKindlmannForumExplorerPoster,
      title={Improving the Scalability of Interactive Visualization Systems for Exploring Threaded Conversations},
      author={McNutt, Andrew and Kindlmann, Gordon},
      booktitle={Poster Abstracts of the EG/VGTC Conference on Visualization (EuroVis)},
      year={2019}
    }`
  },
  {
    link: "assets/McNutt_Kindlmann_2018.pdf",
    imgLink: "assets/lint-pic.jpg",
    title:
      "Linting for Visualization: Towards a Practical Automated Visualization Guidance System",
    authors: "Andrew McNutt, Gordon Kindlmann",
    journal: "VisGuides (IEEEVIS Workshop). Octobr 2018",
    links: [
      { name: "paper", link: "assets/McNutt_Kindlmann_2018.pdf" },
      { name: "code", link: "https://github.com/mcnuttandrew/vislint_mpl" },
      { name: "talk", link: "assets/vis-lint-talk.pdf" }
    ],
    abstract: `
    Constructing effective charts and graphs in a scientific setting is a
    nuanced task that requires a thorough understanding of visualization
    design; a knowledge that may not be available to all practicing scientists.
    Previous attempts to address this problem have pushed chart
    creators to pore over large collections of guidelines and heuristics,
    or to relegate their entire workflow to end-to-end tools that provide
    automated recommendations. In this paper we bring together these
    two strains of ideas by introducing the use of lint as a mechanism for
    guiding chart creators towards effective visualizations in a manner
    that can be configured to taste and task without forcing users to abandon their usual workflows.
    The programmatic evaluation model of
    visualization linting (or vis lint) offers a compelling framework for
    the automation of visualization guidelines, as it offers unambiguous
    feedback during the chart creation process, and can execute analyses derived from machine vision and natural language processing.
    We demonstrate the feasibility of this system through the production of vislint_mpl,
    a prototype visualization linting system, that
    evaluates charts created in matplotlib.
    `,
    bibTex: `
    @misc{mcnuttKindlmannLinting,
      Author = {McNutt, Andrew and Kindlmann, Gordon},
      Howpublished = {IEEE VIS Workshop: \href{https://c4pgv.dbvis.de/}{VisGuides: 2nd Workshop on the Creation, Curation, Critique and Conditioning of Principles and Guidelines in Visualization}},
      Month = oct,
      Title = {Linting for Visualization: Towards a Practical Automated Visualization Guidance System},
      Year = {2018}}
    `
  },
  {
    link: "https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14",
    imgLink: "assets/cdd-pic.jpg",
    title:
      "Data Mining and Computational Modeling of High-Throughput Screening Datasets",
    authors: `Sean Ekins, Alex M Clark, Krishna Dole, Kellan Gregory, Andrew McNutt,
    Anna Coulon Spektor, Charlie Weatherall, Nadia K Litterman, Barry A Bunin`,
    journal: "Reporter Gene Assays. 2018",
    links: [
      {
        name: "paper",
        link: "https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14"
      }
    ],
    abstract: `
    We are now seeing the benefit of investments made over the last decade in
    high-throughput screening (HTS) that is resulting in large structure activity
    datasets entering public and open databases such as ChEMBL and PubChem.
    The growth of academic HTS screening centers and the increasing move to academia
    for early stage drug discovery suggests a great need for the informatics tools and
    methods to mine such data and learn from it. Collaborative Drug Discovery, Inc. (CDD)
    has developed a number of tools for storing, mining, securely and selectively sharing,
    as well as learning from such HTS data. We present a new web based data mining and
    visualization module directly within the CDD Vault platform for high-throughput
    drug discovery data that makes use of a novel technology stack following modern
    reactive design principles. We also describe CDD Models within the CDD Vault platform
    that enables researchers to share models, share predictions from models, and create models
    from distributed, heterogeneous data. Our system is built on top of the Collaborative
    Drug Discovery Vault Activity and Registration data repository ecosystem which allows
    users to manipulate and visualize thousands of molecules in real time. This can be
    performed in any browser on any platform. In this chapter we present examples of its
    use with public datasets in CDD Vault. Such approaches can complement other cheminformatics
    tools, whether open source or commercial, in providing approaches for data mining and modeling of HTS data.
    `
  },
  {
    link: "https://arxiv.org/abs/1501.07537",
    imgLink: "assets/qgrav-pic.jpg",
    title: "The Schrodinger-Newton System with Self-field Coupling",
    authors: "Joel Franklin, Youdan Guo, Andrew McNutt, and Allison Morgan",
    journal: "Classical and Quantum Gravity. 2015",
    links: [
      { name: "paper", link: "https://arxiv.org/abs/1501.07537" },
      { name: "talk", link: "assets/QGravPresentation.pdf" }
    ],
    abstract: `
    We study the Schrodinger-Newton system of equations with the addition of gravitational
    field energy sourcing - such additional nonlinearity is to be expected from a theory
    of gravity (like general relativity), and its appearance in this simplified scalar
    setting (one of Einstein's precursors to general relativity) leads to significant
    changes in the spectrum of the self-gravitating theory. Using an iterative technique,
    we compare the mass dependence of the ground state energies of both Schrodinger-Newton
    and the new, self-sourced system and find that they are dramatically different.
    The Bohr method approach from old quantization provides a qualitative description of
    the difference, which comes from the additional nonlinearity introduced in the self-sourced
    case. In addition to comparison of ground state energies, we calculate the transition
    energy between the ground state and first excited state to compare emission frequencies
    between Schrodinger-Newton and the self-coupled scalar case.
    `
  },
  {
    link: "http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143",
    imgLink: "assets/cdd-models-pic.jpg",
    title:
      "Open source Bayesian models. 1. Application to ADME/Tox and drug discovery datasets.",
    authors: `Alex M. Clark, Krishna Dole, Anna Coulon-Spektor, Andrew McNutt,
    George Grass, Joel S. Freundlich, Robert C. Reynolds, and Sean Ekins`,
    journal: "Journal of chemical information and modeling. 2015",
    links: [
      {
        name: "paper",
        link: "http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143"
      }
    ],
    abstract: `
    On the order of hundreds of absorption, distribution, metabolism, excretion,
    and toxicity (ADME/Tox) models have been described in the literature in the
    past decade which are more often than not inaccessible to anyone but their authors.
    Public accessibility is also an issue with computational models for bioactivity,
    and the ability to share such models still remains a major challenge limiting drug
    discovery. We describe the creation of a reference implementation of a Bayesian
    model-building software module, which we have released as an open source component
    that is now included in the Chemistry Development Kit (CDK) project, as well as
    implemented in the CDD Vault and in several mobile apps. We use this implementation
    to build an array of Bayesian models for ADME/Tox, in vitro and in vivo bioactivity,
    and other physicochemical properties. We show that these models possess cross-validation
    receiver operator curve values comparable to those generated previously in prior
    publications using alternative tools. We have now described how the implementation
    of Bayesian models with FCFP6 descriptors generated in the CDD Vault enables the
    rapid production of robust machine learning models from public data or the user’s
    own datasets. The current study sets the stage for generating models in proprietary
    software (such as CDD) and exporting these models in a format that could be run in
    open source software using CDK components. This work also demonstrates that we can
    enable biocomputation across distributed private or public datasets to enhance drug discovery.`
  },
  {
    link: "assets/thesis.pdf",
    imgLink: "assets/thesis-pic.jpg",
    title: "Nonequivalent Lagrangian Mechanics",
    authors: "Andrew McNutt (Advised by Nelia Mann)",
    journal: "Undergraduate thesis. Reed College. June 2014.",
    links: [
      { name: "thesis", link: "assets/thesis.pdf" },
      { name: "talk", link: "./assets/nlm-talk.pdf" }
    ],
    abstract: `
    In this thesis we study a modern formalism known as Nonequivalent Lagrangian
    Mechanics, that is constructed on top of the traditional Lagrangian theory of mechanics.
    By making use of the non-uniqueness of the Lagrangian representation of dynamical
    systems, we are able to generate conservation laws in a way that is novel and, in
    many cases much faster than the traditional Noetherian analysis. In every case that
    we examine, these invariants turn out to be Noetherian invariants in disguise. We
    apply this theory to a wide variety of systems including predator-prey dynamics and
    damped driven harmonic motion.`
  }
];

export const PRESENTATIONS = [
  {
    title:
      "Linting for Visualization: Towards a Practical Automated Visualization Guidance System",
    link: "assets/vis-lint-talk.pdf",
    journal: "VisGuides 2018. October 22, 2018"
  },
  {
    title: "Design Patterns For Data Visualization in React",
    link: "http://tinyurl.com/reactvisdesignpatterns",
    journal: "React Chicago. August 29, 2018"
  },
  {
    link: "assets/nlm-talk.pdf",
    title: "Nonequivalent Lagrangian Mechanics",
    journal: "Reed Physics Seminar. April 8, 2014"
  },
  {
    link: "assets/QGravPresentation.pdf",
    title: "The Schrodinger-Newton System with Self-field Coupling",
    authors: "Varchas Gopalaswamy, Andrew McNutt, Allie Morgan, Carl Proepper.",
    journal: "Reed Physics Seminar. September 18, 2013"
  }
];

export const BLOG_POSTS = [
  {
    imgLink: "assets/tarot-image.png",
    title:
      "A Brief Saga Concerning the Making of a Tarot Deck About the American Highway System",
    subtitle: "A little essay about making",
    date: "Personal Blog. December 10, 2018",
    link:
      "https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8",
    links: [
      {
        name: "blog post",
        link:
          "https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8"
      },
      { name: "github", link: "https://github.com/mcnuttandrew/tarot-deck" }
    ]
  },
  {
    imgLink: "assets/advanced-react-vis-pic.png",
    title: "Advanced Visualization with react-vis",
    subtitle:
      "Using Voronois, single pass rendering, and canvas components for amazing user experiences",
    date: "Towards Data Science. May 21, 2018",
    link:
      "https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4",
    links: [
      {
        name: "blog post",
        link:
          "https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4"
      },
      { name: "talk", link: "http://tinyurl.com/reactvisdesignpatterns" },
      {
        name: "code",
        link: "https://github.com/mcnuttandrew/advanced-react-vis-tutorial"
      }
    ]
  }
];

export const PROJECTS = [
  // {
  //   title: 'Chaotic Circuit',
  //   imgLink: 'assets/chaotic-image.png',
  //   link: 'assets/Chaotic_circuit.pdf',
  //   text: `In culminating effort of my junior year at Reed I built a third order
  //   Chaotic circuit as an independent project. This shows some of the best data visualization
  //   work I had done at that point, particularlly the combination phase and signal metering small multiples diagram.`
  // },
  //
  {
    title: "Cycles & Rain / Seasons In Size",
    dates: "July 2019",
    sourceLink: "https://github.com/mcnuttandrew/cycles-rain-seasons-in-size/",
    link: "https://www.mcnutt.in/cycles-rain-seasons-in-size/",
    imgLink: "assets/cycles-in-rain.png",
    text:
      "A little infographic about bicycle ridership in Seattle featuring table cartograms.",
    section: "visualization"
  },
  {
    title: "CSSQL",
    dates: "May 2019",
    sourceLink: "https://github.com/mcnuttandrew/cssql",
    link: "https://www.npmjs.com/package/node-cssql",
    imgLink: "assets/cssql-logo.png",
    text:
      "A new answer to this css-in-js question: css in sql. A sql-ddl to css transpiler written in haskell, available on npm.",
    section: "tech"
  },
  {
    title: "Forum Explorer",
    dates: "April 2019",
    sourceLink: "https://github.com/mcnuttandrew/forum-explorer",
    link: "https://www.mcnutt.in/forum-explorer/",
    imgLink: "assets/forum-ex-pic.png",
    text:
      "A chrome extension and website that allows users to explore threaded conversations using trees.",
    section: "visualization"
  },
  {
    title: "Readability As A Service",
    dates: "November 2018",
    sourceLink: "https://github.com/mcnuttandrew/flesch-kincaid-as-a-service",
    link: "https://www.mcnutt.in/flesch-kincaid-as-a-service/",
    imgLink: "assets/readability.png",
    text: `Have you ever wanted specific numerical quantification on how readable
    your prose is? This micro app wraps the textstat package as a webservice so that you can easily check.`,
    section: "tech"
  },
  {
    title: "tap-react-browser",
    dates: "Feburary - April 2018",
    sourceLink: "https://github.com/mcnuttandrew/tap-react-browser/",
    imgLink: "assets/tap-react-browser.png",
    text: `In the process of building a variety of javascipt libraries in the course of
    my graduate research, I found myself needing a testing tool that played a particular
    role in relation to the browser, so I made one! tap-react-browser is a light
    wrapper on tape that spits out react components.`,
    section: "tech"
  },
  {
    title: "Constellations of Home - XMAS CARDS 2017",
    dates: "December 2017",
    link: "http://www.mcnutt.in/home-graphs/",
    sourceLink: "https://github.com/mcnuttandrew/home-graphs",
    imgLink: "assets/home-graphs.png",
    text: `Over the 2017 holidays I spent some time meditating on memory, home, and
    graph theory, which led to my making these christmas cards.`,
    section: "visualization"
  },
  {
    title: "On The Shape of American Cities I/II",
    dates: "July 2017",
    link: "http://www.mcnutt.in/city-size/",
    sourceLink: "https://github.com/mcnuttandrew/city-size",
    imgLink: "assets/city-size.png",
    text:
      "A print graphic describing the shape of the 100 most populous American cities.",
    section: "visualization"
  },
  {
    title: "Pantone: Color of the year",
    dates: "Updated yearly, starting 2016",
    link: "http://www.mcnutt.in/color-of-the-year/",
    sourceLink: "https://github.com/mcnuttandrew/color-of-the-year",
    imgLink: "assets/color-of-year.png",
    text:
      "A small exploration of the glory and wonder that is pantones color of the year.",
    section: "visualization"
  },
  {
    title: "react-vis",
    dates: "2016 - ",
    link: "http://uber.github.io/react-vis/#/",
    sourceLink: "https://github.com/uber/react-vis",
    imgLink: "assets/react-vis-image.png",
    text: "A charting library for the react ecosystem.",
    section: "visualization"
  },
  {
    title: "CSV Conversion",
    dates: "December 2016",
    link: "http://www.mcnutt.in/csv-conversion/",
    sourceLink: "https://github.com/mcnuttandrew/csv-conversion",
    imgLink: "assets/csv-conversion.png",
    text:
      "A handy client-side csv to json converter. I built this little app, because my favorite conversion site got knocked down and I wanted to improve the UI.",
    section: "tech"
  },
  {
    title: "Personal Timeline",
    dates: "June 2016",
    link: "http://www.mcnutt.in/personal-timeline/",
    sourceLink: "https://github.com/mcnuttandrew/personal-timeline",
    imgLink: "assets/personal-time.png",
    text:
      "A brief timeline of my life, a resume through a dark mirror if you will.",
    section: "visualization"
  },
  {
    title: "Unnamed Tarot Deck",
    dates: "Dec 2015 - June 2016",
    link:
      "https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8",
    sourceLink: "https://github.com/mcnuttandrew/tarot-deck",
    imgLink: "assets/tarot-image.png",
    text:
      "A tarot tech themed around the signage and spirit of the American highway system.",
    section: "art"
  },
  {
    title: "Why Not Ipsum",
    dates: "September 2014",
    link: "http://why-not-ipsum.herokuapp.com/",
    sourceLink: "https://github.com/mcnuttandrew/Why-Not-Zoidberg",
    imgLink: "assets/why-not-image.png",
    text:
      "A Lorem Ipsum generator populated by Zoidberg quotes, built following RESTful design practices. Included a large series of data scrapes, which were necessarily followed by intensive data cleaning.",
    section: "tech"
  },
  {
    title: "N-Hedron",
    dates: "September - December 2013",
    imgLink: "assets/n-hydron.png",
    link: "assets/nhedron.pdf",
    text:
      "An independent college project regarding the effacy of various numerical algorithms for constructing the n-hedron.",
    section: "tech"
  }

  // {
  //   title: 'N-Body Simulator',
  //   link: 'https://mcnuttandrew.github.io/n-body-simulator/',
  //   sourceLink: 'https://github.com/mcnuttandrew/N-Body-Simulator',
  //   imgLink: 'assets/n-body-image.png',
  //   text: 'A low N gravitional interaction simulator built in processing.'
  // },
  // {
  //   title: 'Asteroids',
  //   imgLink: 'assets/asteroids-image.png',
  //   link: 'https://mcnuttandrew.github.io/asteroids/',
  //   sourceLink: 'https://github.com/mcnuttandrew/Asteroids',
  //   text: 'A reimaging of the classic arcade game. Technologies included Javascipt, HTML5 Canvas, and jQuery'
  // }
  // {
  //   title: 'Teacup',
  //   liveLink: 'http://tea-cup.org/',
  //   sourceLink: 'https://github.com/mcnuttandrew/Project-Teacup',
  //   text: 'A microblogging platform for viewing the collective unconscious. Single page Backbone app based on RESTful practices. Features data visualizations including trending topics and user population. Seed data was generated using a variety of large scale data scrapes and data cleaning techniques. Technologies included a Rails API, Backbone.js, jQuery, Nokogiri, and D3.'
  // }
  // {
  //   title: 'Slim Record',
  //   sourceLink: 'https://github.com/mcnuttandrew/Active-Record-Lite',
  //   text: 'An Object Relational Mapper that rebuilds much of the functionality of active record. The point of the project was to get a better comprehension of the underlying mechanisms that we so often take for granted in Rails'
  // },
  // {
  //   title: 'Railsito',
  //   sourceLink: 'https://github.com/mcnuttandrew/railsito',
  //   text: 'An Object Relational Mapper that rebuilds much of the functionality of active record. The point of the project was to get a better comprehension of the underlying mechanisms that we so often take for granted in Rails'
  // }
];

export const NEWS = [
  {
    date: "June 2019",
    content: "Started an internship with Tableau Research in Seattle"
  },
  { date: "June 2019", content: "Successfully defended my masters thesis" },
  {
    date: "May 2019",
    content: "I won the UChicago Department of Computer Science TA Prize."
  },
  {
    date: "May 2019",
    content:
      "My piece 'On The Road To The Lake: Debugging in Tryptic' won second prize in the print media category of the UChicago Art+Science expo."
  }
];
