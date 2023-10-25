type PubType =
  | 'extended abstract / workshop papers'
  | 'theses / book chapters'
  | 'conference / journal articles'
  | 'posters';
type PubSubtype =
  | 'workshop'
  | 'chapter'
  | 'thesis'
  | 'conference'
  | 'journal'
  | 'short conf.'
  | 'poster'
  | 'ex. abs.';

type linkType =
  | 'paper'
  | 'live'
  | 'about'
  | 'talk'
  | 'osf'
  | 'code'
  | 'poster'
  | 'slides'
  | 'blog post'
  | 'award'
  | 'thesis'
  | 'replicability badge'
  | 'zine'
  | 'supplementary materials'
  | 'press';
type Link =
  | `https://${string}`
  | `http://${string}`
  | `#/research/${string}`
  | `assets/${string}`
  | `talks/${string}`;
export interface Publication {
  link?: string;
  urlTitle: string;
  imgLink: string;
  title: string;
  subtitle?: string;
  shortTitle?: string;
  authors: string;
  journal: string;
  date: string;
  links: {name: linkType; link: Link}[];
  abstract: string;
  type: PubType;
  subtype: PubSubtype;
  year: number;
}

export const PUBLICATIONS: Publication[] = [
  {
    link: '',
    urlTitle: 'phd-thesis',
    imgLink: 'converted-images/phd-thesis.jpg',
    title: 'Understanding and Enhancing JSON-based DSL Interfaces for Visualization',
    authors: 'Andrew McNutt (advised by Ravi Chugh)',
    journal: 'Ph.D. Thesis. University of Chicago, Department of Computer Science, 2023',
    date: '',
    year: 2023,
    links: [
      {name: 'paper', link: 'https://osf.io/fy246'},
      {name: 'supplementary materials', link: 'https://osf.io/ywcqa/'}
    ],
    abstract: `Domain-specific languages represented in data serialization formats (such as Javascript Object Notation or JSON) are an increasingly common means to control numerous systems.
These range from database queries to application configuration, narrative generation, Twitter bots, data visualization, and many other areas.
These languages allow potentially unsophisticated human users to concisely specify their intent through logic and notation that is relevant to task domain.
Further, they provide a means for computational agents to easily manipulate that form, allowing for powerful recommendation engines and systems of automated analyses.

In this thesis, we consider how end-user agency might be enhanced and maintained through the design of tools that support these domain-specific languages, as well as through the study of the design of the languages themselves.
In support of this goal, we conducted four interconnected projects which variously study how JSON-based DSLs are designed, how abstraction can be integrated into those languages, how interfaces can be designed to specifically facilitate their manipulation, as well as how those programs might be automatically validated.
Through these projects, we demonstrate that giving primacy to these textual interfaces as design elements can be valuable for end users.
We find that this style of interventions are useful for helping end users learn, use, and re-use programs written in these languages.
We primarily consider languages focused on data visualization tasks, as there has been substantial work in the visualization research community on this form of interface—although the lessons learned could be applied to any relevant domain.`,
    type: 'theses / book chapters',
    subtype: 'thesis'
  },
  {
    link: 'https://arxiv.org/abs/2308.15429',
    urlTitle: 'only-you',
    imgLink: 'converted-images/only-you.jpg',
    title: 'Only YOU Can Make IEEE VIS Environmentally Sustainable',
    authors: 'Elsie Lee-Robbins, Andrew McNutt',
    journal: 'alt.vis 2023',
    date: '',
    year: 2023,
    links: [
      {name: 'paper', link: 'https://arxiv.org/abs/2308.15429'},
      {name: 'talk', link: 'https://www.youtube.com/watch?v=WDp75Puoh24'}
    ],
    abstract: `The IEEE VIS Conference (or VIS) hosts more than 1000 people annually. It brings together visualization researchers and practitioners from across the world to share new research and knowledge. Behind the scenes, a team of volunteers puts together the entire conference and makes sure it runs smoothly. Organizing involves logistics of the conference, ensuring that the attendees have an enjoyable time, allocating rooms to multiple concurrent tracks, and keeping the conference within budget. In recent years, the COVID-19 pandemic has abruptly disrupted plans, forcing organizers to switch to virtual, hybrid, and satellite formats. These alternatives offer many benefits:  fewer costs (e.g., travel, venue, institutional), greater accessibility (who can physically travel, who can get visas, who can get child care), and a lower carbon footprint (as people do not need to fly to attend). As many conferences begin to revert to the pre-pandemic status quo of primarily in-person conferences, we suggest that it is an opportune moment to reflect on the benefits and drawbacks of lower-carbon conference formats. To learn more about the logistics of conference organizing, we talked to 6 senior executive-level VIS organizers. We review some of the many considerations that go into planning, particularly with regard to how they influence decisions about alternative formats.   We aim to start a discussion about the sustainability of VIS---including sustainability for finance, volunteers, and, central to this work, the environment---for the next three years and the next three hundred years. `,
    type: 'extended abstract / workshop papers',
    subtype: 'workshop'
  },
  {
    link: 'https://arxiv.org/abs/2308.16353',
    urlTitle: 'notascope',
    imgLink: 'converted-images/notascope.jpg',
    title: 'Metrics-Based Evaluation and Comparison of Visualization Notations',
    authors: 'Nicolas Kruchten, Andrew McNutt, Michael J. McGuffin',
    journal: 'IEEE VIS 2023',
    date: '',
    year: 2023,
    links: [
      {name: 'live', link: 'https://app.notascope.io/'},
      {name: 'osf', link: 'https://osf.io/8924y/'},
      {name: 'paper', link: 'https://arxiv.org/abs/2308.16353'},
      {
        name: 'blog post',
        link: 'https://medium.com/multiple-views-visualization-research-explained/metrics-for-reasoning-about-the-usability-of-visualization-notations-6c03b9292780'
      }
    ],
    abstract: `A visualization notation is a recurring pattern of symbols used to author specifications of visualizations, from data transformation to visual mapping. Programmatic notations use symbols defined by grammars or domain-specific languages (e.g., ggplot2, dplyr, Vega-Lite) or libraries (e.g., Matplotlib, Pandas).   Designers and prospective users of grammars and libraries often evaluate visualization notations by inspecting galleries of examples.  While such collections demonstrate usage and expressiveness, their construction and evaluation are usually ad hoc, making comparisons of different notations difficult.  More rarely, experts analyze notations via usability heuristics, such as the Cognitive Dimensions of Notations framework. These analyses, akin to structured close readings of text, can reveal design deficiencies, but place a burden on the expert to simultaneously consider many facets of often complex systems.  To alleviate these issues, we introduce a metrics-based approach to usability evaluation and comparison of notations in which metrics are computed for a gallery of examples across a suite of notations.  While applicable to any visualization domain, we explore the utility of our approach via a case study considering statistical graphics that explores 40 visualizations across 9 widely used notations. We facilitate the computation of appropriate metrics and analysis via a new tool called NotaScope.  We gathered feedback via interviews with authors or maintainers of prominent charting libraries (n=6).  We find that this approach is a promising way to formalize, externalize, and extend evaluations and comparisons of visualization notations.`,
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://arxiv.org/abs/2307.11260',
    urlTitle: 'prong',
    imgLink: 'converted-images/prong-logo.jpg',
    title: 'Projectional Editors for JSON-Based DSLs',
    authors: 'Andrew McNutt, Ravi Chugh',
    journal: 'VL/HCC 2023',
    date: '',
    year: 2023,
    links: [
      {name: 'live', link: 'https://prong-editor.netlify.app/'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/prong'},
      {name: 'paper', link: 'https://arxiv.org/abs/2307.11260'}
    ],
    abstract: `Augmenting text-based programming with rich structured interactions has been explored in many ways. Among these, projectional editors offer an enticing combination of structure editing and domain-specific program visualization. Yet such tools are typically bespoke and expensive to produce, leaving them inaccessible to many DSL and application designers.

We describe a relatively inexpensive way to build rich projectional editors for a large class of DSLs -- namely, those defined using JSON. Given any such JSON-based DSL, we derive a projectional editor through (i) a language-agnostic mapping from JSON Schemas to structure-editor GUIs and (ii) an API for application designers to implement custom views for the domain-specific types described in a schema. We implement these ideas in a prototype, Prong, which we illustrate with several examples including the Vega and Vega-Lite data visualization DSLs.`,
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://osf.io/3jrcm/',
    urlTitle: 'doom-n-fruit',
    imgLink: 'converted-images/doom-n-fruit.jpg',
    title:
      'Doom or Deliciousness: Challenges and Opportunities for Visualization in the Age of Generative Models',
    authors:
      'Victor Schetinger, Sara Di Bartolomeo, Mennatallah El-Assady, Andrew McNutt, Matthias Miller, João Paulo Apolinário Passos, Jane L. Adams',
    journal: 'EuroVis 2023',
    date: '',
    year: 2023,
    links: [{name: 'paper', link: 'https://osf.io/3jrcm/'}],
    abstract: `Generative text-to-image models (as exemplified by DALL-E, MidJourney, and Stable Diffusion) have recently made enormous technological leaps, demonstrating impressive results in many graphical domains---from logo design to digital painting and photographic composition. However, the quality of these results has led to existential crises in some fields of art, leading to questions about the role of human agency in the production of meaning in a graphical context. Such issues are central to visualization, and while these generative models have yet to be widely applied to visualization, it seems only a matter of time until their integration is manifest. Seeking to circumvent similar ponderous dilemmas, we attempt to understand the roles that generative models might play across visualization. We do so by constructing a framework that characterizes what these technologies offer at various stages of the visualization workflow, augmented and analyzed through semi-structured interviews with 19 experts from related domains. Through this work, we map the space of opportunities and risks that might arise in this intersection, identifying doomsday prophecies and delicious low-hanging fruits that are ripe for research.`,
    type: 'conference / journal articles',
    subtype: 'journal'
  },
  {
    link: 'https://arxiv.org/abs/2301.11178',
    urlTitle: 'ai-4-notebooks',
    imgLink: 'converted-images/meta-cells-image.jpg',
    title: 'On the Design of AI-powered Code Assistants for Notebooks',
    authors: 'Andrew McNutt, Chenglong Wang, Rob DeLine, Steven M. Drucker',
    journal: 'ACM CHI 2023',
    date: '',
    links: [{name: 'paper', link: 'https://arxiv.org/abs/2301.11178'}],
    abstract: `AI-powered code assistants, such as Copilot, are quickly becoming a ubiquitous component of contemporary coding contexts. Among these environments, computational notebooks, such as Jupyter, are of particular interest as they provide rich interface affordances that interleave code and output in a manner that allows for both exploratory and presentational work. Despite their popularity, little is known about the appropriate design of code assistants in notebooks. We investigate the potential of code assistants in computational notebooks by creating a design space (reified from a survey of extant tools) and through an interview-design study (with 15 practicing data scientists). Through this work, we identify challenges and opportunities for future systems in this space, such as the value of disambiguation for tasks like data visualization, the potential of tightly scoped domain-specific tools (like linters), and the importance of polite assistants.`,
    year: 2023,
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://arxiv.org/pdf/2301.13302',
    urlTitle: 'sauce',
    imgLink: 'converted-images/sauce-image.jpg',
    title: 'A Study of Editor Features in a Creative Coding Classroom',
    authors: 'Andrew McNutt, Anton Outkine, Ravi Chugh',
    journal: 'ACM CHI 2023',
    year: 2023,
    date: '',
    links: [
      {name: 'paper', link: 'https://arxiv.org/pdf/2301.13302'},
      {name: 'live', link: 'http://cs111.org/'}
    ],
    abstract:
      'Creative coding is a rapidly expanding domain for both artistic expression and computational education. Numerous libraries and IDEs support creative coding, however there has been little consideration of how the environments themselves might be designed to serve these twin goals. To investigate this gap, we implemented and used an experimental editor to teach a sequence of college and high-school creative coding courses. In the first year, we conducted a log analysis of student work (n=39) and surveys regarding prospective features (n=25). These guided our implementation of common enhancements (e.g. color pickers) as well as uncommon ones (e.g. bidirectional shape editing). In the second year, we studied the effects of these features through logging (n=39+) and survey (n=23) studies. Reflecting on the results, we identify opportunities to improve creativity- and novice-focused IDEs and highlight tensions in their design (as in tools that augment artistry or efficiency but may hinder learning).',
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://arxiv.org/abs/2207.07998',
    urlTitle: 'no-grammar',
    imgLink: 'converted-images/no-grammar.jpg',
    title: 'No Grammar to Rule Them All: A Survey of JSON-Style DSLs for Visualization',
    authors: 'Andrew McNutt',
    year: 2022,
    journal: 'IEEE VIS 2022',
    date: '',
    links: [
      {name: 'paper', link: 'https://arxiv.org/abs/2207.07998'},
      {name: 'live', link: 'https://vis-json-dsls.netlify.app/'},
      {name: 'talk', link: 'https://youtu.be/GMy2QCE-y7o?t=3783'},
      {
        name: 'replicability badge',
        link: 'http://www.replicabilitystamp.org/#https-github-com-mcnuttandrew-no-grammar-supplement'
      },
      {
        name: 'press',
        link: 'https://mcorrell.medium.com/visualization-in-the-wild-a-trip-report-from-vis-2022-c42311b95f28'
      }
    ],
    abstract:
      'There has been substantial growth in the use of JSON-based grammars, as well as other standard data serialization languages, to create visualizations. Each of these grammars serves a purpose: some focus on particular computational tasks (such as animation), some are concerned with certain chart types (such as maps), and some target specific data domains (such as ML). Despite the prominence of this interface form, there has been little detailed analysis of the characteristics of these languages.  In this study, we survey and analyze the design and implementation of 57 JSON-style DSLs for visualization. We analyze these languages supported by a collected corpus of examples for each DSL (consisting of 4395 instances) across a variety of axes organized into concerns related to domain, conceptual model, language relationships, affordances, and general practicalities. We identify tensions throughout these areas, such as between formal and colloquial specifications, among types of users, and within the composition of languages. Through this work, we seek to support language implementers by elucidating the choices, opportunities, and tradeoffs in visualization DSL design.',
    type: 'conference / journal articles',
    subtype: 'journal'
  },
  {
    link: 'https://link.springer.com/article/10.1007/s12064-022-00376-8',
    urlTitle: 'goethe-candolle',
    imgLink: 'converted-images/goethe-candolle.jpg',
    title: 'Goethe and Candolle: National forms of scientific writing?',
    authors: 'Agatha Seo-Hyun Kim, Andrew McNutt ',
    journal: 'Theory in Biosciences',
    year: 2022,
    date: 'August 2022',
    links: [{name: 'paper', link: 'https://link.springer.com/article/10.1007/s12064-022-00376-8'}],
    abstract:
      'What role does nationality—or the image of a nation—play in how one thinks and receives scientific ideas? This paper investigates the commonly held ideas about “German science” and “French science” in early nineteenth-century France. During the politically turbulent time, the seemingly independent scientific community found itself in a difficult position: first, between the cosmopolitan ideals of scientific community and the invasive political reality, and second, between the popularized image of national differences and the actual comparisons of international scientific ideas. The tension between multiple sets of fictions and realities underscores the fragility of the concept of nationality as a scientific measure. A case study comparing morphological ideas, receptions in France, and the actual scientific texts of J. W. von Goethe and A. P. de Candolle further illustrates this fragility. Goethe and Candolle make an ideal comparative case because they were received in very different lights despite their similar concept of the plant type. Our sentence-classification and visualization methods are applied to their scientific texts, to compare the actual compositions and forms of the texts that purportedly represented German and French sciences. This paper concludes that there was a gap between what French readers assumed they read and what they really read, when it came to foreign scientific texts. The differences between Goethe’s and Candolle’s texts transcended the perceived national differences between German Romanticism and French Classicism.',
    type: 'conference / journal articles',
    subtype: 'journal'
  },
  {
    link: 'https://www.blaseur.com/papers/rationales-naacl22.pdf',
    urlTitle: 'explaining-why',
    imgLink: 'converted-images/explaining-why.jpg',
    title:
      'Explaining Why: How Instructions and User Interfaces Impact Annotator Rationales When Labeling Text Data',
    authors:
      'Jamar L. Sullivan, Will Brackenbury, Andrew McNutt, Kevin Bryson, Kwam Byll, Yuxin Chen, Michael Littman, Chenhao Tan, Blase Ur',
    journal: 'NAACL 2022',
    date: '',
    year: 2022,
    links: [
      {name: 'paper', link: 'https://www.blaseur.com/papers/rationales-naacl22.pdf'},
      {
        name: 'replicability badge',
        link: 'https://naacl2022-reproducibility-track.github.io/results/'
      },
      {
        name: 'code',
        link: 'https://github.com/UChicagoSUPERgroup/rationales-naacl22'
      }
    ],
    abstract:
      'In the context of data labeling, NLP researchers are increasingly interested in having humans select _rationales_, a subset of input tokens relevant to the chosen label. We conducted a 332-participant online user study to understand how humans select rationales, especially how different instructions and user interface affordances impact the rationales chosen. Participants labeled ten movie reviews as positive or negative, selecting words and phrases supporting their label as rationales. We varied the instructions given, the rationale-selection task, and the user interface. Participants often selected about 12% of input tokens as rationales, but selected fewer if unable to drag over multiple tokens at once. Whereas participants were near unanimous in their data labels, they were far less consistent in their rationales. The user interface affordances and task greatly impacted the types of rationales chosen. We also observed large variance across participants.',
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://arxiv.org/abs/2109.06007',
    urlTitle: 'vis-4-villainy',
    imgLink: 'converted-images/villainy.jpg',
    title: 'Visualization for Villainy',
    authors: 'Andrew McNutt, Lilian Huang, Kathryn Koenig',
    journal: 'alt.vis 2021',
    date: '',
    links: [
      {name: 'paper', link: 'https://arxiv.org/abs/2109.06007'},
      {name: 'talk', link: 'https://youtu.be/jFbsYto_2ys?t=1471'}
    ],
    year: 2021,
    abstract:
      'Visualization has long been seen as a dependable and trustworthy tool for carrying out analysis and communication tasks -- a view reinforced by the growing interest in applying it to socially positive ends. However, despite the benign light in which visualization is usually perceived, it carries the potential to do harm to people, places, concepts, and things. In this paper, we capitalize on this negative potential to serve an underrepresented (but technologically engaged) group: villains. To achieve these ends, we introduce a design space for this type of graphical violence, which allows us to unify prior work on deceptive visualization with novel data-driven dastardly deeds, such as emotional spear phishing and unsafe data physicalization. By charting this vile charting landscape, we open new doors to collaboration with terrifying domain experts, and hopefully, make the world just a bit worse.',
    type: 'extended abstract / workshop papers',
    subtype: 'workshop'
  },
  {
    link: 'https://www.blaseur.com/papers/uist21-kondocloud.pdf',
    urlTitle: 'kondoCloud',
    imgLink: 'converted-images/kondo.jpg',
    title:
      'KondoCloud: Improving Information Management in Cloud Storage via Recommendations Based on File Similarity',
    authors: 'Will Brackenbury, Andrew McNutt, Kyle Chard, Aaron Elmore, Blase Ur',
    journal: 'ACM UIST 2021',
    year: 2021,
    date: '',
    links: [
      {name: 'paper', link: 'https://www.blaseur.com/papers/uist21-kondocloud.pdf'},
      {name: 'code', link: 'https://github.com/wbrackenbury/KondoCloud'}
    ],
    abstract:
      "Users face many challenges in keeping their personal file collections organized. While current file-management interfaces help users retrieve files in disorganized repositories, they do not aid in organization. Pertinent files can be difficult to find, and files that should have been deleted may remain. To help, we designed KondoCloud, a file-browser interface for personal cloud storage. KondoCloud makes machine learning-based recommendations of files users may want to retrieve, move, or delete. These recommendations leverage the intuition that similar files should be managed similarly.<br/><br/>We developed and evaluated KondoCloud through two complementary online user studies. In our Observation Study, we logged the actions of 69 participants who spent 30 minutes manually organizing their own Google Drive repositories. We identified high-level organizational strategies, including moving related files to newly created sub-folders and extensively deleting files. To train the classifiers that underpin KondoCloud's recommendations, we had participants label whether pairs of files were similar and whether they should be managed similarly. In addition, we extracted ten metadata and content features from all files in participants' repositories. Our logistic regression classifiers all achieved F1 scores of 0.72 or higher. In our Evaluation Study, 62 participants used KondoCloud either with or without recommendations. Roughly half of participants accepted a non-trivial fraction of recommendations, and some participants accepted nearly all of them. Participants who were shown the recommendations were more likely to delete related files located in different directories. They also generally felt the recommendations improved efficiency. Participants who were not shown recommendations nonetheless manually performed about a third of the actions that would have been recommended.",
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://www.mcnutt.in/zine-potential',
    urlTitle: '',
    shortTitle: 'zine-potential',
    imgLink: 'converted-images/zine-potential.jpg',
    title: 'On The Potential of Zines as a Medium for Visualization',
    authors: 'Andrew McNutt',
    year: 2021,
    journal: 'IEEE VIS 2021 (Short Papers)',
    date: '',
    links: [
      {name: 'about', link: 'https://www.mcnutt.in/zine-potential'},
      {name: 'paper', link: 'https://arxiv.org/abs/2108.02177'},
      {name: 'talk', link: 'https://youtu.be/khhlIrowR_g'}
    ],
    abstract:
      'Zines are a form of small-circulation self-produced publication often akin to a magazine. This free-form medium has a long history and has been used as means for personal or intimate expression, as a way for marginalized people to describe issues that are important to them, and as a venue for graphical experimentation. It would seem then that zines would make an ideal vehicle for the recent interest in applying feminist or humanist ideas to visualization. Yet, there has been little work combining visualization and zines. In this paper we explore the potential of this intersection by analyzing examples of zines that use data graphics and by describing the pedagogical value that they can have in a visualization classroom. In doing so, we argue that there are plentiful opportunities for visualization research and practice in this rich intersectional-medium.',
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://arxiv.org/abs/2104.04042',
    urlTitle: 'tacos',
    imgLink: 'converted-images/tacos.jpg',
    title: 'What are Table Cartograms Good for Anyway? An Algebraic Analysis',
    authors: 'Andrew McNutt',
    journal: 'EuroVis 2021 🏆 Honorable Mention for Best Paper 🏆 (Juried Selection, 1 awarded)',
    date: '',
    year: 2021,
    links: [
      {name: 'about', link: '#/research/tacos'},
      {name: 'paper', link: 'https://arxiv.org/abs/2104.04042'},
      {name: 'talk', link: 'https://www.youtube.com/watch?v=ozBn5bLsGQw&t=2594s'}
    ],
    abstract: `Unfamiliar or esoteric visual forms arise in many areas of visualization. While such forms can be intriguing, it can be unclear how to make effective use of them without long periods of practice or costly user studies. In this work we analyze the table cartogram—a graphic which visualizes tabular data by bringing the areas of a grid of quadrilaterals into correspondence with the input data, like a heat map that has been *area-ed* rather than colored. Despite having existed for several years, little is known about its appropriate usage. We mend this gap by using Algebraic Visualization Design to show that they are best suited to relatively small tables with ordinal axes for some comparison and outlier identification tasks. In doing so we demonstrate a discount theory-based analysis that can be used to cheaply determine best practices for unknown visualizations.
    `,
    type: 'conference / journal articles',
    subtype: 'journal'
  },
  {
    link: 'https://arxiv.org/abs/2101.07902',
    urlTitle: 'ivy',
    imgLink: 'converted-images/ivy.jpg',
    title: 'Integrated Visualization Editing via Parameterized Declarative Templates',
    authors: 'Andrew McNutt, Ravi Chugh',
    // journal: 'Proceedings of the 2021 ACM annual conference on Human Factors in Computing Systems',
    journal: 'ACM CHI 2021',
    date: '',
    year: 2021,
    links: [
      {name: 'about', link: '#/research/ivy'},
      {name: 'live', link: 'https://github.com/mcnuttandrew/ivy'},
      {name: 'paper', link: 'https://arxiv.org/abs/2101.07902'},
      {name: 'osf', link: 'https://osf.io/cture/'},
      {name: 'talk', link: 'https://www.youtube.com/watch?v=FzIdVnSi9Po'}
    ],
    abstract: `
Interfaces for creating visualizations typically embrace one of several common forms. Textual specification enables fine-grained control, shelf building facilitates rapid exploration, while chart choosing promotes immediacy and simplicity. Ideally these approaches could be unified to integrate the user- and usage-dependent benefits found in each modality, yet these forms remain distinct.

<br />
We propose parameterized declarative templates, a simple abstraction mechanism over JSON-based visualization grammars, as a foundation for multimodal visualization editors. We demonstrate how templates can facilitate organization and reuse by factoring the more than 160 charts that constitute Vega-Lite's example gallery into approximately 40 templates. We exemplify the pliability of abstracting over charting grammars by implementing—as a template—the functionality of the shelf builder Polestar (a simulacra of Tableau) and a set of templates that emulate the Google Sheets chart chooser. We show how templates support multimodal visualization editing by implementing a prototype and evaluating it through an approachability study.`,
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://arxiv.org/abs/2009.02384',
    urlTitle: 'nearby',
    imgLink: 'converted-images/nearby-preview.jpg',
    year: 2020,
    title:
      'Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading',
    authors: 'Andrew McNutt, Agatha Seo-Hyun Kim, Sergio Elahi, Kazutaka Takahashi',
    journal: 'Visualization for the Digital Humanities (VIS4DH) 2020',
    date: '',
    links: [
      {name: 'about', link: '#/research/nearby'},
      {name: 'paper', link: 'https://arxiv.org/abs/2009.02384'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/sci-text-compare'},
      {name: 'live', link: 'https://goetheanddecandolle.rcc.uchicago.edu/'}
    ],
    abstract:
      'Distant reading methodologies make use of computational processes to aid in the analysis of large text corpora which might not be pliable to traditional methods of scholarly analysis due to their volume. While these methods have been applied effectively to a variety of types of texts and contexts, they can leave unaddressed the needs of scholars in the humanities disciplines like history, who often engage in close reading of sources. Complementing the close analysis of texts with some of the tools of distant reading, such as visualization, can resolve some of the issues. We focus on a particular category of this intersection—which we refer to as near-by reading—wherein an expert engages in a computer-mediated analysis of a text with which they are familiar. We provide an example of this approach by developing a visual analysis application for the near-by reading of 19th-century scientific writings by J. W. von Goethe and A. P. de Candolle. We show that even the most formal and public texts, such as scientific treatises, can reveal unexpressed personal biases and philosophies that the authors themselves might not have recognized.',
    type: 'extended abstract / workshop papers',
    subtype: 'workshop'
  },
  {
    link: 'https://www.mcnutt.in/table-cartogram/',
    urlTitle: 'table-cartogram',
    imgLink: 'converted-images/tc-preview.jpg',
    title: 'A Minimally Constrained Optimization Algorithm for Table Cartograms',
    authors: 'Andrew McNutt, Gordon Kindlmann',
    year: 2020,
    journal:
      'VIS 2020 - InfoVIS Poster Track 🏆 Honorable Mention for Best Poster Research 🏆 (Juried Selection, 2 awarded)',
    date: '',
    links: [
      {name: 'about', link: '#/research/table-cartogram'},
      {name: 'paper', link: 'https://osf.io/kem6j/'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/table-cartogram'},
      {name: 'poster', link: 'assets/table-cartogram-poster.pdf'},
      {name: 'live', link: 'https://www.mcnutt.in/table-cartogram/'}
    ],
    abstract:
      'Table cartograms are a recent type of data visualization that encodes numerical tabular data as a grid of quadrilaterals whose area are brought into correspondence with the input data. The overall effect is similar to that of a heat map that has been ‘area-ed‘ rather than shaded. There exist several algorithms for creating these structures—variously utilizing techniques such as computational geometry and numerical optimization —yet each of them impose aesthetically-motivated conditions that impede fine tuning or manipulation of the visual aesthetic of the output. In this work we contribute an optimization algorithm for creating table cartograms that is able to compute a variety of table cartograms layouts for a single dataset. We make our web-ready implementation available as table-cartogram.ts',
    type: 'posters',
    subtype: 'poster'
  },
  {
    link: 'https://arxiv.org/abs/2001.02316',
    urlTitle: 'mirage',
    imgLink: 'converted-images/surfacing-visualization-mirages.jpg',
    title: 'Surfacing Visualization Mirages',
    authors: 'Andrew McNutt, Gordon Kindlmann, Michael Correll',
    year: 2020,
    // journal:
    //   'Proceedings of the 2020 ACM annual conference on Human Factors in Computing Systems <br/> 🏆 Honorable Mention for Best Paper 🏆 (Top 5% of papers)',
    journal: 'ACM CHI 2020 🏆 Honorable Mention for Best Paper 🏆 (Top 5% of papers)',
    date: '',
    links: [
      {name: 'about', link: '#/research/mirage'},
      {
        name: 'blog post',
        link: 'https://medium.com/multiple-views-visualization-research-explained/surfacing-visualization-mirages-8d39e547e38c'
      },
      {name: 'paper', link: 'https://arxiv.org/abs/2001.02316'},
      {name: 'live', link: 'https://metamorphic-linting.netlify.com/'},
      {name: 'code', link: 'https://github.com/tableau/Visualization-Linting'},
      {name: 'osf', link: 'https://osf.io/je3x9'},
      {name: 'slides', link: 'talks/mirage-talk.pdf'},
      {name: 'talk', link: 'https://www.youtube.com/watch?v=arHbVFbq-mQ'}
    ],
    abstract:
      'Dirty data and deceptive design practices can undermine, invert, or invalidate the purported messages of charts and graphs. These failures can arise silently: a conclusion derived from a particular visualization may look plausible unless the analyst looks closer and discovers an issue with the backing data, visual specification, or their own assumptions. We term such silent but significant failures visualization mirages. We describe a conceptual model of mirages and show how they can be generated at every stage of the visual analytics process. We adapt a methodology from software testing, metamorphic testing, as a way of automatically surfacing potential mirages at the visual encoding stage of analysis through modifications to the underlying data and chart specification. We show that metamorphic testing can reliably identify mirages across a variety of chart types with relatively little prior knowledge of the data or the domain.',
    type: 'conference / journal articles',
    subtype: 'conference'
  },
  {
    link: 'https://www.tableau.com/sites/default/files/2023-01/altchi-tarot-cameraready.pdf',
    imgLink: 'converted-images/vis-tarot.jpg',
    urlTitle: 'tarot',
    title: 'Divining Insights: Visual Analytics Through Cartomancy',
    authors: 'Andrew McNutt, Anamaria Crisan, Michael Correll',
    journal: 'alt.CHI 2020',
    year: 2020,
    date: '',
    links: [
      {name: 'about', link: '#/research/tarot'},
      {
        name: 'paper',
        link: 'https://www.tableau.com/sites/default/files/2023-01/altchi-tarot-cameraready.pdf'
      },
      {name: 'live', link: 'https://vis-tarot.netlify.com/'},
      {name: 'code', link: 'https://github.com/mcorrell/vis-tarot'},
      {name: 'slides', link: 'talks/tarot-talk.pdf'},
      {name: 'talk', link: 'https://www.youtube.com/watch?v=fRA42BjyG_Q'}
    ],
    abstract:
      'Our interactions with data, visual analytics included, are increasingly shaped by automated or algorithmic systems. An open question is how to give analysts the tools to interpret these “automatic insights” while also inculcating critical engagement with algorithmic analysis. We present a system, Sortilège, that uses the metaphor of a Tarot card reading to provide an overview of automatically detected patterns in data in a way that is meant to encourage critique, reflection, and healthy skepticism.',
    type: 'extended abstract / workshop papers',
    subtype: 'ex. abs.'
  },
  {
    link: 'https://www.mcnutt.in/ms-zine/',
    imgLink: 'converted-images/ms-thesis.jpg',
    title:
      'Design and Analysis of Table Cartograms: Simultaneous Multipurpose Tabular Area-encoding Displays',
    urlTitle: 'ms-thesis',
    authors: 'Andrew McNutt (Advised by Gordon Kindlmann)',
    journal: 'Masters thesis. University of Chicago',
    date: 'June 2014',
    year: 2014,
    links: [{name: 'zine', link: 'https://www.mcnutt.in/ms-zine/'}],
    abstract: '',
    type: 'theses / book chapters',
    subtype: 'thesis'
  },
  {
    imgLink: 'converted-images/agathas-thing.jpg',
    urlTitle: 'goethe-poster',
    title: 'Textual Analysis & Comparison National Forms of Scientific Texts: Goethe + de Candolle',
    authors: 'Agatha Seo-Hyun Kim, Andrew McNutt, Sergio Elahi, Kazutaka Takahashi, Robert J Richards',
    journal: 'MindBytes Research Symposium 2019. 🏆 Best Poster in Visualization 🏆',
    year: 2019,
    date: '',
    links: [
      {name: 'poster', link: 'assets/posterkim102519.pdf'},
      // {name: 'live', link: 'https://goetheanddecandolle.rcc.uchicago.edu/'},
      {
        name: 'award',
        link: 'https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research'
      }
    ],
    abstract:
      "When the 19th-century European scientists were evaluating each other's ideas, they frequently validated their opinions by referring to the nationality of a given scientist as an explanatory type. Is there such a thing as 'national science'? This project examines widely-held ideas about the German and French styles of science in early 19th-century France. During this politically volatile period scientists found themselves in a difficult position. Between the aggressive political reality and the ideals of the cosmopolitan scientific community; as well as between the popularized image of national differences and the actual comparisons of the scientific ideas across national borders. As a case study, Goethe's and Candolle's botanical ideas, their receptions in France, and their actual texts are compared. We contrast these texts in detail through several types of interactive visualizations.",
    type: 'posters',
    subtype: 'poster'
  },
  {
    link: 'https://diglib.eg.org/xmlui/bitstream/handle/10.2312/eurp20191144/053-055.pdf',
    imgLink: 'converted-images/forested-tree-view-example.jpg',
    title:
      'Improving the Scalability of Interactive Visualization Systems for Exploring Threaded Conversations',
    authors: 'Andrew McNutt, Gordon Kindlmann',
    urlTitle: 'forum-explorer-eurovis',
    year: 2019,
    // journal: 'Proceedings of the Eurographics Conference on Visualization "EuroVis" - Posters',
    journal: 'EuroVis 2019 (Posters)',
    date: '',
    links: [
      {name: 'paper', link: 'https://diglib.eg.org/xmlui/bitstream/handle/10.2312/eurp20191144/053-055.pdf'},
      {name: 'poster', link: 'assets/forum-explorer-poster.pdf'},
      {name: 'live', link: 'https://www.mcnutt.in/forum-explorer/'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/forum-explorer'},
      {name: 'osf', link: 'https://osf.io/nrhqw/'},
      {
        name: 'award',
        link: 'https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research'
      }
    ],
    abstract:
      'Large threaded conversations, such as those found on YCombinator’s HackerNews, are typically presented in a way that shows individual comments clearly, but can obscure larger trends or patterns within the conversational corpus. Previous research has addressed this problem through graphical-overviews and NLP-generated summaries. These efforts have generally assumed a particular (and modest) data size, which limits their utility for large or deeply-nested conversations, and often require non-trivial offline processing time, which makes them impractical for day-to-day usage. We describe here Forum Explorer, a Chrome extension that combines and expands upon prior art through a collection of techniques that enable this type of representation to handle wider ranges of data in real time. Materials for this project are available at https://osf.io/nrhqw/.',
    type: 'posters',
    subtype: 'poster'
  },
  {
    link: 'assets/McNutt_Kindlmann_2018.pdf',
    imgLink: 'converted-images/lint-pic.jpg',
    urlTitle: 'linting-visguides',
    title: 'Linting for Visualization: Towards a Practical Automated Visualization Guidance System',
    authors: 'Andrew McNutt, Gordon Kindlmann',
    year: 2018,
    journal:
      'IEEE VIS Workshop on Creation, Curation, Critique and Conditioning of Principles and Guidelines in Visualization (VisGuides 2018)',
    date: '',
    links: [
      {name: 'paper', link: 'assets/McNutt_Kindlmann_2018.pdf'},
      {name: 'code', link: 'https://github.com/mcnuttandrew/vislint_mpl'},
      {name: 'slides', link: 'talks/vis-lint-talk.pdf'}
    ],
    abstract:
      ' Constructing effective charts and graphs in a scientific setting is a nuanced task that requires a thorough understanding of visualization design; a knowledge that may not be available to all practicing scientists. Previous attempts to address this problem have pushed chart creators to pore over large collections of guidelines and heuristics, or to relegate their entire workflow to end-to-end tools that provide automated recommendations. In this paper we bring together these two strains of ideas by introducing the use of lint as a mechanism for guiding chart creators towards effective visualizations in a manner that can be configured to taste and task without forcing users to abandon their usual workflows. The programmatic evaluation model of visualization linting (or vis lint) offers a compelling framework for the automation of visualization guidelines, as it offers unambiguous feedback during the chart creation process, and can execute analyses derived from machine vision and natural language processing. We demonstrate the feasibility of this system through the production of vislint_mpl, a prototype visualization linting system, that evaluates charts created in matplotlib.',
    type: 'extended abstract / workshop papers',
    subtype: 'workshop'
  },
  {
    link: 'https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14',
    imgLink: 'converted-images/cdd-pic.jpg',
    urlTitle: 'reporter-assays',
    title: 'Data Mining and Computational Modeling of High-Throughput Screening Datasets',
    authors: `Sean Ekins, Alex M. Clark, Krishna Dole, Kellan Gregory, Andrew McNutt,
    Anna Coulon Spektor, Charlie Weatherall, Nadia K Litterman, Barry A Bunin`,
    journal: 'Reporter Gene Assays',
    year: 2018,
    date: '2018',
    links: [{name: 'paper', link: 'https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14'}],
    abstract:
      'We are now seeing the benefit of investments made over the last decade in high-throughput screening (HTS) that is resulting in large structure activity datasets entering public and open databases such as ChEMBL and PubChem. The growth of academic HTS screening centers and the increasing move to academia for early stage drug discovery suggests a great need for the informatics tools and methods to mine such data and learn from it. Collaborative Drug Discovery, Inc. (CDD) has developed a number of tools for storing, mining, securely and selectively sharing, as well as learning from such HTS data. We present a new web based data mining and visualization module directly within the CDD Vault platform for high-throughput drug discovery data that makes use of a novel technology stack following modern reactive design principles. We also describe CDD Models within the CDD Vault platform that enables researchers to share models, share predictions from models, and create models from distributed, heterogeneous data. Our system is built on top of the Collaborative Drug Discovery Vault Activity and Registration data repository ecosystem which allows users to manipulate and visualize thousands of molecules in real time. This can be performed in any browser on any platform. In this chapter we present examples of its use with public datasets in CDD Vault. Such approaches can complement other cheminformatics tools, whether open source or commercial, in providing approaches for data mining and modeling of HTS data.',
    type: 'theses / book chapters',
    subtype: 'chapter'
  },
  {
    link: 'https://arxiv.org/abs/1501.07537',
    imgLink: 'converted-images/qgrav-pic.jpg',
    title: 'The Schrodinger-Newton System with Self-field Coupling',
    authors: 'Joel Franklin, Youdan Guo, Andrew McNutt, Allison Morgan',
    urlTitle: 'qgrav',
    journal: 'Journal of Classical and Quantum Gravity',
    year: 2015,
    date: '2015',
    links: [
      {name: 'paper', link: 'https://arxiv.org/abs/1501.07537'},
      {name: 'slides', link: 'assets/QGravPresentation.pdf'}
    ],
    abstract:
      "We study the Schrodinger-Newton system of equations with the addition of gravitational field energy sourcing - such additional nonlinearity is to be expected from a theory of gravity (like general relativity), and its appearance in this simplified scalar setting (one of Einstein's precursors to general relativity) leads to significant changes in the spectrum of the self-gravitating theory. Using an iterative technique, we compare the mass dependence of the ground state energies of both Schrodinger-Newton and the new, self-sourced system and find that they are dramatically different. The Bohr method approach from old quantization provides a qualitative description of the difference, which comes from the additional nonlinearity introduced in the self-sourced case. In addition to comparison of ground state energies, we calculate the transition energy between the ground state and first excited state to compare emission frequencies between Schrodinger-Newton and the self-coupled scalar case.",
    type: 'conference / journal articles',
    subtype: 'journal'
  },
  {
    link: 'http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143',
    imgLink: 'converted-images/cdd-models-pic.jpg',
    title: 'Open source Bayesian models. 1. Application to ADME/Tox and drug discovery datasets',
    urlTitle: 'bayes-models',
    authors: `Alex M. Clark, Krishna Dole, Anna Coulon-Spektor, Andrew McNutt,
    George Grass, Joel S. Freundlich, Robert C. Reynolds, Sean Ekins`,
    journal: 'Journal of Chemical Information and Modeling',
    date: '2015',
    year: 2015,
    links: [{name: 'paper', link: 'http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143'}],
    abstract:
      'On the order of hundreds of absorption, distribution, metabolism, excretion, and toxicity (ADME/Tox) models have been described in the literature in the past decade which are more often than not inaccessible to anyone but their authors. Public accessibility is also an issue with computational models for bioactivity, and the ability to share such models still remains a major challenge limiting drug discovery. We describe the creation of a reference implementation of a Bayesian model-building software module, which we have released as an open source component that is now included in the Chemistry Development Kit (CDK) project, as well as implemented in the CDD Vault and in several mobile apps. We use this implementation to build an array of Bayesian models for ADME/Tox, in vitro and in vivo bioactivity, and other physicochemical properties. We show that these models possess cross-validation receiver operator curve values comparable to those generated previously in prior publications using alternative tools. We have now described how the implementation of Bayesian models with FCFP6 descriptors generated in the CDD Vault enables the rapid production of robust machine learning models from public data or the user’s own datasets. The current study sets the stage for generating models in proprietary software (such as CDD) and exporting these models in a format that could be run in open source software using CDK components. This work also demonstrates that we can enable biocomputation across distributed private or public datasets to enhance drug discovery.',
    type: 'conference / journal articles',
    subtype: 'journal'
  },
  {
    link: 'assets/thesis.pdf',
    imgLink: 'converted-images/thesis-pic.jpg',
    title: 'Nonequivalent Lagrangian Mechanics',
    urlTitle: 'nonequiv',
    authors: 'Andrew McNutt (Advised by Nelia Mann)',
    journal: 'Undergraduate thesis. Reed College',
    date: 'June 2014',
    year: 2014,
    links: [
      {name: 'thesis', link: 'assets/thesis.pdf'},
      {name: 'slides', link: 'assets/nlm-talk.pdf'}
    ],
    abstract:
      'In this thesis we study a modern formalism known as Nonequivalent Lagrangian Mechanics, that is constructed on top of the traditional Lagrangian theory of mechanics. By making use of the non-uniqueness of the Lagrangian representation of dynamical systems, we are able to generate conservation laws in a way that is novel and, in many cases much faster than the traditional Noetherian analysis. In every case that we examine, these invariants turn out to be Noetherian invariants in disguise. We apply this theory to a wide variety of systems including predator-prey dynamics and damped driven harmonic motion.',
    type: 'theses / book chapters',
    subtype: 'thesis'
  }
];
