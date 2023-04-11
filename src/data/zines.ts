interface Zine {
  title: string;
  link?: string;
  imgLink: string;
  text: string;
  year: number;
}
const ZINES: Zine[] = [
  {
    title: 'Design and Analysis of Table Cartograms',
    link: 'https://www.mcnutt.in/ms-zine/',
    imgLink: 'https://www.mcnutt.in/ms-zine/cover.png',
    text: 'My masters thesis zine',
    year: 2019
  },

  {
    title: '"How to read an academic paper" zine',
    link: 'https://www.mcnutt.in/paper-zine/',
    imgLink: 'https://www.mcnutt.in/paper-zine/cover.png',
    text: 'A non-definitive guide to paper reading.',
    year: 2021
  },
  {
    title: 'On the potential of zines as a medium for visualization',
    link: 'https://www.mcnutt.in/zine-potential/',
    imgLink: 'https://www.mcnutt.in/converted-images/zine-potential.jpg',
    text: 'A zine about my paper about the potential of zines for data visualization.',
    year: 2021
  },
  {
    title: 'Bison Elysium National Park',
    imgLink: 'https://www.mcnutt.in/converted-images/bison-eylsium-cover.jpg',
    text: 'A brochure for a fictional national park made using MidJourney and GPT3. (print only)',
    year: 2022
  },
  {
    title: 'No Grammar to Rule Them All',
    imgLink: 'https://www.mcnutt.in/converted-images/no-grammar-zine-cover.jpg',
    text: 'A zine for my paper "No Grammar to rule them all: a survey of JSON-style DSLs for Visualization". (print only)',
    year: 2022
  },
  {
    title: 'Double Header CHI23 Zine',
    imgLink: 'https://www.mcnutt.in/converted-images/chi23-zine-preview.jpg',
    text: 'A two-sided zine describing my papers "On the Design of AI-powered Code Assistants for Notebooks" and "A Study of Editor Features in a Creative Coding Classroom"  (print only)',
    year: 2023
  }
];
export default ZINES;
