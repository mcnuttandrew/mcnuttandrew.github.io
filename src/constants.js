export default {
  about: 'I am an applied mathematician currently working in the wild world of San Francisco web development. My work in the past several years has primarily revolved around developing beautiful user interfaces that convey information honestly. In my current position at Uber I draw pictures with numbers and other semantic information. Prior to that I majored in physics, with a special empahsis on mechanics, which, in a bizzare twist, lead me into rails-oriented web development. Edward Tufte once made fun of me in a hotel in Seattle.',
  title: 'Andrew M. McNutt',
  subtitle: 'SF-Based Visualization Expert and Applied Mathematician',
  profpic: 'https://s3-us-west-1.amazonaws.com/mcnutt-static-images/profpic.png',

  skills: [{
      title: 'PERSONAL',
      content: 'information design, physics, arts'
    }, {
      title: 'WEB DEV',
      content: 'd3, react, flux/redux, node, backbone, processing, jquery, ruby, ruby on rails, python, flask, sketch'
    }, {
      title: 'SCI-COM',
      content: 'mathematica, grid mathematica, numpy, pandaz'
    }
  ],
  publications: [
    {
      title: '1',
      link: '',
      text: 'Franklin, J., Guo, Y., McNutt, A., & Morgan, A. (2015). The Schrödinger–Newton system with self-field coupling. Classical and Quantum Gravity'
    },
    {
      title: '2',
      link: '',
      text: 'Clark, A. M., Dole, K., Coulon-Spektor, A., McNutt, A., Grass, G., Freundlich, J. S., ... & Ekins, S. (2015). Open Source Bayesian Models: I. Application to ADME/Tox and Drug Discovery Datasets. Journal of chemical information and modeling.'
    }
  ],

  projects: [
    {
      title: 'Nonequivalant Lagrangian Mechanics',
      link: '../assets/thesis.pdf',
      imgLink: 'https://s3-us-west-1.amazonaws.com/mcnutt-static-images/thesis-image.png',
      text: 'During my senior year at Reed I wrote my undergraduate thesis on an alternative representation of classical mechanics called Nonequivalent Lagrangian Mechanics. It was advised by Nelia Mann.'
    },
    {
      title: 'N-Hedron',
      imgLink: 'https://s3-us-west-1.amazonaws.com/mcnutt-static-images/n-hydron.png',
      link: '../assets/nhedron.pdf',
      text: 'Throughout my undergraduate career I had a prevailing interest in the geometrically ambiguous shape, the N-Hedron. It is formed by taking an integer, N, number of points, placing them on the sphere and demanding that they be maximally far apart. This culminated in a independent project, in which I implemented three different algorithms for constructing these shapes. You can find out more about this project. One of the major aspects of this project was dealing with a large (for Mathematica) amount of data which reached up into the millions of data points.'
    },
    {
      title: 'Chaotic Circuit',
      imgLink: 'https://s3-us-west-1.amazonaws.com/mcnutt-static-images/chaotic-image.png',
      link: '../assets/Chaotic_circuit.pdf',
      text: 'In culminating effort of my junior year at Reed I built a third order Chaotic circuit as an independent project. This project was fine, but shows some of the best data visualization work I have done, particularlly the combination phase and signal metering small multiples diagram.'
    }
  ],

  onlineWork: [
    {
      title: 'Personal Timeline',
      liveLink: 'http://mcnuttandrew.github.io/personal-timeline/',
      sourceLink: 'https://github.com/mcnuttandrew/personal-timeline',
      imgLink: 'https://s3-us-west-1.amazonaws.com/mcnutt-static-images/personal-time.png',
      text: 'A brief timeline of my life, a resume through a dark mirror if you will. Single page app built with React, React-Router, and D3.'
    },
    {
      title: 'Why Not Ipsum',
      liveLink: 'http://why-not-ipsum.herokuapp.com/',
      sourceLink: 'https://github.com/mcnuttandrew/Why-Not-Zoidberg',
      imgLink: 'https://s3-us-west-1.amazonaws.com/mcnutt-static-images/why-not-image.png',
      text: 'A Lorem Ipsum generator populated by Zoidberg quotes, built following RESTful design practices. Included a large series of data scrapes, which were necessarily followed by intensive data cleaning. Technologies included Rails API, Backbone.js, and Nokogiri.'
    },
    {
      title: 'N-Body Simulator',
      liveLink: 'https://mcnuttandrew.github.io/n-body-simulator/',
      sourceLink: 'https://github.com/mcnuttandrew/N-Body-Simulator',
      imgLink: 'https://s3-us-west-1.amazonaws.com/mcnutt-static-images/n-body-image.png',
      text: 'A low N gravitional interaction simulator built in processing.'
    },
    {
      title: 'Asteroids',
      imgLink: 'https://s3-us-west-1.amazonaws.com/mcnutt-static-images/asteroids-image.png',
      liveLink: 'https://mcnuttandrew.github.io/asteroids/',
      sourceLink: 'https://github.com/mcnuttandrew/Asteroids',
      text: 'A reimaging of the classic arcade game. Technologies included Javascipt, HTML5 Canvas, and jQuery'
    },
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
  ]
}
