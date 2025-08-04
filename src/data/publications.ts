type PubType =
  | "extended abstract / workshop papers"
  | "theses / book chapters"
  | "conference / journal articles"
  | "posters";
type PubSubtype =
  | "workshop"
  | "chapter"
  | "thesis"
  | "conference"
  | "preprint"
  | "journal"
  | "short conf."
  | "poster"
  | "ex. abs.";

type linkType =
  | "paper"
  | "live"
  | "about"
  | "talk"
  | "osf"
  | "code"
  | "poster"
  | "video figure"
  | "studies"
  | "slides"
  | "blog post"
  | "award"
  | "thesis"
  | "replicability badge"
  | "zine"
  | "materials"
  | "press";
type Link =
  | `https://${string}`
  | `http://${string}`
  | `#/research/${string}`
  | `assets/${string}`
  | `talks/${string}`;
export interface Publication {
  link: string;
  urlTitle: string;
  imgLink: string;
  title: string;
  subtitle?: string;
  shortTitle?: string;
  authors: string;
  journal: string;
  links: { name: linkType; link: Link }[];
  abstract: string;
  type: PubType;
  subtype: PubSubtype;
  year: number;
  topics: string[];
  theme:
    | "programming-interfaces"
    | "vis-correctness"
    | "creative-coding"
    | "critical-perspectives"
    | "NA";
}

export const PUBLICATIONS: Publication[] = [
  {
    link: "",
    urlTitle: "revisit-2",
    imgLink: "assets/revisit-py.jpg",
    title: "ReVISit 2: A Full Experiment Life Cycle User Study Framework",
    authors:
      "Zach Cutler, Jack Wilburn, Hilson Shrestha, Yiren Ding, Brian C Bollen, Khandaker Abrar Nadib, Tingying He, Andrew McNutt, Lane Harrison, Alexander Lex",
    journal: "IEEE VIS 2025",
    year: 2025,
    links: [
      {
        name: "live",
        link: "https://revisit.dev/",
      },
      {
        name: "studies",
        link: "https://revisit.dev/replication-studies/",
      },
      {
        name: "code",
        link: "https://github.com/revisit-studies/replication-studies",
      },
      {
        name: "osf",
        link: "https://osf.io/e8anx/",
      },
    ],
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    abstract:
      "Online user studies of visualizations, visual encodings, and interaction techniques are ubiquitous in visualization research. Yet designing, conducting, and analyzing studies effectively is still a major burden. While a variety of packages support such user studies, most solutions only address facets of the experiment life cycle, make reproducibility difficult, or do not cater to nuanced study designs or interactions. We introduce reVISit 2.0, a software framework that supports visualization researchers at all stages of designing and conducting browser-based user studies. reVISit supports researchers in the design, debug & pilot, data collection, analysis, and dissemination experiment phases by providing both technical affordances (such as replay of participation interactions) and sociotechnical aids (such as a mindfully maintained community of support). It is a proven system that can be (and has been) used in publication quality studies---which we demonstrate through a series of experimental replications. We reflect on the design of the system via interviews and an analysis of its technical dimensions. Through this work we seek to elevate the ease by which studies are conducted, improve the reproducibility of studies within our community, and support the construction of advanced interactive studies.",
    topics: ["Visualization Systems", "DSLs"],
  },
  {
    link: "https://arxiv.org/abs/2507.04236",
    urlTitle: "annogram",
    imgLink: "assets/annogram.jpg",
    title: "AnnoGram: An Annotative Grammar of Graphics Extension",
    authors:
      "Md Dilshadur Rahman, Md Rahat-uz-Zaman, Andrew McNutt, Paul Rosen",
    journal: "IEEE VIS 2025 (Short Papers)",
    year: 2025,
    links: [
      {
        name: "paper",
        link: "https://arxiv.org/abs/2507.04236",
      },
      {
        name: "live",
        link: "https://vl-annotation.netlify.app/",
      },
      {
        name: "code",
        link: "https://github.com/shape-vis/vega-lite-annotation",
      },
    ],
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    abstract:
      "Annotations are central to effective data communication, yet most visualization tools treat them as secondary constructs---manually defined, difficult to reuse, and loosely coupled to the underlying visualization grammar. We propose a declarative extension to Wilkinson's Grammar of Graphics that reifies annotations as first-class design elements, enabling structured specification of annotation targets, types, and positioning strategies. To demonstrate the utility of our approach, we develop a prototype extension called Vega-Lite Annotation. Through comparison with eight existing tools, we show that our approach enhances expressiveness, reduces authoring effort, and enables portable, semantically integrated annotation workflows.",
    topics: ["Visualization Systems", "DSLs"],
  },
  {
    link: "",
    urlTitle: "teaching-critical-vis",
    imgLink: "assets/teaching-critical-vis.jpg",
    title: "Teaching Critical Visualization: A Field Report",
    authors:
      "Andrew McNutt, Shiyi He, Sujit Kumar Kamaraj, Purbid Bambroo, Nastaran Jadidi, John Bovard, Chang Han",
    abstract:
      "Critical Visualization is gaining popularity and academic focus, yet relatively few academic courses have been offered to support students in this complex area. This experience report describes a recent experimental course on the topic, exploring both what the topic could be as well as an experimental content structure (namely as scavenger hunt). Generally the course was successful, achieving the learning objectives of developing critical thinking skills, improving communication about complex ideas, and developing a knowledge about theories in the area.  While improvements can be made, we hope that humanistic notions of criticality are embraced more deeply in visualization pedagogy. ",
    topics: ["Critical Visualization", "Zines"],

    type: "extended abstract / workshop papers",
    subtype: "workshop",
    theme: "critical-perspectives",
    journal:
      "IEEE VIS Workshop on Visualization Education, Literacy, and Activities (EduVIS) 2025",
    year: 2025,
    links: [{ name: "osf", link: "https://osf.io/hxtq2/" }],
  },
  {
    link: "",
    urlTitle: "keyframer",
    imgLink: "assets/keyframer.jpg",
    title:
      "Keyframer: A Design Probe for Exploring LLM Assistance in 2D Animation Design",
    authors: "Tiffany Tseng, Ruijia Cheng, Andrew McNutt, Jeffrey Nichols",
    journal: "IEEE VL/HCC 2025 (Short Papers)",
    year: 2025,
    links: [
      {
        name: "video figure",
        link: "https://machinelearning.apple.com/research/keyframer",
      },
      {
        name: "paper",
        link: "https://arxiv.org/pdf/2402.06071",
      },
    ],
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    abstract:
      "Creating 2D animations is challenging because it requires iterative refinement of movement and transitions across multiple elements within a scene. We explored the potential of LLMs to support animation design by first identifying current challenges in formative interviews with animation creators, and then developing a design probe and LLM-based animation design tool called Keyframer. From user-provided graphics and natural language prompts, Keyframer generates animation code, enables users to preview rendered animations inline, and supports direct edits for iterative design refinement. We utilized this design probe to uncover user prompting styles for describing animation in natural language and observe user strategies for iterating on animations in an exploratory user study with 13 novices and experts in animation design and programming. Through this study, we contribute a categorization of prompting styles users employed for specifying animation goals, along with design insights on supporting iterative refinement of animations through the combination of direct editing and natural language interfaces.",
    topics: ["Programming Interfaces", "AI"],
  },
  {
    link: "https://arxiv.org/abs/2507.16073",
    urlTitle: "buckaroo-demo",
    imgLink: "assets/buckaroo-demo.jpg",
    title: "Buckaroo: A Direct Manipulation Visual Data Wrangler",
    authors: "Annabelle Warner, Andrew McNutt, Paul Rosen, El Kindi Rezig",
    journal: "VLDB 2025 Demo",
    year: 2025,
    links: [
      {
        name: "paper",
        link: "https://arxiv.org/abs/2507.16073",
      },
    ],
    type: "extended abstract / workshop papers",
    subtype: "ex. abs.",
    theme: "NA",
    abstract:
      "Preparing datasets—a critical phase known as data wrangling—constitutes the dominant phase of data science development, consuming upwards of 80% of the total project time. This phase encompasses a myriad of tasks: parsing data, restructuring it for analysis, repairing inaccuracies, merging sources, eliminating duplicates,and ensuring overall data integrity. Traditional approaches, typically through manual coding in languages such as Python or using spreadsheets, are not only laborious but also error-prone. These issues range from missing entries and formatting inconsistencies to data type inaccuracies, all of which can affect the quality of downstream tasks if not properly corrected. To address these challenges, we present Buckaroo, a visualization system to highlight discrepancies in data and enable on-the-spot corrections through direct manipulations of visual objects. Buckaroo (1) automatically finds “interesting” data groups that exhibit anomalies compared to the rest of the groups and recommends them for inspection;(2) suggests wrangling actions that the user can choose to repair the anomalies; and (3) allows users to visually manipulate their data by displaying the effects of their wrangling actions and offering the ability to undo or redo these actions, which supports the iterative nature of data wrangling",
    topics: ["Visualization Systems", "Programming Interfaces"],
  },
  {
    link: "https://www.computer.org/csdl/magazine/cg/2025/03/11086543/28xfB5z12rC",
    urlTitle: "critical-data-vis-intro",
    imgLink: "assets/critical-vis-intro.jpg",
    title: "Critical Data Visualization—Part I/II",
    authors:
      "Georgia Panagiotidou, Andrew McNutt, Derya Akbaba, Nicole Hengesbach, Miriah Meyer",
    journal:
      "Computer Graphics & Applications — Special Issue(s) Introduction(s)",
    year: 2025,
    links: [
      {
        name: "paper",
        link: "https://www.computer.org/csdl/magazine/cg/2025/03/11086543/28xfB5z12rC",
      },
    ],
    type: "extended abstract / workshop papers",
    subtype: "ex. abs.",
    theme: "NA",
    abstract:
      "We began this special issue with the twin goals of complicating and coalescing the visualization research community's definition of critical visualization. In true critical fashion, this proved to be more challenging than expected.",
    topics: ["Critical Visualization"],
  },
  {
    link: "https://arxiv.org/pdf/2507.17898",
    urlTitle: "same-data-different-audiences",
    imgLink: "assets/same-data-different-audiences.jpg",
    title:
      "Same Data, Different Audiences: Using Personas to Scope a Supercomputing Job Queue Visualization",
    authors:
      "Connor Scully-Allison, Kevin Menear, Kristin Potter, Andrew McNutt, Katherine E. Isaacs, Dmitry Duplyakin",
    year: 2025,
    journal: "preprint",
    links: [{ name: "paper", link: "https://arxiv.org/pdf/2507.17898" }],
    type: "conference / journal articles",
    subtype: "preprint",
    theme: "programming-interfaces",
    topics: ["Visualization Systems", "Programming Interfaces"],
    abstract: `Domain-specific visualizations sometimes focus on narrow, albeit important, tasks for one group of users. This focus limits the utility of a visualization to other groups working with the same data. While tasks elicited from other groups can present a design pitfall if not disambiguated, they also present a design opportunity—development of visualizations that support multiple groups. This development choice presents a trade off of broadening the scope but limiting support for the more narrow tasks of any one group, which in some cases can enhance the overall utility of the visualization. We investigate this scenario through a design study where we develop Guidepost, a notebook-embedded visualization of supercomputer queue data that helps scientists assess supercomputer queue wait times, machine learning researchers understand prediction accuracy, and system maintainers analyze usage trends. We adapt the use of personas for visualization design from existing literature in the HCI and software engineering domains and apply them in categorizing tasks based on their uniqueness across the stakeholder personas. Under this model, tasks shared between all groups should be supported by interactive visualizations and tasks unique to each group can be deferred to scripting with notebook-embedded visualization design. We evaluate our visualization with nine expert analysts organized into two groups: a "research analyst" group that uses supercomputer queue data in their research (representing the Machine Learning researchers and Jobs Data Analyst personas) and a "supercomputer user" group that uses this data conditionally (representing the HPC User persona). We find that our visualization serves our three stakeholder groups by enabling users to successfully execute shared tasks with point-and-click interaction while facilitating case-specific programmatic analysis workflows.`,
  },
  {
    link: "https://github.com/revisit-studies/revisitpy",
    urlTitle: "revisit-py",
    imgLink: "assets/revisit-py.jpg",
    title: "ReVISitPy: Python Bindings for the reVISit Study Framework",
    authors:
      "Hilson Shrestha, Jack Wilburn, Brian Bollen, Andrew McNutt, Alexander Lex, Lane Harrison",
    journal: "EuroVIS Posters 2025",
    year: 2025,
    links: [
      { name: "code", link: "https://github.com/revisit-studies/revisitpy" },
      {
        name: "paper",
        link: "https://diglib.eg.org/items/48f6a45a-371c-4f3e-bdf3-28f064860c63",
      },
    ],
    type: "extended abstract / workshop papers",
    subtype: "poster",
    theme: "programming-interfaces",
    abstract:
      "User experiments are an important part of visualization research, yet they remain costly, time-consuming to create, and difficult to prototype and pilot. The process of prototyping a study—from initial design to data collection and analysis—often requires the use of multiple systems (e.g. webservers and databases), adding complexity. We present reVISitPy, a Python library that enables visualization researchers to design, pilot deployments, and analyze pilot data entirely within a Jupyter notebook. Re- VISitPy provides a higher-level Python interface for the reVISit Domain-Specific Language (DSL) and study framework, which traditionally relies on manually authoring complex JSON configuration files. As study configurations grow larger, editing raw JSON becomes increasingly tedious and error-prone. By streamlining the configuration, testing, and preliminary analysis work- flows, reVISitPy reduces the overhead of study prototyping and helps researchers quickly iterate on study designs before full deployment through the reVISit framework.",
    topics: ["Visualization Systems", "DSLs"],
  },
  {
    link: "https://arxiv.org/html/2503.17517v1",
    urlTitle: "upset-alt-text",
    imgLink: "assets/upset-alt-text.jpg",
    title: "Accessible Text Descriptions for UpSet Plots",
    authors:
      "Andrew McNutt, Maggie K McCracken, Ishrat Jahan Eliza, Daniel Hajas, Jake Wagoner, Nate Lanza, Jack Wilburn, Sarah Creem-Regehr, Alexander Lex",
    journal: "EuroVIS 2025",
    year: 2025,
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2503.17517v1" },
      { name: "osf", link: "https://osf.io/kbvs9/" },
      {
        name: "live",
        link: "https://vdl.sci.utah.edu/Upset-alttxt-study/Upset-Alttext-User-Survey/",
      },
      {
        name: "code",
        link: "https://github.com/visdesignlab/upset-alt-txt-gen",
      },
      {
        name: "video figure",
        link: "https://www.youtube.com/watch?v=OhScWL1bUkQ",
      },
      {
        name: "blog post",
        link: "https://vdl.sci.utah.edu/blog/",
      },
    ],
    topics: ["Accessibility", "Visualization Systems"],
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    abstract:
      "Data visualizations are typically not accessible to blind and low-vision (BLV) users. Automatically generating text descriptions offers an enticing mechanism for democratizing access to the information held in complex scientific charts, yet appropriate procedures for generating those texts remain elusive. Pursuing this issue, we study a single complex chart form: UpSet plots. UpSet Plots are a common way to analyze set data, an area largely unexplored by prior accessibility literature. By analyzing the patterns present in real-world examples, we develop a system for automatically captioning any UpSet plot. We evaluated the utility of our captions via semi-structured interviews with (N=11) BLV users and found that BLV users find them informative. In extensions, we find that sighted users can use our texts similarly to UpSet plots and that they are better than naive LLM usage. ",
  },
  {
    link: "https://arxiv.org/abs/2502.07649",
    urlTitle: "linting-is-people",
    imgLink: "assets/linting-is-people.jpg",
    title:
      "Linting is People! Exploring the Potential of Human Computation as a Sociotechnical Linter of Data Visualizations",
    authors: "Anamaria Crisan, Andrew McNutt",
    journal: "alt.CHI 2025",
    year: 2025,
    links: [{ name: "paper", link: "https://arxiv.org/abs/2502.07649" }],
    type: "extended abstract / workshop papers",
    subtype: "ex. abs.",
    theme: "vis-correctness",
    topics: ["Visualization Correctness", "Sociotechnical Factors"],
    abstract:
      "Traditionally, linters are code analysis tools that help developers by flagging potential issues from syntax and logic errors to enforcing syntactical and stylistic conventions. Recently, linting has been taken as an interface metaphor, allowing it to be extended to more complex inputs, such as visualizations, which demand a broader perspective and alternative approach to evaluation. We explore a further extended consideration of linting inputs, and modes of evaluation, across the puritanical, neutral, and rebellious dimensions. We specifically investigate the potential for leveraging human computation in linting operations through Community Notes---crowd-sourced contextual text snippets aimed at checking and critiquing potentially accurate or misleading content on social media. We demonstrate that human-powered assessments not only identify misleading or error-prone visualizations but that integrating human computation enhances traditional linting by offering social insights. As is required these days, we consider the implications of building linters powered by Artificial Intelligence.",
  },
  {
    link: "assets/tattoo.pdf",
    urlTitle: "tattoo",
    imgLink: "assets/tattoo.jpg",
    title:
      "Slowness, Politics, and Joy: Values That Guide Technology Choices in Creative Coding Classrooms",
    authors: "Andrew McNutt, Sam Cohen, Ravi Chugh",
    journal: "ACM CHI 2025 🏆 Honorable Mention for Best Paper 🏆",
    year: 2025,
    links: [
      { name: "paper", link: "assets/tattoo.pdf" },
      { name: "osf", link: "https://osf.io/preprints/osf/83z94_v1" },
    ],
    type: "conference / journal articles",
    subtype: "conference",
    theme: "creative-coding",
    abstract:
      "There are many tools and technologies for making art with code, each embodying distinct values and affordances. Within this landscape, creative coding educators must evaluate how different tools map onto their own principles and examine the potential impacts of those choices on students' learning and artistic development. Understanding the values guiding these decisions is critical, as they reflect insights about these contexts, communities, and pedagogies. We explore these values through semi-structured interviews with (N=12) creative coding educators and toolbuilders. We identify three major themes: slowness (how friction can make room for reflection), politics (including the lasting effects of particular technologies), and joy (or the capacity for playful engagement). The lessons and priorities voiced by our participants offer valuable, transferable perspectives---like preferring community building (such as through documentation) over techno-solutionism. We demonstrate application of these critical lenses to two tool design areas (accessibility and AI assistance).",
    topics: ["Creative Coding", "Sociotechnical Factors"],
  },
  {
    link: "https://color-buddy.netlify.app/",
    urlTitle: "color-buddy",
    imgLink: "assets/color-buddy.jpg",
    title: "Mixing Linters with GUIs: A Color Palette Design Probe",
    authors: "Andrew McNutt, Maureen C. Stone, Jeffrey Heer",
    journal: "IEEE VIS 2024",
    year: 2024,
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2407.21285" },
      {
        name: "materials",
        link: "https://osf.io/geauf/",
      },
      {
        name: "live",
        link: "https://color-buddy.netlify.app/",
      },
      {
        name: "code",
        link: "https://github.com/mcnuttandrew/color-buddy",
      },
      {
        name: "talk",
        link: "https://www.youtube.com/watch?v=yBF6qqK_ASs&t=731s",
      },
    ],
    abstract: `Visualization linters are end-user facing evaluators that automatically identify potential chart issues. These spell-checker like systems offer a blend of interpretability and customization that is not found in other forms of automated assistance. However, existing linters do not model context and have primarily targeted users who do not need assistance, resulting in obvious—even annoying—advice. We investigate these issues within the domain of color palette design, which serves as a microcosm of visualization design concerns. We contribute a GUI-based color palette linter as a design probe that covers perception, accessibility, context, and other design criteria, and use it to explore visual explanations, integrated fixes, and user defined linting rules. Through a formative interview study and theory-driven analysis, we find that linters can be meaningfully integrated into graphical contexts thereby addressing many of their core issues. We discuss implications for integrating linters into visualization tools, developing improved assertion languages, and supporting end-user tunable advice—all laying the groundwork for more effective visualization linters in any context.`,
    type: "conference / journal articles",
    subtype: "conference",
    theme: "vis-correctness",
    topics: ["Visualization Correctness", "Accessibility", "DSLs"],
  },
  {
    link: "https://arxiv.org/abs/2407.20103",
    urlTitle: "ue-pb",
    imgLink: "assets/ue-pb.jpg",
    title:
      "What Can Interactive Visualization do for Participatory Budgeting in Chicago?",
    authors:
      "Alex Kale, Danni Liu, Maria Gabriela Ayala, Harper Schwab, Andrew McNutt",
    journal: "IEEE VIS 2024",
    year: 2024,
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2407.20103" },
      { name: "live", link: "https://chicago-pb-probe.netlify.app/" },
      {
        name: "code",
        link: "https://github.com/mcnuttandrew/chicago-pb-probe",
      },
    ],
    abstract: `Participatory budgeting (PB) is a democratic approach to allocating municipal spending that has been adopted in many places in recent years, including in Chicago. Current PB voting resembles a ballot where residents are asked which municipal projects, such as school improvements and road repairs, to fund with a limited budget. In this work, we ask how interactive visualization can benefit PB by conducting a design probe-based interview study (N=13) with policy workers and academics with expertise in PB, urban planning, and civic HCI. Our probe explores how graphical elicitation of voter preferences and a dashboard of voting statistics can be incorporated into a realistic PB tool. Through qualitative analysis, we find that visualization creates opportunities for city government to set expectations about budget constraints while also granting their constituents greater freedom to articulate a wider range of preferences. However, using visualization to provide transparency about PB requires efforts to mitigate potential access barriers and mistrust. We call for more visualization professionals to help build civic capacity by working in and studying political systems.`,
    type: "conference / journal articles",
    subtype: "conference",
    theme: "critical-perspectives",
    topics: ["Sociotechnical Factors", "Visualization Systems"],
  },
  {
    link: "https://arxiv.org/abs/2407.20571",
    urlTitle: "gallery-study",
    imgLink: "assets/gallery-study.jpg",
    title: "Considering Visualization Example Galleries",
    authors: "Junran Yang, Andrew McNutt, Leilani Battle",
    journal: "IEEE VL/HCC 2024",
    year: 2024,
    links: [
      {
        name: "paper",
        link: "https://arxiv.org/abs/2407.20571",
      },
    ],
    abstract: `Example galleries are often used to teach, document, and advertise visually-focused domain-specific languages and libraries, such as those producing visualizations, diagrams, or webpages. Despite their ubiquity, there is no consensus on the role of "example galleries", let alone what the best practices might be for their creation or curation. To understand gallery meaning and usage, we interviewed the creators (N=11) and users (N=9) of prominent visualization-adjacent tools. From these interviews we synthesized strategies and challenges for gallery curation and management (e.g. weighing the costs/benefits of adding new examples and trade-offs in richness vs ease of use), highlighted the differences between planned and actual gallery usage (e.g. opportunistic reuse vs search-engine optimization), and reflected on parts of the gallery design space not explored (e.g. highlighting the potential of tool assistance). We found that galleries are multi-faceted structures whose form and content are motivated to accommodate different usages--ranging from marketing material to test suite to extended documentation. This work offers a foundation for future support tools by characterizing gallery design and management, as well as by highlighting challenges and opportunities in the space (such as how more diverse galleries make reuse tasks simpler, but complicate upkeep).`,
    subtype: "conference",
    type: "conference / journal articles",
    theme: "programming-interfaces",
    topics: ["Visualization Systems", "Sociotechnical Factors"],
  },
  {
    link: "https://arxiv.org/abs/2309.10108.pdf",
    urlTitle: "woz-ai",
    imgLink: "assets/woz.jpg",
    title:
      "How Do Data Analysts Respond to AI Assistance? A Wizard-of-Oz Study",
    authors:
      "Ken Gu, Madeleine Grunde-McLaughlin, Andrew McNutt, Jeffrey Heer, Tim Althoff",
    journal: "ACM CHI 2024",
    year: 2024,
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2309.10108.pdf" },
      {
        name: "code",
        link: "https://github.com/behavioral-data/Data-Assistant-Interface",
      },
    ],
    abstract: `Data analysis is challenging as analysts must navigate nuanced decisions that may yield divergent conclusions. AI assistants have the potential to support analysts in planning their analyses, enabling more robust decision-making. Though AI-based assistants that target code execution (e.g., Github Copilot) have received significant attention, limited research addresses assistance for both analysis execution and planning. In this work, we characterize helpful planning suggestions and their impacts on analysts' workflows. We first review the analysis planning literature and crowd-sourced analysis studies to categorize suggestion content. We then conduct a Wizard-of-Oz study (n=13) to observe analysts' preferences and reactions to planning assistance in a realistic scenario. Our findings highlight subtleties in contextual factors that impact suggestion helpfulness, emphasizing design implications for supporting different abstractions of assistance, forms of initiative, increased engagement, and alignment of goals between analysts and assistants.`,
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    topics: ["AI", "Programming Interfaces"],
  },
  {
    link: "https://arxiv.org/abs/2308.15429",
    urlTitle: "only-you",
    imgLink: "assets/only-you.jpg",
    title: "Only YOU Can Make IEEE VIS Environmentally Sustainable",
    authors: "Elsie Lee-Robbins, Andrew McNutt",
    journal: "alt.vis 2023",
    year: 2023,
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2308.15429" },
      { name: "talk", link: "https://www.youtube.com/watch?v=WDp75Puoh24" },
    ],
    abstract: `The IEEE VIS Conference (or VIS) hosts more than 1000 people annually. It brings together visualization researchers and practitioners from across the world to share new research and knowledge. Behind the scenes, a team of volunteers puts together the entire conference and makes sure it runs smoothly. Organizing involves logistics of the conference, ensuring that the attendees have an enjoyable time, allocating rooms to multiple concurrent tracks, and keeping the conference within budget. In recent years, the COVID-19 pandemic has abruptly disrupted plans, forcing organizers to switch to virtual, hybrid, and satellite formats. These alternatives offer many benefits:  fewer costs (e.g., travel, venue, institutional), greater accessibility (who can physically travel, who can get visas, who can get child care), and a lower carbon footprint (as people do not need to fly to attend). As many conferences begin to revert to the pre-pandemic status quo of primarily in-person conferences, we suggest that it is an opportune moment to reflect on the benefits and drawbacks of lower-carbon conference formats. To learn more about the logistics of conference organizing, we talked to 6 senior executive-level VIS organizers. We review some of the many considerations that go into planning, particularly with regard to how they influence decisions about alternative formats.   We aim to start a discussion about the sustainability of VIS---including sustainability for finance, volunteers, and, central to this work, the environment---for the next three years and the next three hundred years. `,
    type: "extended abstract / workshop papers",
    subtype: "workshop",
    theme: "critical-perspectives",
    topics: ["Critical Visualization"],
  },
  {
    link: "https://arxiv.org/abs/2308.16353",
    urlTitle: "notascope",
    imgLink: "assets/notascope.jpg",
    title: "Metrics-Based Evaluation and Comparison of Visualization Notations",
    authors: "Nicolas Kruchten, Andrew McNutt, Michael J. McGuffin",
    journal: "IEEE VIS 2023",
    year: 2023,
    links: [
      { name: "live", link: "https://app.notascope.io/" },
      { name: "osf", link: "https://osf.io/8924y/" },
      { name: "code", link: "https://github.com/notascope/notascope" },
      { name: "paper", link: "https://arxiv.org/abs/2308.16353" },
      {
        name: "blog post",
        link: "https://medium.com/multiple-views-visualization-research-explained/metrics-for-reasoning-about-the-usability-of-visualization-notations-6c03b9292780",
      },
    ],
    abstract: `A visualization notation is a recurring pattern of symbols used to author specifications of visualizations, from data transformation to visual mapping. Programmatic notations use symbols defined by grammars or domain-specific languages (e.g., ggplot2, dplyr, Vega-Lite) or libraries (e.g., Matplotlib, Pandas).   Designers and prospective users of grammars and libraries often evaluate visualization notations by inspecting galleries of examples.  While such collections demonstrate usage and expressiveness, their construction and evaluation are usually ad hoc, making comparisons of different notations difficult.  More rarely, experts analyze notations via usability heuristics, such as the Cognitive Dimensions of Notations framework. These analyses, akin to structured close readings of text, can reveal design deficiencies, but place a burden on the expert to simultaneously consider many facets of often complex systems.  To alleviate these issues, we introduce a metrics-based approach to usability evaluation and comparison of notations in which metrics are computed for a gallery of examples across a suite of notations.  While applicable to any visualization domain, we explore the utility of our approach via a case study considering statistical graphics that explores 40 visualizations across 9 widely used notations. We facilitate the computation of appropriate metrics and analysis via a new tool called NotaScope.  We gathered feedback via interviews with authors or maintainers of prominent charting libraries (n=6).  We find that this approach is a promising way to formalize, externalize, and extend evaluations and comparisons of visualization notations.`,
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    topics: ["Visualization Systems", "DSLs"],
  },
  {
    link: "https://arxiv.org/abs/2307.11260",
    urlTitle: "prong",
    imgLink: "assets/prong-logo.jpg",
    title: "Projectional Editors for JSON-Based DSLs",
    authors: "Andrew McNutt, Ravi Chugh",
    journal: "VL/HCC 2023",
    year: 2023,
    links: [
      { name: "live", link: "https://prong-editor.netlify.app/" },
      { name: "code", link: "https://github.com/mcnuttandrew/prong" },
      { name: "paper", link: "https://arxiv.org/abs/2307.11260" },
      { name: "talk", link: "https://youtu.be/-62Slx5Tq6o" },
    ],
    abstract: `Augmenting text-based programming with rich structured interactions has been explored in many ways. Among these, projectional editors offer an enticing combination of structure editing and domain-specific program visualization. Yet such tools are typically bespoke and expensive to produce, leaving them inaccessible to many DSL and application designers.

We describe a relatively inexpensive way to build rich projectional editors for a large class of DSLs -- namely, those defined using JSON. Given any such JSON-based DSL, we derive a projectional editor through (i) a language-agnostic mapping from JSON Schemas to structure-editor GUIs and (ii) an API for application designers to implement custom views for the domain-specific types described in a schema. We implement these ideas in a prototype, Prong, which we illustrate with several examples including the Vega and Vega-Lite data visualization DSLs.`,
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    topics: ["Visualization Systems", "Programming Interfaces", "DSLs"],
  },
  {
    link: "https://osf.io/fy246",
    urlTitle: "phd-thesis",
    imgLink: "assets/phd-thesis.jpg",
    title:
      "Understanding and Enhancing JSON-based DSL Interfaces for Visualization",
    authors: "Andrew McNutt (advised by Ravi Chugh)",
    journal:
      "Ph.D. Thesis. University of Chicago, Department of Computer Science, 2023",
    year: 2023,
    links: [
      { name: "paper", link: "https://osf.io/fy246" },
      { name: "materials", link: "https://osf.io/ywcqa/" },
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
    type: "theses / book chapters",
    subtype: "thesis",
    theme: "programming-interfaces",
    topics: ["Visualization Systems", "Programming Interfaces", "DSLs"],
  },
  {
    link: "assets/doom-n-fruit.pdf",
    urlTitle: "doom-n-fruit",
    imgLink: "assets/doom-n-fruit.jpg",
    title:
      "Doom or Deliciousness: Challenges and Opportunities for Visualization in the Age of Generative Models",
    authors:
      "Victor Schetinger, Sara Di Bartolomeo, Mennatallah El-Assady, Andrew McNutt, Matthias Miller, João Paulo Apolinário Passos, Jane L. Adams",
    journal: "EuroVis 2023",
    year: 2023,
    links: [
      { name: "osf", link: "assets/doom-n-fruit.pdf" },
      { name: "osf", link: "https://osf.io/3jrcm/" },
    ],
    abstract: `Generative text-to-image models (as exemplified by DALL-E, MidJourney, and Stable Diffusion) have recently made enormous technological leaps, demonstrating impressive results in many graphical domains---from logo design to digital painting and photographic composition. However, the quality of these results has led to existential crises in some fields of art, leading to questions about the role of human agency in the production of meaning in a graphical context. Such issues are central to visualization, and while these generative models have yet to be widely applied to visualization, it seems only a matter of time until their integration is manifest. Seeking to circumvent similar ponderous dilemmas, we attempt to understand the roles that generative models might play across visualization. We do so by constructing a framework that characterizes what these technologies offer at various stages of the visualization workflow, augmented and analyzed through semi-structured interviews with 19 experts from related domains. Through this work, we map the space of opportunities and risks that might arise in this intersection, identifying doomsday prophecies and delicious low-hanging fruits that are ripe for research.`,
    type: "conference / journal articles",
    subtype: "journal",
    theme: "critical-perspectives",
    topics: ["AI", "Sociotechnical Factors"],
  },
  {
    link: "https://arxiv.org/abs/2301.11178",
    urlTitle: "ai-4-notebooks",
    imgLink: "assets/meta-cells-image.jpg",
    title: "On the Design of AI-powered Code Assistants for Notebooks",
    authors: "Andrew McNutt, Chenglong Wang, Rob DeLine, Steven M. Drucker",
    journal: "ACM CHI 2023",
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2301.11178" },
      { name: "talk", link: "https://www.youtube.com/watch?v=g0prh8mE3bI" },
    ],
    abstract: `AI-powered code assistants, such as Copilot, are quickly becoming a ubiquitous component of contemporary coding contexts. Among these environments, computational notebooks, such as Jupyter, are of particular interest as they provide rich interface affordances that interleave code and output in a manner that allows for both exploratory and presentational work. Despite their popularity, little is known about the appropriate design of code assistants in notebooks. We investigate the potential of code assistants in computational notebooks by creating a design space (reified from a survey of extant tools) and through an interview-design study (with 15 practicing data scientists). Through this work, we identify challenges and opportunities for future systems in this space, such as the value of disambiguation for tasks like data visualization, the potential of tightly scoped domain-specific tools (like linters), and the importance of polite assistants.`,
    year: 2023,
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    topics: ["AI", "Programming Interfaces"],
  },
  {
    link: "https://arxiv.org/abs/2301.13302",
    urlTitle: "sauce",
    imgLink: "assets/sauce-image.jpg",
    title: "A Study of Editor Features in a Creative Coding Classroom",
    authors: "Andrew McNutt, Anton Outkine, Ravi Chugh",
    journal: "ACM CHI 2023",
    year: 2023,
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2301.13302" },
      { name: "live", link: "http://cs111.org/" },
      { name: "talk", link: "https://www.youtube.com/watch?v=g2GkTdOKU3A" },
    ],
    abstract:
      "Creative coding is a rapidly expanding domain for both artistic expression and computational education. Numerous libraries and IDEs support creative coding, however there has been little consideration of how the environments themselves might be designed to serve these twin goals. To investigate this gap, we implemented and used an experimental editor to teach a sequence of college and high-school creative coding courses. In the first year, we conducted a log analysis of student work (n=39) and surveys regarding prospective features (n=25). These guided our implementation of common enhancements (e.g. color pickers) as well as uncommon ones (e.g. bidirectional shape editing). In the second year, we studied the effects of these features through logging (n=39+) and survey (n=23) studies. Reflecting on the results, we identify opportunities to improve creativity- and novice-focused IDEs and highlight tensions in their design (as in tools that augment artistry or efficiency but may hinder learning).",
    type: "conference / journal articles",
    subtype: "conference",
    theme: "creative-coding",
    topics: ["Creative Coding", "Programming Interfaces"],
  },
  {
    link: "https://arxiv.org/abs/2207.07998",
    urlTitle: "no-grammar",
    imgLink: "assets/no-grammar.jpg",
    title:
      "No Grammar to Rule Them All: A Survey of JSON-Style DSLs for Visualization",
    authors: "Andrew McNutt",
    year: 2022,
    journal: "IEEE VIS 2022",
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2207.07998" },
      { name: "live", link: "https://vis-json-dsls.netlify.app/" },
      { name: "talk", link: "https://youtu.be/GMy2QCE-y7o?t=3783" },
      {
        name: "replicability badge",
        link: "http://www.replicabilitystamp.org/#https-github-com-mcnuttandrew-no-grammar-supplement",
      },
      {
        name: "press",
        link: "https://mcorrell.medium.com/visualization-in-the-wild-a-trip-report-from-vis-2022-c42311b95f28",
      },
    ],
    abstract:
      "There has been substantial growth in the use of JSON-based grammars, as well as other standard data serialization languages, to create visualizations. Each of these grammars serves a purpose: some focus on particular computational tasks (such as animation), some are concerned with certain chart types (such as maps), and some target specific data domains (such as ML). Despite the prominence of this interface form, there has been little detailed analysis of the characteristics of these languages.  In this study, we survey and analyze the design and implementation of 57 JSON-style DSLs for visualization. We analyze these languages supported by a collected corpus of examples for each DSL (consisting of 4395 instances) across a variety of axes organized into concerns related to domain, conceptual model, language relationships, affordances, and general practicalities. We identify tensions throughout these areas, such as between formal and colloquial specifications, among types of users, and within the composition of languages. Through this work, we seek to support language implementers by elucidating the choices, opportunities, and tradeoffs in visualization DSL design.",
    type: "conference / journal articles",
    subtype: "journal",
    theme: "programming-interfaces",
    topics: ["Visualization Systems", "DSLs"],
  },
  {
    link: "https://link.springer.com/article/10.1007/s12064-022-00376-8",
    urlTitle: "goethe-candolle",
    imgLink: "assets/goethe-candolle.jpg",
    title: "Goethe and Candolle: National forms of scientific writing?",
    authors: "Agatha Seo-Hyun Kim, Andrew McNutt ",
    journal: "Theory in Biosciences",
    year: 2022,
    links: [
      {
        name: "paper",
        link: "https://link.springer.com/article/10.1007/s12064-022-00376-8",
      },
    ],
    abstract:
      "What role does nationality—or the image of a nation—play in how one thinks and receives scientific ideas? This paper investigates the commonly held ideas about “German science” and “French science” in early nineteenth-century France. During the politically turbulent time, the seemingly independent scientific community found itself in a difficult position: first, between the cosmopolitan ideals of scientific community and the invasive political reality, and second, between the popularized image of national differences and the actual comparisons of international scientific ideas. The tension between multiple sets of fictions and realities underscores the fragility of the concept of nationality as a scientific measure. A case study comparing morphological ideas, receptions in France, and the actual scientific texts of J. W. von Goethe and A. P. de Candolle further illustrates this fragility. Goethe and Candolle make an ideal comparative case because they were received in very different lights despite their similar concept of the plant type. Our sentence-classification and visualization methods are applied to their scientific texts, to compare the actual compositions and forms of the texts that purportedly represented German and French sciences. This paper concludes that there was a gap between what French readers assumed they read and what they really read, when it came to foreign scientific texts. The differences between Goethe's and Candolle's texts transcended the perceived national differences between German Romanticism and French Classicism.",
    type: "conference / journal articles",
    subtype: "journal",
    theme: "NA",
    topics: ["Visualization Systems", "History of Science"],
  },
  {
    link: "https://www.blaseur.com/papers/rationales-naacl22.pdf",
    urlTitle: "explaining-why",
    imgLink: "assets/explaining-why.jpg",
    title:
      "Explaining Why: How Instructions and User Interfaces Impact Annotator Rationales When Labeling Text Data",
    authors:
      "Jamar L. Sullivan, Will Brackenbury, Andrew McNutt, Kevin Bryson, Kwam Byll, Yuxin Chen, Michael Littman, Chenhao Tan, Blase Ur",
    journal: "NAACL 2022",
    year: 2022,
    links: [
      {
        name: "paper",
        link: "https://www.blaseur.com/papers/rationales-naacl22.pdf",
      },
      {
        name: "replicability badge",
        link: "https://naacl2022-reproducibility-track.github.io/results/",
      },
      {
        name: "code",
        link: "https://github.com/UChicagoSUPERgroup/rationales-naacl22",
      },
    ],
    abstract:
      "In the context of data labeling, NLP researchers are increasingly interested in having humans select _rationales_, a subset of input tokens relevant to the chosen label. We conducted a 332-participant online user study to understand how humans select rationales, especially how different instructions and user interface affordances impact the rationales chosen. Participants labeled ten movie reviews as positive or negative, selecting words and phrases supporting their label as rationales. We varied the instructions given, the rationale-selection task, and the user interface. Participants often selected about 12% of input tokens as rationales, but selected fewer if unable to drag over multiple tokens at once. Whereas participants were near unanimous in their data labels, they were far less consistent in their rationales. The user interface affordances and task greatly impacted the types of rationales chosen. We also observed large variance across participants.",
    type: "conference / journal articles",
    subtype: "conference",
    theme: "NA",
    topics: ["AI", "Sociotechnical Factors"],
  },
  {
    link: "https://arxiv.org/abs/2109.06007",
    urlTitle: "vis-4-villainy",
    imgLink: "assets/villainy.jpg",
    title: "Visualization for Villainy",
    authors: "Andrew McNutt, Lilian Huang, Kathryn Koenig",
    journal: "alt.vis 2021",
    links: [
      { name: "paper", link: "https://arxiv.org/abs/2109.06007" },
      { name: "talk", link: "https://youtu.be/jFbsYto_2ys?t=1471" },
    ],
    year: 2021,
    abstract:
      "Visualization has long been seen as a dependable and trustworthy tool for carrying out analysis and communication tasks -- a view reinforced by the growing interest in applying it to socially positive ends. However, despite the benign light in which visualization is usually perceived, it carries the potential to do harm to people, places, concepts, and things. In this paper, we capitalize on this negative potential to serve an underrepresented (but technologically engaged) group: villains. To achieve these ends, we introduce a design space for this type of graphical violence, which allows us to unify prior work on deceptive visualization with novel data-driven dastardly deeds, such as emotional spear phishing and unsafe data physicalization. By charting this vile charting landscape, we open new doors to collaboration with terrifying domain experts, and hopefully, make the world just a bit worse.",
    type: "extended abstract / workshop papers",
    subtype: "workshop",
    theme: "critical-perspectives",
    topics: ["Critical Visualization"],
  },
  {
    link: "https://www.blaseur.com/papers/uist21-kondocloud.pdf",
    urlTitle: "kondoCloud",
    imgLink: "assets/kondo.jpg",
    title:
      "KondoCloud: Improving Information Management in Cloud Storage via Recommendations Based on File Similarity",
    authors:
      "Will Brackenbury, Andrew McNutt, Kyle Chard, Aaron Elmore, Blase Ur",
    journal: "ACM UIST 2021",
    year: 2021,
    links: [
      {
        name: "paper",
        link: "https://www.blaseur.com/papers/uist21-kondocloud.pdf",
      },
      { name: "code", link: "https://github.com/wbrackenbury/KondoCloud" },
    ],
    abstract:
      "Users face many challenges in keeping their personal file collections organized. While current file-management interfaces help users retrieve files in disorganized repositories, they do not aid in organization. Pertinent files can be difficult to find, and files that should have been deleted may remain. To help, we designed KondoCloud, a file-browser interface for personal cloud storage. KondoCloud makes machine learning-based recommendations of files users may want to retrieve, move, or delete. These recommendations leverage the intuition that similar files should be managed similarly.<br/><br/>We developed and evaluated KondoCloud through two complementary online user studies. In our Observation Study, we logged the actions of 69 participants who spent 30 minutes manually organizing their own Google Drive repositories. We identified high-level organizational strategies, including moving related files to newly created sub-folders and extensively deleting files. To train the classifiers that underpin KondoCloud's recommendations, we had participants label whether pairs of files were similar and whether they should be managed similarly. In addition, we extracted ten metadata and content features from all files in participants' repositories. Our logistic regression classifiers all achieved F1 scores of 0.72 or higher. In our Evaluation Study, 62 participants used KondoCloud either with or without recommendations. Roughly half of participants accepted a non-trivial fraction of recommendations, and some participants accepted nearly all of them. Participants who were shown the recommendations were more likely to delete related files located in different directories. They also generally felt the recommendations improved efficiency. Participants who were not shown recommendations nonetheless manually performed about a third of the actions that would have been recommended.",
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    topics: ["AI"],
  },
  {
    link: "https://www.mcnutt.in/zine-potential",
    urlTitle: "",
    shortTitle: "zine-potential",
    imgLink: "assets/zine-potential.jpg",
    title: "On The Potential of Zines as a Medium for Visualization",
    authors: "Andrew McNutt",
    year: 2021,
    journal: "IEEE VIS 2021 (Short Papers)",
    links: [
      { name: "about", link: "https://www.mcnutt.in/zine-potential" },
      { name: "paper", link: "https://arxiv.org/abs/2108.02177" },
      { name: "talk", link: "https://youtu.be/khhlIrowR_g" },
    ],
    abstract:
      "Zines are a form of small-circulation self-produced publication often akin to a magazine. This free-form medium has a long history and has been used as means for personal or intimate expression, as a way for marginalized people to describe issues that are important to them, and as a venue for graphical experimentation. It would seem then that zines would make an ideal vehicle for the recent interest in applying feminist or humanist ideas to visualization. Yet, there has been little work combining visualization and zines. In this paper we explore the potential of this intersection by analyzing examples of zines that use data graphics and by describing the pedagogical value that they can have in a visualization classroom. In doing so, we argue that there are plentiful opportunities for visualization research and practice in this rich intersectional-medium.",
    type: "conference / journal articles",
    subtype: "conference",
    theme: "critical-perspectives",
    topics: ["Critical Visualization", "Zines"],
  },
  {
    link: "https://arxiv.org/abs/2104.04042",
    urlTitle: "tacos",
    imgLink: "assets/tacos.jpg",
    title: "What are Table Cartograms Good for Anyway? An Algebraic Analysis",
    authors: "Andrew McNutt",
    journal:
      "EuroVis 2021 🏆 Honorable Mention for Best Paper 🏆 (Juried Selection, 1 awarded)",
    year: 2021,
    links: [
      { name: "about", link: "#/research/tacos" },
      { name: "paper", link: "https://arxiv.org/abs/2104.04042" },
      {
        name: "talk",
        link: "https://www.youtube.com/watch?v=ozBn5bLsGQw&t=2594s",
      },
    ],
    abstract: `Unfamiliar or esoteric visual forms arise in many areas of visualization. While such forms can be intriguing, it can be unclear how to make effective use of them without long periods of practice or costly user studies. In this work we analyze the table cartogram—a graphic which visualizes tabular data by bringing the areas of a grid of quadrilaterals into correspondence with the input data, like a heat map that has been *area-ed* rather than colored. Despite having existed for several years, little is known about its appropriate usage. We mend this gap by using Algebraic Visualization Design to show that they are best suited to relatively small tables with ordinal axes for some comparison and outlier identification tasks. In doing so we demonstrate a discount theory-based analysis that can be used to cheaply determine best practices for unknown visualizations.
    `,
    type: "conference / journal articles",
    subtype: "journal",
    theme: "vis-correctness",
    topics: ["Visualization Correctness"],
  },
  {
    link: "https://arxiv.org/abs/2101.07902",
    urlTitle: "ivy",
    imgLink: "assets/ivy.jpg",
    title:
      "Integrated Visualization Editing via Parameterized Declarative Templates",
    authors: "Andrew McNutt, Ravi Chugh",
    // journal: 'Proceedings of the 2021 ACM annual conference on Human Factors in Computing Systems',
    journal: "ACM CHI 2021",
    year: 2021,
    links: [
      { name: "about", link: "#/research/ivy" },
      { name: "live", link: "https://github.com/mcnuttandrew/ivy" },
      { name: "paper", link: "https://arxiv.org/abs/2101.07902" },
      { name: "osf", link: "https://osf.io/cture/" },
      { name: "talk", link: "https://www.youtube.com/watch?v=FzIdVnSi9Po" },
    ],
    abstract: `
Interfaces for creating visualizations typically embrace one of several common forms. Textual specification enables fine-grained control, shelf building facilitates rapid exploration, while chart choosing promotes immediacy and simplicity. Ideally these approaches could be unified to integrate the user- and usage-dependent benefits found in each modality, yet these forms remain distinct.

<br />
We propose parameterized declarative templates, a simple abstraction mechanism over JSON-based visualization grammars, as a foundation for multimodal visualization editors. We demonstrate how templates can facilitate organization and reuse by factoring the more than 160 charts that constitute Vega-Lite's example gallery into approximately 40 templates. We exemplify the pliability of abstracting over charting grammars by implementing—as a template—the functionality of the shelf builder Polestar (a simulacra of Tableau) and a set of templates that emulate the Google Sheets chart chooser. We show how templates support multimodal visualization editing by implementing a prototype and evaluating it through an approachability study.`,
    type: "conference / journal articles",
    subtype: "conference",
    theme: "programming-interfaces",
    topics: ["Visualization Systems", "DSLs"],
  },
  {
    link: "https://arxiv.org/abs/2009.02384",
    urlTitle: "nearby",
    imgLink: "assets/nearby-preview.jpg",
    year: 2020,
    title:
      "Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading",
    authors:
      "Andrew McNutt, Agatha Seo-Hyun Kim, Sergio Elahi, Kazutaka Takahashi",
    journal: "Visualization for the Digital Humanities (VIS4DH) 2020",
    links: [
      { name: "about", link: "#/research/nearby" },
      { name: "paper", link: "https://arxiv.org/abs/2009.02384" },
      {
        name: "code",
        link: "https://github.com/mcnuttandrew/sci-text-compare",
      },
      // { name: "live", link: "https://goetheanddecandolle.rcc.uchicago.edu/" },
      { name: "live", link: "https://www.mcnutt.in/sci-text-compare/" },
    ],
    abstract:
      "Distant reading methodologies make use of computational processes to aid in the analysis of large text corpora which might not be pliable to traditional methods of scholarly analysis due to their volume. While these methods have been applied effectively to a variety of types of texts and contexts, they can leave unaddressed the needs of scholars in the humanities disciplines like history, who often engage in close reading of sources. Complementing the close analysis of texts with some of the tools of distant reading, such as visualization, can resolve some of the issues. We focus on a particular category of this intersection—which we refer to as near-by reading—wherein an expert engages in a computer-mediated analysis of a text with which they are familiar. We provide an example of this approach by developing a visual analysis application for the near-by reading of 19th-century scientific writings by J. W. von Goethe and A. P. de Candolle. We show that even the most formal and public texts, such as scientific treatises, can reveal unexpressed personal biases and philosophies that the authors themselves might not have recognized.",
    type: "extended abstract / workshop papers",
    subtype: "workshop",
    theme: "critical-perspectives",
    topics: ["Visualization Systems", "History of Science"],
  },
  {
    link: "https://www.mcnutt.in/table-cartogram/",
    urlTitle: "table-cartogram",
    imgLink: "assets/tc-preview.jpg",
    title:
      "A Minimally Constrained Optimization Algorithm for Table Cartograms",
    authors: "Andrew McNutt, Gordon Kindlmann",
    year: 2020,
    journal:
      "VIS 2020 - InfoVIS Poster Track 🏆 Honorable Mention for Best Poster Research 🏆 (Juried Selection, 2 awarded)",
    links: [
      { name: "about", link: "#/research/table-cartogram" },
      { name: "paper", link: "https://osf.io/kem6j/" },
      { name: "code", link: "https://github.com/mcnuttandrew/table-cartogram" },
      { name: "poster", link: "assets/table-cartogram-poster.pdf" },
      { name: "live", link: "https://www.mcnutt.in/table-cartogram/" },
    ],
    abstract:
      "Table cartograms are a recent type of data visualization that encodes numerical tabular data as a grid of quadrilaterals whose area are brought into correspondence with the input data. The overall effect is similar to that of a heat map that has been ‘area-ed‘ rather than shaded. There exist several algorithms for creating these structures—variously utilizing techniques such as computational geometry and numerical optimization —yet each of them impose aesthetically-motivated conditions that impede fine tuning or manipulation of the visual aesthetic of the output. In this work we contribute an optimization algorithm for creating table cartograms that is able to compute a variety of table cartograms layouts for a single dataset. We make our web-ready implementation available as table-cartogram.ts",
    type: "posters",
    subtype: "poster",
    theme: "NA",
    topics: ["Visualization Systems"],
  },
  {
    link: "https://arxiv.org/abs/2001.02316",
    urlTitle: "mirage",
    imgLink: "assets/surfacing-visualization-mirages.jpg",
    title: "Surfacing Visualization Mirages",
    authors: "Andrew McNutt, Gordon Kindlmann, Michael Correll",
    year: 2020,
    // journal:
    //   'Proceedings of the 2020 ACM annual conference on Human Factors in Computing Systems <br/> 🏆 Honorable Mention for Best Paper 🏆 (Top 5% of papers)',
    journal:
      "ACM CHI 2020 🏆 Honorable Mention for Best Paper 🏆 (Top 5% of papers)",
    links: [
      { name: "about", link: "#/research/mirage" },
      {
        name: "blog post",
        link: "https://medium.com/multiple-views-visualization-research-explained/surfacing-visualization-mirages-8d39e547e38c",
      },
      { name: "paper", link: "https://arxiv.org/abs/2001.02316" },
      { name: "live", link: "https://metamorphic-linting.netlify.app/" },
      {
        name: "code",
        link: "https://github.com/tableau/Visualization-Linting",
      },
      { name: "osf", link: "https://osf.io/je3x9" },
      { name: "slides", link: "talks/mirage-talk.pdf" },
      { name: "talk", link: "https://www.youtube.com/watch?v=arHbVFbq-mQ" },
    ],
    abstract:
      "Dirty data and deceptive design practices can undermine, invert, or invalidate the purported messages of charts and graphs. These failures can arise silently: a conclusion derived from a particular visualization may look plausible unless the analyst looks closer and discovers an issue with the backing data, visual specification, or their own assumptions. We term such silent but significant failures visualization mirages. We describe a conceptual model of mirages and show how they can be generated at every stage of the visual analytics process. We adapt a methodology from software testing, metamorphic testing, as a way of automatically surfacing potential mirages at the visual encoding stage of analysis through modifications to the underlying data and chart specification. We show that metamorphic testing can reliably identify mirages across a variety of chart types with relatively little prior knowledge of the data or the domain.",
    type: "conference / journal articles",
    subtype: "conference",
    theme: "vis-correctness",
    topics: ["Visualization Correctness"],
  },
  {
    link: "https://www.tableau.com/sites/default/files/2023-01/altchi-tarot-cameraready.pdf",
    imgLink: "assets/vis-tarot.jpg",
    urlTitle: "tarot",
    title: "Divining Insights: Visual Analytics Through Cartomancy",
    authors: "Andrew McNutt, Anamaria Crisan, Michael Correll",
    journal: "alt.CHI 2020",
    year: 2020,
    links: [
      { name: "about", link: "#/research/tarot" },
      {
        name: "paper",
        link: "https://www.tableau.com/sites/default/files/2023-01/altchi-tarot-cameraready.pdf",
      },
      { name: "live", link: "https://vis-tarot.github.io/vis-tarot/" },
      { name: "code", link: "https://github.com/mcorrell/vis-tarot" },
      { name: "slides", link: "talks/tarot-talk.pdf" },
      { name: "talk", link: "https://www.youtube.com/watch?v=fRA42BjyG_Q" },
    ],
    abstract:
      "Our interactions with data, visual analytics included, are increasingly shaped by automated or algorithmic systems. An open question is how to give analysts the tools to interpret these “automatic insights” while also inculcating critical engagement with algorithmic analysis. We present a system, Sortilège, that uses the metaphor of a Tarot card reading to provide an overview of automatically detected patterns in data in a way that is meant to encourage critique, reflection, and healthy skepticism.",
    type: "extended abstract / workshop papers",
    subtype: "ex. abs.",
    theme: "critical-perspectives",
    topics: ["Critical Visualization", "Visualization Systems"],
  },
  {
    link: "https://www.mcnutt.in/ms-zine/",
    imgLink: "assets/ms-thesis.jpg",
    title:
      "Design and Analysis of Table Cartograms: Simultaneous Multipurpose Tabular Area-encoding Displays",
    urlTitle: "ms-thesis",
    authors: "Andrew McNutt (Advised by Gordon Kindlmann)",
    journal: "Masters thesis. University of Chicago",
    year: 2018,
    links: [{ name: "zine", link: "https://www.mcnutt.in/ms-zine/" }],
    abstract: "",
    type: "theses / book chapters",
    subtype: "thesis",
    theme: "NA",
    topics: ["Visualization Systems"],
  },
  {
    link: "assets/posterkim102519.pdf",
    imgLink: "assets/agathas-thing.jpg",
    urlTitle: "goethe-poster",
    title:
      "Textual Analysis & Comparison National Forms of Scientific Texts: Goethe + de Candolle",
    authors:
      "Agatha Seo-Hyun Kim, Andrew McNutt, Sergio Elahi, Kazutaka Takahashi, Robert J Richards",
    journal:
      "MindBytes Research Symposium 2019. 🏆 Best Poster in Visualization 🏆",
    year: 2019,
    links: [
      { name: "poster", link: "assets/posterkim102519.pdf" },
      // {name: 'live', link: 'https://goetheanddecandolle.rcc.uchicago.edu/'},
      {
        name: "award",
        link: "https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research",
      },
    ],
    abstract:
      "When the 19th-century European scientists were evaluating each other's ideas, they frequently validated their opinions by referring to the nationality of a given scientist as an explanatory type. Is there such a thing as 'national science'? This project examines widely-held ideas about the German and French styles of science in early 19th-century France. During this politically volatile period scientists found themselves in a difficult position. Between the aggressive political reality and the ideals of the cosmopolitan scientific community; as well as between the popularized image of national differences and the actual comparisons of the scientific ideas across national borders. As a case study, Goethe's and Candolle's botanical ideas, their receptions in France, and their actual texts are compared. We contrast these texts in detail through several types of interactive visualizations.",
    type: "posters",
    subtype: "poster",

    theme: "NA",
    topics: ["Visualization Systems", "History of Science"],
  },
  {
    link: "https://diglib.eg.org:8443/server/api/core/bitstreams/845e021f-38b3-4c16-8f94-128d186551c0/content",
    imgLink: "assets/forested-tree-view-example.jpg",
    title:
      "Improving the Scalability of Interactive Visualization Systems for Exploring Threaded Conversations",
    authors: "Andrew McNutt, Gordon Kindlmann",
    urlTitle: "forum-explorer-eurovis",
    year: 2019,
    // journal: 'Proceedings of the Eurographics Conference on Visualization "EuroVis" - Posters',
    journal: "EuroVis 2019 (Posters)",
    links: [
      {
        name: "paper",
        link: "https://diglib.eg.org/xmlui/bitstream/handle/10.2312/eurp20191144/053-055.pdf",
      },
      { name: "poster", link: "assets/forum-explorer-poster.pdf" },
      { name: "live", link: "https://www.mcnutt.in/forum-explorer/" },
      { name: "code", link: "https://github.com/mcnuttandrew/forum-explorer" },
      { name: "osf", link: "https://osf.io/nrhqw/" },
      {
        name: "award",
        link: "https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research",
      },
    ],
    abstract:
      "Large threaded conversations, such as those found on YCombinator's HackerNews, are typically presented in a way that shows individual comments clearly, but can obscure larger trends or patterns within the conversational corpus. Previous research has addressed this problem through graphical-overviews and NLP-generated summaries. These efforts have generally assumed a particular (and modest) data size, which limits their utility for large or deeply-nested conversations, and often require non-trivial offline processing time, which makes them impractical for day-to-day usage. We describe here Forum Explorer, a Chrome extension that combines and expands upon prior art through a collection of techniques that enable this type of representation to handle wider ranges of data in real time. Materials for this project are available at https://osf.io/nrhqw/.",
    type: "posters",
    subtype: "poster",
    theme: "NA",
    topics: ["Visualization Systems"],
  },
  {
    link: "assets/McNutt_Kindlmann_2018.pdf",
    imgLink: "assets/lint-pic.jpg",
    urlTitle: "linting-visguides",
    title:
      "Linting for Visualization: Towards a Practical Automated Visualization Guidance System",
    authors: "Andrew McNutt, Gordon Kindlmann",
    year: 2018,
    journal:
      "IEEE VIS Workshop on Creation, Curation, Critique and Conditioning of Principles and Guidelines in Visualization (VisGuides 2018)",
    links: [
      { name: "paper", link: "assets/McNutt_Kindlmann_2018.pdf" },
      { name: "code", link: "https://github.com/mcnuttandrew/vislint_mpl" },
      { name: "slides", link: "talks/vis-lint-talk.pdf" },
    ],
    abstract:
      " Constructing effective charts and graphs in a scientific setting is a nuanced task that requires a thorough understanding of visualization design; a knowledge that may not be available to all practicing scientists. Previous attempts to address this problem have pushed chart creators to pore over large collections of guidelines and heuristics, or to relegate their entire workflow to end-to-end tools that provide automated recommendations. In this paper we bring together these two strains of ideas by introducing the use of lint as a mechanism for guiding chart creators towards effective visualizations in a manner that can be configured to taste and task without forcing users to abandon their usual workflows. The programmatic evaluation model of visualization linting (or vis lint) offers a compelling framework for the automation of visualization guidelines, as it offers unambiguous feedback during the chart creation process, and can execute analyses derived from machine vision and natural language processing. We demonstrate the feasibility of this system through the production of vislint_mpl, a prototype visualization linting system, that evaluates charts created in matplotlib.",
    type: "extended abstract / workshop papers",
    subtype: "workshop",
    theme: "vis-correctness",
    topics: ["Visualization Correctness", "Visualization Systems"],
  },
  {
    link: "https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14",
    imgLink: "assets/cdd-pic.jpg",
    urlTitle: "reporter-assays",
    title:
      "Data Mining and Computational Modeling of High-Throughput Screening Datasets",
    authors: `Sean Ekins, Alex M. Clark, Krishna Dole, Kellan Gregory, Andrew McNutt,
    Anna Coulon Spektor, Charlie Weatherall, Nadia K Litterman, Barry A Bunin`,
    journal: "Reporter Gene Assays",
    year: 2018,
    links: [
      {
        name: "paper",
        link: "https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14",
      },
    ],
    abstract:
      "We are now seeing the benefit of investments made over the last decade in high-throughput screening (HTS) that is resulting in large structure activity datasets entering public and open databases such as ChEMBL and PubChem. The growth of academic HTS screening centers and the increasing move to academia for early stage drug discovery suggests a great need for the informatics tools and methods to mine such data and learn from it. Collaborative Drug Discovery, Inc. (CDD) has developed a number of tools for storing, mining, securely and selectively sharing, as well as learning from such HTS data. We present a new web based data mining and visualization module directly within the CDD Vault platform for high-throughput drug discovery data that makes use of a novel technology stack following modern reactive design principles. We also describe CDD Models within the CDD Vault platform that enables researchers to share models, share predictions from models, and create models from distributed, heterogeneous data. Our system is built on top of the Collaborative Drug Discovery Vault Activity and Registration data repository ecosystem which allows users to manipulate and visualize thousands of molecules in real time. This can be performed in any browser on any platform. In this chapter we present examples of its use with public datasets in CDD Vault. Such approaches can complement other cheminformatics tools, whether open source or commercial, in providing approaches for data mining and modeling of HTS data.",
    type: "theses / book chapters",
    subtype: "chapter",
    theme: "NA",
    topics: ["Drug Discovery"],
  },
  {
    link: "https://arxiv.org/abs/1501.07537",
    imgLink: "assets/qgrav-pic.jpg",
    title: "The Schrodinger-Newton System with Self-field Coupling",
    authors: "Joel Franklin, Youdan Guo, Andrew McNutt, Allison Morgan",
    urlTitle: "qgrav",
    journal: "Journal of Classical and Quantum Gravity",
    year: 2015,
    links: [
      { name: "paper", link: "https://arxiv.org/abs/1501.07537" },
      { name: "slides", link: "assets/QGravPresentation.pdf" },
    ],
    abstract:
      "We study the Schrodinger-Newton system of equations with the addition of gravitational field energy sourcing - such additional nonlinearity is to be expected from a theory of gravity (like general relativity), and its appearance in this simplified scalar setting (one of Einstein's precursors to general relativity) leads to significant changes in the spectrum of the self-gravitating theory. Using an iterative technique, we compare the mass dependence of the ground state energies of both Schrodinger-Newton and the new, self-sourced system and find that they are dramatically different. The Bohr method approach from old quantization provides a qualitative description of the difference, which comes from the additional nonlinearity introduced in the self-sourced case. In addition to comparison of ground state energies, we calculate the transition energy between the ground state and first excited state to compare emission frequencies between Schrodinger-Newton and the self-coupled scalar case.",
    type: "conference / journal articles",
    subtype: "journal",
    theme: "NA",
    topics: ["Physics"],
  },
  {
    link: "https://pubs.acs.org/doi/full/10.1021/acs.jcim.5b00143",
    imgLink: "assets/cdd-models-pic.jpg",
    title:
      "Open source Bayesian models. 1. Application to ADME/Tox and drug discovery datasets",
    urlTitle: "bayes-models",
    authors: `Alex M. Clark, Krishna Dole, Anna Coulon-Spektor, Andrew McNutt,
    George Grass, Joel S. Freundlich, Robert C. Reynolds, Sean Ekins`,
    journal: "Journal of Chemical Information and Modeling",
    year: 2015,
    links: [
      {
        name: "paper",
        link: "http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143",
      },
    ],
    abstract:
      "On the order of hundreds of absorption, distribution, metabolism, excretion, and toxicity (ADME/Tox) models have been described in the literature in the past decade which are more often than not inaccessible to anyone but their authors. Public accessibility is also an issue with computational models for bioactivity, and the ability to share such models still remains a major challenge limiting drug discovery. We describe the creation of a reference implementation of a Bayesian model-building software module, which we have released as an open source component that is now included in the Chemistry Development Kit (CDK) project, as well as implemented in the CDD Vault and in several mobile apps. We use this implementation to build an array of Bayesian models for ADME/Tox, in vitro and in vivo bioactivity, and other physicochemical properties. We show that these models possess cross-validation receiver operator curve values comparable to those generated previously in prior publications using alternative tools. We have now described how the implementation of Bayesian models with FCFP6 descriptors generated in the CDD Vault enables the rapid production of robust machine learning models from public data or the user's own datasets. The current study sets the stage for generating models in proprietary software (such as CDD) and exporting these models in a format that could be run in open source software using CDK components. This work also demonstrates that we can enable biocomputation across distributed private or public datasets to enhance drug discovery.",
    type: "conference / journal articles",
    subtype: "journal",
    theme: "NA",
    topics: ["Drug Discovery"],
  },
  {
    link: "assets/thesis.pdf",
    imgLink: "assets/thesis-pic.jpg",
    title: "Nonequivalent Lagrangian Mechanics",
    urlTitle: "nonequiv",
    authors: "Andrew McNutt (Advised by Nelia Mann)",
    journal: "Undergraduate thesis. Reed College",
    year: 2014,
    links: [
      { name: "thesis", link: "assets/thesis.pdf" },
      { name: "slides", link: "assets/nlm-talk.pdf" },
    ],
    abstract:
      "In this thesis we study a modern formalism known as Nonequivalent Lagrangian Mechanics, that is constructed on top of the traditional Lagrangian theory of mechanics. By making use of the non-uniqueness of the Lagrangian representation of dynamical systems, we are able to generate conservation laws in a way that is novel and, in many cases much faster than the traditional Noetherian analysis. In every case that we examine, these invariants turn out to be Noetherian invariants in disguise. We apply this theory to a wide variety of systems including predator-prey dynamics and damped driven harmonic motion.",
    type: "theses / book chapters",
    subtype: "thesis",
    theme: "NA",
    topics: ["Physics"],
  },
];
