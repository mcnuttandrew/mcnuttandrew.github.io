/* eslint-disable max-len */

export const skills = [
  {
    title: 'PERSONAL',
    content: 'information design, physics, arts',
  },
  {
    title: 'WEB DEV',
    content:
      'd3, react, flux/redux, node, backbone, processing, jquery, ruby, ruby on rails, python, flask, sketch',
  },
  {
    title: 'SCI-COM',
    content: 'mathematica, grid mathematica, numpy, pandaz',
  },
];

export const COLLABORATOR_LINKS = {
  'Agatha Kim': 'https://history.uchicago.edu/directory/agatha-kim',
  'Alex M. Clark': 'https://scholar.google.com/citations?user=4Gv4PboAAAAJ&hl=en',
  'Allison Morgan': 'https://allisonmorgan.github.io/',
  'Anamaria Crisan': 'https://amcrisan.github.io/',
  'Gordon Kindlmann': 'http://people.cs.uchicago.edu/~glk/',
  'Joel Franklin': 'http://people.reed.edu/~jfrankli/',
  'Krishna Dole': 'https://scholar.google.com/citations?user=J4TpF1YAAAAJ&hl=en',
  'Michael Correll': 'https://correll.io/',
  'Nelia Mann': 'https://www.union.edu/physics-and-astronomy/faculty-staff/nelia-mann',
  'Ravi Chugh': 'http://people.cs.uchicago.edu/~rchugh/',
  'Sean Ekins': 'https://scholar.google.com/citations?user=6NNfXAMAAAAJ&hl=en',
  'Varchas Gopalaswamy': 'https://scholar.google.com/citations?user=PxH1Z7kAAAAJ&hl=en',
};

export const PUBLICATIONS = [
  {
    link: '',
    urlTitle: 'tacos',
    imgLink: 'converted-images/tacos.jpg',
    title: 'What are Table Cartograms Good for Anyway? An Algebraic Analysis',
    authors: 'Andrew McNutt',
    journal:
      "Computer Graphics Forum (Proceedings of the Eurographics/IEEE-VGTC Conference on Visualization 'EuroVis')",
    date: 'June 2021',
    type: 'Journal',
    links: [
      {name: 'about', link: '#/research/tacos'},
      {name: 'preprint', link: 'https://arxiv.org/pdf/2104.04042.pdf'},
    ],
    abstract: `Unfamiliar or esoteric visual forms arise in many areas of visualization. While such forms can be intriguing, it can be unclear how to make effective use of them without long periods of practice or costly user studies. In this work we analyze the table cartogram—a graphic which visualizes tabular data by bringing the areas of a grid of quadrilaterals into correspondence with the input data, like a heat map that has been *area-ed* rather than colored. Despite having existed for several years, little is known about its appropriate usage. We mend this gap by using Algebraic Visualization Design to show that they are best suited to relatively small tables with ordinal axes for some comparison and outlier identification tasks. In doing so we demonstrate a discount theory-based analysis that can be used to cheaply determine best practices for unknown visualizations.
    `,
    type: 'conference / journal articles',
  },
  {
    link: '',
    urlTitle: 'ivy',
    imgLink: 'converted-images/ivy.jpg',
    title: 'Integrated Visualization Editing via Parameterized Declarative Templates',
    authors: 'Andrew McNutt, Ravi Chugh',
    journal: 'Proceedings of the 2021 ACM annual conference on Human Factors in Computing Systems',
    date: 'May 2021',
    links: [
      {name: 'about', link: '#/research/ivy'},
      {name: 'live', link: 'https://github.com/mcnuttandrew/ivy'},
      {name: 'preprint', link: 'https://arxiv.org/pdf/2101.07902.pdf'},
      {name: 'osf', link: 'https://osf.io/cture/'},
    ],
    abstract: `
Interfaces for creating visualizations typically embrace one of several common forms. Textual specification enables fine-grained control, shelf building facilitates rapid exploration, while chart choosing promotes immediacy and simplicity. Ideally these approaches could be unified to integrate the user- and usage-dependent benefits found in each modality, yet these forms remain distinct.

<br />
We propose parameterized declarative templates, a simple abstraction mechanism over JSON-based visualization grammars, as a foundation for multimodal visualization editors. We demonstrate how templates can facilitate organization and reuse by factoring the more than 160 charts that constitute Vega-Lite's example gallery into approximately 40 templates. We exemplify the pliability of abstracting over charting grammars by implementing—as a template—the functionality of the shelf builder Polestar (a simulacra of Tableau) and a set of templates that emulate the Google Sheets chart chooser. We show how templates support multimodal visualization editing by implementing a prototype and evaluating it through an approachability study.`,
    bibTex: `TODO`,
    type: 'conference / journal articles',
  },
  {
    link: '',
    urlTitle: 'nearby',
    imgLink: 'converted-images/nearby-preview.jpg',
    title:
      'Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading',
    authors: 'Andrew McNutt, Agatha Kim, Sergio Elahi, Kazutaka Takahashi',
    journal: '2020 IEEE 5th Workshop on Visualization for the Digital Humanities (VIS4DH)',
    date: 'October 2020',
    links: [
      {name: 'about', link: '#/research/nearby'},
      {name: 'preprint', link: 'https://arxiv.org/pdf/2009.02384.pdf'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/sci-text-compare'},
      {name: 'live', link: 'https://goetheanddecandolle.rcc.uchicago.edu/'},
    ],
    abstract: `
Distant reading methodologies make use of computational processes to aid in the analysis of large text corpora which might not be pliable to traditional methods of scholarly analysis due to their volume. While these methods have been applied effectively to a variety of types of texts and contexts, they can leave unaddressed the needs of scholars in the humanities disciplines like history, who often engage in close reading of sources. Complementing the close analysis of texts with some of the tools of distant reading, such as visualization, can resolve some of the issues. We focus on a particular category of this intersection—which we refer to as near-by reading—wherein an expert engages in a computer-mediated analysis of a text with which they are familiar. We provide an example of this approach by developing a visual analysis application for the near-by reading of 19th-century scientific writings by J. W. von Goethe and A. P. de Candolle. We show that even the most formal and public texts, such as scientific treatises, can reveal unexpressed personal biases and philosophies that the authors themselves might not have recognized.
    `,
    bibTex: `TODO`,
    type: 'extended abstract / workshop papers',
  },
  {
    link: '',
    urlTitle: 'table-cartogram',
    imgLink: 'converted-images/tc-preview.jpg',
    title: 'A Minimally Constrained Optimization Algorithm for Table Cartograms',
    authors: 'Andrew McNutt, Gordon Kindlmann',
    journal: 'VIS 2020 - InfoVIS Poster Track - 🏆 Honorable Mention for Best Poster Research 🏆',
    date: 'October 2020',
    links: [
      {name: 'about', link: '#/research/table-cartogram'},
      {name: 'preprint', link: 'https://osf.io/kem6j/'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/table-cartogram'},
      {name: 'poster', link: './assets/table-cartogram-poster.pdf'},
      {name: 'live', link: 'https://www.mcnutt.in/table-cartogram/'},
    ],
    abstract: `
Table cartograms are a recent type of data visualization that encodes numerical tabular data as a grid of quadrilaterals whose area areb rought into correspondence with the input data. The overall effect is similar to that of a heat map that has been ‘area-ed‘ rather than shaded. There exist several algorithms for creating these structures—variously utilizing techniques such as computational geometry and numerical optimization —yet each of them impose aesthetically-motivated conditions that impede fine tuning or manipulation of the visual aesthetic of the output. In this work we contribute an optimization algorithm for creating table cartograms that is able to compute a variety of table cartograms layouts for a single dataset. We make our web-ready implementation available as table-cartogram.ts
    `,
    bibTex: `TODO`,
    type: 'posters',
  },
  {
    link: 'https://arxiv.org/pdf/2001.02316.pdf',
    urlTitle: 'mirage',
    imgLink: 'converted-images/surfacing-visualization-mirages.jpg',
    title: 'Surfacing Visualization Mirages',
    authors: 'Andrew McNutt, Gordon Kindlmann, Michael Correll',
    journal:
      'Proceedings of the 2020 ACM annual conference on Human Factors in Computing Systems - 🏆 Honorable Mention for Best Paper 🏆',
    date: 'April 2020',
    links: [
      {name: 'about', link: '#/research/mirage'},
      {
        name: 'blog post',
        link:
          'https://medium.com/multiple-views-visualization-research-explained/surfacing-visualization-mirages-8d39e547e38c',
      },
      {name: 'preprint', link: 'https://arxiv.org/pdf/2001.02316.pdf'},
      {name: 'live', link: 'https://metamorphic-linting.netlify.com/'},
      {name: 'code', link: 'https://github.com/tableau/Visualization-Linting'},
      {name: 'osf', link: 'https://osf.io/je3x9'},
      {name: 'slides', link: './talks/mirage-talk.pdf'},
      {name: 'talk', link: 'https://www.youtube.com/watch?v=arHbVFbq-mQ'},
    ],
    abstract: `
Dirty data and deceptive design practices can undermine, invert, or invalidate the purported messages of charts and graphs.
These failures can arise silently: a conclusion derived from
a particular visualization may look plausible unless the analyst looks closer and discovers an issue with the backing
data, visual specification, or their own assumptions. We term
such silent but significant failures visualization mirages. We
describe a conceptual model of mirages and show how they
can be generated at every stage of the visual analytics process.
We adapt a methodology from software testing, metamorphic
testing, as a way of automatically surfacing potential mirages
at the visual encoding stage of analysis through modifications
to the underlying data and chart specification. We show that
metamorphic testing can reliably identify mirages across a
variety of chart types with relatively little prior knowledge of
the data or the domain.
    `,
    bibTex: `TODO`,
    type: 'conference / journal articles',
  },
  {
    link: 'assets/altchi-tarot-cameraready.pdf',
    imgLink: 'converted-images/vis-tarot.jpg',
    urlTitle: 'tarot',
    title: 'Divining Insights: Visual Analytics Through Cartomancy',
    authors: 'Andrew McNutt, Anamaria Crisan, Michael Correll',
    journal: 'Proceedings of alt.CHI',
    date: 'April 2020',
    links: [
      {name: 'about', link: '#/research/tarot'},
      {name: 'preprint', link: 'assets/altchi-tarot-cameraready.pdf'},
      {name: 'live', link: 'https://vis-tarot.netlify.com/'},
      {name: 'code', link: 'https://github.com/mcorrell/vis-tarot'},
      {name: 'slides', link: './talks/tarot-talk.pdf'},
      {name: 'talk', link: 'https://www.youtube.com/watch?v=fRA42BjyG_Q'},
    ],
    abstract: `
Our interactions with data, visual analytics included, are increasingly shaped by automated or algorithmic systems. An
open question is how to give analysts the tools to interpret
these “automatic insights” while also inculcating critical engagement with algorithmic analysis. We present a system,
Sortilège, that uses the metaphor of a Tarot card reading to
provide an overview of automatically detected patterns in
data in a way that is meant to encourage critique, reflection,
and healthy skepticism.
    `,
    bibTex: `TODO`,
    type: 'extended abstract / workshop papers',
  },
  {
    imgLink: 'converted-images/agathas-thing.jpg',
    title: 'Textual Analysis & Comparison National Forms of Scientific Texts: Goethe + de Candolle',
    authors: 'Agatha Kim, Andrew McNutt, Sergio Elahi, Kazutaka Takahashi, Robert J Richards',
    journal: 'MindBytes Research Symposium. 🏆 Best Poster in Visualization 🏆',
    date: 'November 2019',
    links: [
      {name: 'poster', link: 'assets/posterkim102519.pdf'},
      // {name: 'live', link: 'https://goetheanddecandolle.rcc.uchicago.edu/'},
      {
        name: 'award',
        link:
          'https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research',
      },
    ],
    abstract: `
    When the 19th-century European scientists were evaluating each other's ideas, they frequently validated their opinions by referring to the nationality of a given scientist as an explanatory type. Is there such a thing as â€œnational scienceâ€? This project examines widely-held ideas about the German and French styles of science in early 19th-century France. During this politically volatile period scientists found themselves in a difficult position. Between the aggressive political reality and the ideals of the cosmopolitan scientific community; as well as between the popularized image of national differences and the actual comparisons of the scientific ideas across national borders. As a case study, Goethe's and Candolle's botanical ideas, their receptions in France, and their actual texts are compared. We contrast these texts in detail through several types of interactive visualizations.
    `,
    type: 'posters',
  },
  // link to award: https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research
  {
    link: 'assets/forum-explorer-paper.pdf',
    imgLink: 'converted-images/forested-tree-view-example.jpg',
    title:
      'Improving the Scalability of Interactive Visualization Systems for Exploring Threaded Conversations',
    authors: 'Andrew McNutt, Gordon Kindlmann',
    urlTitle: 'forum-explorer-eurovis',
    journal: 'Proceedings of the Eurographics Conference on Visualization "EuroVis" - Posters',
    date: 'June 2019',
    links: [
      {name: 'paper', link: 'assets/forum-explorer-paper.pdf'},
      {name: 'poster', link: 'assets/forum-explorer-poster.pdf'},
      {name: 'live', link: 'https://www.mcnutt.in/forum-explorer/'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/forum-explorer'},
      {name: 'osf', link: 'https://osf.io/nrhqw/'},
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
    }`,
    type: 'posters',
  },
  {
    link: 'assets/McNutt_Kindlmann_2018.pdf',
    imgLink: 'converted-images/lint-pic.jpg',
    urlTitle: 'linting-visguides',
    title: 'Linting for Visualization: Towards a Practical Automated Visualization Guidance System',
    authors: 'Andrew McNutt, Gordon Kindlmann',
    journal:
      '2nd IEEE VIS Workshop on Creation, Curation, Critique and Conditioning of Principles and Guidelines in Visualization ("VisGuides")',
    date: 'October 2018',
    links: [
      {name: 'paper', link: 'assets/McNutt_Kindlmann_2018.pdf'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/vislint_mpl'},
      {name: 'slides', link: 'talks/vis-lint-talk.pdf'},
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
    `,
    type: 'extended abstract / workshop papers',
  },
  {
    link: 'https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14',
    imgLink: 'converted-images/cdd-pic.jpg',
    urlTitle: 'reporter-assays',
    title: 'Data Mining and Computational Modeling of High-Throughput Screening Datasets',
    authors: `Sean Ekins, Alex M. Clark, Krishna Dole, Kellan Gregory, Andrew McNutt,
    Anna Coulon Spektor, Charlie Weatherall, Nadia K Litterman, Barry A Bunin`,
    journal: 'Reporter Gene Assays',
    date: '2018',
    links: [{name: 'paper', link: 'https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14'}],
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
    `,
    type: 'theses / book chapters',
  },
  {
    link: 'https://arxiv.org/abs/1501.07537',
    imgLink: 'converted-images/qgrav-pic.jpg',
    title: 'The Schrodinger-Newton System with Self-field Coupling',
    authors: 'Joel Franklin, Youdan Guo, Andrew McNutt, Allison Morgan',
    urlTitle: 'qgrav',
    journal: 'Journal of Classical and Quantum Gravity',
    date: '2015',
    links: [
      {name: 'paper', link: 'https://arxiv.org/abs/1501.07537'},
      {name: 'slides', link: 'assets/QGravPresentation.pdf'},
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
    `,
    type: 'conference / journal articles',
  },
  {
    link: 'http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143',
    imgLink: 'converted-images/cdd-models-pic.jpg',
    title: 'Open source Bayesian models. 1. Application to ADME/Tox and drug discovery datasets.',
    urlTitle: 'bayes-models',
    authors: `Alex M. Clark, Krishna Dole, Anna Coulon-Spektor, Andrew McNutt,
    George Grass, Joel S. Freundlich, Robert C. Reynolds, and Sean Ekins`,
    journal: 'Journal of Chemical Information and Modeling',
    date: '2015',
    links: [{name: 'paper', link: 'http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143'}],
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
    enable biocomputation across distributed private or public datasets to enhance drug discovery.`,
    type: 'conference / journal articles',
  },
  {
    link: 'assets/thesis.pdf',
    imgLink: 'converted-images/thesis-pic.jpg',
    title: 'Nonequivalent Lagrangian Mechanics',
    urlTitle: 'nonequiv',
    authors: 'Andrew McNutt (Advised by Nelia Mann)',
    journal: 'Undergraduate thesis. Reed College',
    date: 'June 2014',
    links: [
      {name: 'thesis', link: 'assets/thesis.pdf'},
      {name: 'slides', link: './assets/nlm-talk.pdf'},
    ],
    abstract: `
    In this thesis we study a modern formalism known as Nonequivalent Lagrangian
    Mechanics, that is constructed on top of the traditional Lagrangian theory of mechanics.
    By making use of the non-uniqueness of the Lagrangian representation of dynamical
    systems, we are able to generate conservation laws in a way that is novel and, in
    many cases much faster than the traditional Noetherian analysis. In every case that
    we examine, these invariants turn out to be Noetherian invariants in disguise. We
    apply this theory to a wide variety of systems including predator-prey dynamics and
    damped driven harmonic motion.`,
    type: 'theses / book chapters',
  },
];

export const PRESENTATIONS = [
  // {
  //   title:
  //     'Linting for Visualization: Towards a Practical Automated Visualization Guidance System',
  //   link: 'assets/vis-lint-talk.pdf',
  //   journal: 'VisGuides 2018. October 22, 2018'
  // },
  {
    imgLink: 'converted-images/design-patterns-pic.jpg',
    title: 'Design Patterns For Data Visualization in React',
    link: 'http://tinyurl.com/reactvisdesignpatterns',
    journal: 'React Chicago. August 29, 2018',
    subtitle: 'An overview of four useful patterns for developing visualizations in react',
    links: [{name: 'slides', link: 'http://tinyurl.com/reactvisdesignpatterns'}],
  },
  // {
  //   link: 'assets/nlm-talk.pdf',
  //   title: 'Nonequivalent Lagrangian Mechanics',
  //   journal: 'Reed Physics Seminar. April 8, 2014'
  // },
  // {
  // link: 'assets/QGravPresentation.pdf',
  // links: [],
  // title: 'The Schrodinger-Newton System with Self-field Coupling',
  // authors: 'Varchas Gopalaswamy, Andrew McNutt, Allie Morgan, Carl Proepper.',
  // journal: 'Reed Physics Seminar. September 18, 2013'
  // }
];

export const BLOG_POSTS = [
  {
    imgLink: 'converted-images/tarot-image.jpg',
    title: 'A Brief Saga Concerning the Making of a Tarot Deck About the American Highway System',
    subtitle: 'A little essay about making',
    date: 'Personal Blog. December 10, 2018',
    link:
      'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
    links: [
      {
        name: 'blog post',
        link:
          'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
      },
      {name: 'github', link: 'https://github.com/mcnuttandrew/tarot-deck'},
    ],
  },
  {
    imgLink: 'converted-images/advanced-react-vis-pic.jpg',
    title: 'Advanced Visualization with react-vis',
    subtitle: 'Using Voronois, single pass rendering, and canvas components for amazing user experiences',
    date: 'Towards Data Science. May 21, 2018',
    link: 'https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4',
    links: [
      {
        name: 'blog post',
        link: 'https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4',
      },
      // {name: 'talk', link: 'http://tinyurl.com/reactvisdesignpatterns'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/advanced-react-vis-tutorial'},
    ],
  },
];

export const PROJECTS = [
  // {
  //   title: 'Chaotic Circuit',
  //   imgLink: 'converted-images/chaotic-image.jpg',
  //   link: 'assets/Chaotic_circuit.pdf',
  //   text: `In culminating effort of my junior year at Reed I built a third order
  //   Chaotic circuit as an independent project. This shows some of the best data visualization
  //   work I had done at that point, particularlly the combination phase and signal metering small multiples diagram.`
  // },
  //
  {
    title: 'Ivy',
    dates: 'November 2019 - August 2020',
    sourceLink: 'https://github.com/mcnuttandrew/ivy',
    link: 'http://ivy-vis.netlify.app/',
    imgLink: 'converted-images/ivy.jpg',
    text: 'A meta-level approach to visual analytics.',
    tags: ['visualization', 'tech'],
  },
  {
    title: 'table-cartogram.ts',
    dates: 'September 2020',
    sourceLink: 'https://github.com/mcnuttandrew/table-cartogram',
    link: 'https://www.mcnutt.in/table-cartogram/',
    imgLink: 'converted-images/taco-ts.jpg',
    text: 'A library for constructing table cartograms in the browser.',
    tags: ['visualization', 'tech'],
  },
  {
    title: 'Sortilège',
    dates: 'January 2020',
    sourceLink: 'https://github.com/vis-tarot/vis-tarot',
    link: 'https://vis-tarot.github.io/vis-tarot/',
    imgLink: 'converted-images/vis-tarot-back.jpg',
    text:
      'A tarot based visual analytics system. It guides users analytics process via the divine hands of fate.',
    tags: ['visualization'],
  },
  {
    title: '"How to read an academic paper" zine',
    dates: 'February 2021',
    link: 'http://www.mcnutt.in/paper-zine/',
    sourceLink: 'https://github.com/mcnuttandrew/paper-zine',
    imgLink: 'http://www.mcnutt.in/paper-zine/cover.png',
    text: 'A non-definitive guide to paper reading.',
    tags: ['art'],
  },

  {
    title: 'Data is Plural Search',
    dates: 'May 2020',
    sourceLink: 'https://github.com/mcnuttandrew/data-is-plural-search',
    link: 'https://data-is-plural-search.netlify.app/',
    imgLink: 'converted-images/data-is-plural.jpg',
    text: 'A simple web view for the data is plural news letter by Singer-Vine.',
    tags: ['tech'],
  },

  {
    title: 'Cycles & Rain / Seasons In Size',
    dates: 'July 2019',
    sourceLink: 'https://github.com/mcnuttandrew/cycles-rain-seasons-in-size/',
    link: 'https://www.mcnutt.in/cycles-rain-seasons-in-size/',
    imgLink: 'converted-images/cycles-in-rain.jpg',
    text: 'A little infographic about bicycle ridership in Seattle featuring table cartograms.',
    tags: ['visualization', 'art'],
  },
  {
    title: 'CSSQL',
    dates: 'May 2019',
    sourceLink: 'https://github.com/mcnuttandrew/cssql',
    link: 'https://www.npmjs.com/package/node-cssql',
    imgLink: 'converted-images/cssql-logo.jpg',
    text:
      'A new answer to this css-in-js question: css in sql. A sql-ddl to css transpiler written in haskell, available on npm.',
    tags: ['tech'],
  },
  {
    title: 'Forum Explorer',
    dates: 'April 2019',
    sourceLink: 'https://github.com/mcnuttandrew/forum-explorer',
    link: 'https://www.mcnutt.in/forum-explorer/',
    imgLink: 'converted-images/forum-ex-pic.jpg',
    text: 'A chrome extension and website that allows users to explore threaded conversations using trees.',
    tags: ['visualization', 'tech'],
  },
  {
    title: 'Readability As A Service',
    dates: 'November 2018',
    sourceLink: 'https://github.com/mcnuttandrew/flesch-kincaid-as-a-service',
    link: 'https://www.mcnutt.in/flesch-kincaid-as-a-service/',
    imgLink: 'converted-images/readability.jpg',
    text: `Have you ever wanted specific numerical quantification on how readable
    your prose is? This micro app wraps the textstat package as a webservice so that you can easily check.`,
    tags: ['tech'],
  },
  {
    title: 'tap-react-browser',
    dates: 'Feburary - April 2018',
    sourceLink: 'https://github.com/mcnuttandrew/tap-react-browser/',
    imgLink: 'converted-images/tap-react-browser.jpg',
    text: `In the process of building a variety of javascipt libraries in the course of
    my graduate research, I found myself needing a testing tool that played a particular
    role in relation to the browser, so I made one! tap-react-browser is a light
    wrapper on tape that spits out react components.`,
    tags: ['tech'],
  },
  {
    title: 'Constellations of Home - XMAS CARDS 2017',
    dates: 'December 2017',
    link: 'http://www.mcnutt.in/home-graphs/',
    sourceLink: 'https://github.com/mcnuttandrew/home-graphs',
    imgLink: 'converted-images/home-graphs.jpg',
    text: `Over the 2017 holidays I spent some time meditating on memory, home, and
    graph theory, which led to my making these christmas cards.`,
    tags: ['visualization', 'art'],
  },
  {
    title: 'On The Shape of American Cities I/II',
    dates: 'July 2017',
    link: 'http://www.mcnutt.in/city-size/',
    sourceLink: 'https://github.com/mcnuttandrew/city-size',
    imgLink: 'converted-images/city-size.jpg',
    text: 'A print graphic describing the shape of the 100 most populous American cities.',
    tags: ['visualization', 'art'],
  },
  {
    title: 'Pantone: Color of the year',
    dates: 'Updated yearly, starting 2016',
    link: 'http://www.mcnutt.in/color-of-the-year/',
    sourceLink: 'https://github.com/mcnuttandrew/color-of-the-year',
    imgLink: 'converted-images/color-of-year.jpg',
    text: 'A small exploration of the glory and wonder that is pantones color of the year.',
    tags: ['visualization'],
  },
  {
    title: 'react-vis',
    dates: '2016 - 2019',
    link: 'http://uber.github.io/react-vis/#/',
    sourceLink: 'https://github.com/uber/react-vis',
    imgLink: 'converted-images/react-vis-image.jpg',
    text: 'A charting library for the react ecosystem.',
    tags: ['visualization', 'tech'],
  },
  {
    title: 'CSV Conversion',
    dates: 'December 2016',
    link: 'http://www.mcnutt.in/csv-conversion/',
    sourceLink: 'https://github.com/mcnuttandrew/csv-conversion',
    imgLink: 'converted-images/csv-conversion.jpg',
    text:
      'A handy client-side csv to json converter. I built this little app, because my favorite conversion site got knocked down and I wanted to improve the UI.',
    tags: ['tech'],
  },
  {
    title: 'Personal Timeline',
    dates: 'June 2016',
    link: 'http://www.mcnutt.in/personal-timeline/',
    sourceLink: 'https://github.com/mcnuttandrew/personal-timeline',
    imgLink: 'converted-images/personal-time.jpg',
    text: 'A brief timeline of my life, a resume through a dark mirror if you will.',
    tags: ['visualization'],
  },
  {
    title: 'Unnamed Tarot Deck',
    dates: 'Dec 2015 - June 2016',
    link:
      'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
    sourceLink: 'https://github.com/mcnuttandrew/tarot-deck',
    imgLink: 'converted-images/tarot-image.jpg',
    text: 'A tarot tech themed around the signage and spirit of the American highway system.',
    tags: ['art'],
  },
  {
    title: 'Why Not Ipsum',
    dates: 'September 2014',
    link: 'http://why-not-ipsum.herokuapp.com/',
    sourceLink: 'https://github.com/mcnuttandrew/Why-Not-Zoidberg',
    imgLink: 'converted-images/why-not-image.jpg',
    text:
      'A Lorem Ipsum generator populated by Zoidberg quotes, built following RESTful design practices. Included a large series of data scrapes, which were necessarily followed by intensive data cleaning.',
    tags: ['tech'],
  },
  // {
  //   title: 'N-Hedron',
  //   dates: 'September - December 2013',
  //   imgLink: 'converted-images/n-hydron.jpg',
  //   link: 'converted-images/nhedron.pdf',
  //   text:
  //     'An independent college project regarding the effacy of various numerical algorithms for constructing the n-hedron.',
  //   tags: ['tech'],
  // },

  // {
  //   title: 'N-Body Simulator',
  //   link: 'https://mcnuttandrew.github.io/n-body-simulator/',
  //   sourceLink: 'https://github.com/mcnuttandrew/N-Body-Simulator',
  //   imgLink: 'converted-images/n-body-image.jpg',
  //   text: 'A low N gravitional interaction simulator built in processing.'
  // },
  // {
  //   title: 'Teacup',
  //   liveLink: 'http://tea-cup.org/',
  //   sourceLink: 'https://github.com/mcnuttandrew/Project-Teacup',
  //   text: 'A microblogging platform for viewing the collective unconscious. Single page Backbone app based on RESTful practices. Features data visualizations including trending topics and user population. Seed data was generated using a variety of large scale data scrapes and data cleaning techniques. Technologies included a Rails API, Backbone.js, jQuery, Nokogiri, and D3.'
  // }
];

export const TEACHING = [
  {
    title: 'CAPP 30239 - Data Visualization For Public Policy',
    date: 'Winter 2021',
    role: 'Instructor',
    location: 'UChicago',
    link: 'https://capp-30239-winter-2021.netlify.com/',
  },
  {
    title: 'CMSC 11111 - Creative Coding',
    date: 'Winter 2021',
    role: 'Teaching Assistant',
    location: 'UChicago',
    link: 'https://www.classes.cs.uchicago.edu/archive/2021/spring/11111-1/',
  },
  {
    title: 'CAPP 30239 - Data Visualization For Public Policy',
    date: 'Winter 2020',
    role: 'Instructor',
    location: 'UChicago',
    link: 'https://capp-30239-winter-2020.netlify.com/',
  },
  {
    title: 'Visualization Research Reading Group',
    date: 'February 2019-Present',
    role: 'Other',
    location: 'UChicago',
    fancyTitle: 'Director',
    link: 'https://uchicago-vis-pl-lab.github.io/vis-reading-group/',
  },
  {
    title: 'CMSC 23900 - Data Visualization',
    date: 'Spring 2020',
    role: 'Instructor',
    location: 'UChicago',
  },
  {
    title: 'CMSC 23900 - Data Visualization',
    date: 'Spring 2019',
    role: 'Teaching Assistant',
    location: 'UChicago',
    link: 'http://people.cs.uchicago.edu/~glk/class/datavis19/',
  },
  {
    title: 'CAPP 30239 - Data Visualization For Public Policy',
    date: 'Winter 2019',
    role: 'Teaching Assistant',
    location: 'UChicago',
    link: 'https://twitter.com/AlexCEngler/status/1101245224733605891?s=20',
  },
  {
    title: 'CAPP 30121 - Computer Science with Applications 1',
    date: 'Fall 2018',
    role: 'Teaching Assistant',
    location: 'UChicago',
    link: 'https://classes.cs.uchicago.edu/archive/2018/fall/30121-1/',
  },
  {
    title: 'CMSC 23900 - Data Visualization',
    date: 'Spring 2018',
    role: 'Teaching Assistant',
    location: 'UChicago',
    link: 'http://people.cs.uchicago.edu/~glk/class/datavis18/',
  },
  {
    title: 'CMSC 15100 - Introduction to Computer Science 1',
    date: 'Winter 2018',
    role: 'Teaching Assistant',
    location: 'UChicago',
    link: 'https://www.classes.cs.uchicago.edu/archive/2018/winter/15100-1/syllabus.html',
  },
  {
    title: 'CMSC 12100 - Computer Science with Applications 1.',
    date: 'Fall 2017',
    role: 'Teaching Assistant',
    location: 'UChicago',
    link: 'https://www.classes.cs.uchicago.edu/archive/2017/fall/12100-1/',
  },
  {
    title: 'Uberversity Speaker',
    date: '2016-2017',
    role: 'Instructor',
    fancyTitle: 'Lecturer',
    location: 'Uber',
  },
  {
    title: 'Visualization Eng-ucation',
    date: '2015-2017',
    role: 'Instructor',
    fancyTitle: 'Lecturer',
    location: 'Uber',
  },
  {
    title: 'Physics 101 - General Physics I',
    date: '2012',
    role: 'Teaching Assistant',
    location: 'Reed College',
  },
  {
    title: 'F.L. Griffin Mathfest',
    date: '2014',
    role: 'Teaching Assistant',
    location: 'Reed College',
  },
];

export const NEWS = [
  {
    date: 'March 2021',
    content:
      'My paper ["What are Table Cartograms Good for Anyway? An Algebraic Analysis"](https://www.mcnutt.in/#/research/tacos) was accepted to EuroVIS 2021! 🌮🌮🌮🌮',
  },
  {
    date: 'January 2021',
    content:
      'Our paper 🌱["Integrated Visualization Editing via Parameterized Declarative Templates"](https://www.mcnutt.in/#/research/ivy) was accepted to CHI 2021.',
  },
  {
    date: 'October 2020',
    content:
      '["A Minimally Constrained Optimization Algorithm for Table Cartograms"](https://osf.io/kem6j/) won a 🏆honorable mention🏆 in the IEEEVIS InfoVis poster track.',
  },
  {
    date: 'Sept 2020',
    content:
      'Our paper ["Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading"](https://arxiv.org/pdf/2009.02384.pdf) on mixing close and distant reading for 19th century scientific writing was accepted to [VIS4DH20](http://www.vis4dh.org/).',
  },
  {
    date: 'March 2020',
    content:
      'Our paper ["Surfacing Visualization Mirages"](https://www.mcnutt.in/#/research/mirage) won a 🏆best paper honorable mention🏆 at CHI2020!!',
  },
  {
    date: 'Feburary 2020',
    content:
      'Our paper on using tarot for visual analytics "Divining Insights: Visual Analytics Through Cartomancy" was accepted to alt.chi 2020',
  },
  {
    date: 'January 2020',
    content:
      'Started teaching my first class as the instructor of record! ("Data Visualization for Public Policy")',
  },
  {
    date: 'December 2019',
    content: 'Received my Masters of Computer Science!!',
  },
  {
    date: 'November 2019',
    content:
      'Our poster on using graph visualizations to compare 19th century scentific writing was shown at both MindBytes (where it won best poster!) and the 2019 Chicago Colloquium on Digital Humanities.',
  },
  {
    date: 'October 2019',
    content:
      'Had a great time at IEEEVIS 2019 in Vancouver, BC! Helped contribute to the [Open Access Vis](http://oavis.org/) efforts for the conference.',
  },
  {
    date: 'Sept 2019',
    content:
      'Two of my vis projects (ForumExplorer and Cycles in Rain) were Long-Listed at the Kantar Information is Beautiful Awards.',
  },
  {
    date: 'June 2019',
    content: 'Started an internship with Tableau Research in Seattle',
  },
  {
    date: 'June 2019',
    content: '🎉🎉🎉 Successfully defended my masters thesis 🎉🎉🎉',
  },
  {
    date: 'May 2019',
    content:
      'Presented our [poster on ForumExplorer](https://www.mcnutt.in/forum-explorer/) at EuroVis 2019 in Porto, Portugal.',
  },
  {
    date: 'May 2019',
    content:
      'I was awarded the UChicago Department of Computer Science TA Prize for my work TAing Spring 2018 - Winter 2019.',
  },
  {
    date: 'May 2019',
    content:
      "My piece 'On The Road To The Lake: Debugging in Tryptic' won second prize in the print media category of the UChicago Art+Science expo.",
  },
  {
    date: 'October 2018',
    content:
      'Presented our paper on linting charts created in matplotlib at VisGuides, a IEEEVIS 2018 workshop. ',
  },
  // {
  //   date: 'September 2018',
  //   content: 'Started my second year of grad school!'
  // }
];
