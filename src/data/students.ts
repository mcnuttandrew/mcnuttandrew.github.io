interface Student {
  name: string;
  role: string;
  researchInterests: string;
  link: string;
  image: string;
}
export const STUDENTS: Student[] = [
  {
    name: "Shiyi He",
    role: "PhD Student",
    researchInterests: "HCI, Data Visualization, and Notation Systems",
    link: "https://shiyihe-neko.github.io/",
    image: "assets/students/shiyi-he.jpg",
  },
  {
    name: "Zach Cutler",
    role: "PhD Student",
    researchInterests: "Visualization",
    link: "https://zach-cutler.com/",
    image: "assets/students/zcutler.jpg",
  },

  {
    name: "Hima Mynampaty",
    role: "MS Student",
    researchInterests: "Data Visualization, HCI, and Cloud Computing",
    link: "https://github.com/HimaMynampaty",
    image: "assets/students/hima-mynampaty.jpg",
  },
];
