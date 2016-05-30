export default {
  about: 'I am  an applied mathematician currently working in the wild world of San Francisco based web development. I am a full stack developer, but I am more or less front-end/data-visualization leaning. My educational background is in physics, specifically in mechaincs, and traditional rails oriented web development. I feel greatly for the plight of the American desert.',
  publications: [
    {
      title: '',
      text: 'Franklin, J., Guo, Y., McNutt, A., & Morgan, A. (2015). The Schrödinger–Newton system with self-field coupling. Classical and Quantum Gravity'
    },
    {
      title: '',
      text: 'Clark, A. M., Dole, K., Coulon-Spektor, A., McNutt, A., Grass, G., Freundlich, J. S., ... & Ekins, S. (2015). Open Source Bayesian Models: I. Application to ADME/Tox and Drug Discovery Datasets. Journal of chemical information and modeling.'
    }
  ],

  projects: [
    {
      title: 'Nonequivalant Lagrangian Mechanics',
      link: '../assets/thesis.pdf',
      text: 'During my senior year at Reed I wrote my undergraduate thesis on an alternative representation of classical mechanics called Nonequivalent Lagrangian Mechanics. It was advised by Nelia Mann.'
    },
    {
      title: 'N-Hedron',
      link: '../assets/nhedron.pdf',
      text: 'Throughout my undergraduate career I had a prevailing interest in the geometrically ambiguous shape, the N-Hedron. It is formed by taking an integer, N, number of points, placing them on the sphere and demanding that they be maximally far apart. This culminated in a independent project, in which I implemented three different algorithms for constructing these shapes. You can find out more about this project. One of the major aspects of this project was dealing with a large (for Mathematica) amount of data which reached up into the millions of data points.'
    },
    {
      title: 'Chaotic Circuit',
      link: '../assets/Chaotic_circuit.pdf',
      text: 'In culminating effort of my junior year at Reed I built a third order Chaotic circuit as an independent project. This project was fine, but shows some of the best data visualization work I have done, particularlly the combination phase and signal metering small multiples diagram.'
    }
  ],

  onlineWork: [
    {
      title: 'Teacup',
      liveLink: 'http://tea-cup.org/',
      sourceLink: 'https://github.com/mcnuttandrew/Project-Teacup',
      text: 'A microblogging platform for viewing the collective unconscious. Single page Backbone app based on RESTful practices. Features data visualizations including trending topics and user population. Seed data was generated using a variety of large scale data scrapes and data cleaning techniques. Technologies included a Rails API, Backbone.js, jQuery, Nokogiri, and D3.'
    },
    {
      title: 'CDD: Vision',
      liveLink: 'https://www.collaborativedrug.com/buzz/2015/05/02/cdd-vision-update-launching-vision-now/',
      text: 'A data visualization platform for viewing high dimensional drug discovery data, built for and on top of the Collaborative Drug Discovery: Vault platform. I acted as the lead developer on this project, which involved guiding a four person team through the implementation of a vareity of javascript technologies. The stack included a backend built on Crossfilter and Immutable, a middleware/binding level built with jQuery and d3.js, and frontend constructed with a blend of HTML5 canvas and Open GL.'
    },
    {
      title: 'Why Not Ipsum',
      liveLink: 'http://why-not-ipsum.herokuapp.com/',
      sourceLink: 'https://github.com/mcnuttandrew/Why-Not-Zoidberg',
      text: 'A Lorem Ipsum generator populated by Zoidberg quotes, built following RESTful design practices. Included a large series of data scrapes, which were necessarily followed by intensive data cleaning. Technologies included Rails API, Backbone.js, and Nokogiri.'
    },
    {
      title: 'N-Body Simulator',
      liveLink: 'https://mcnuttandrew.github.io/n-body-simulator/',
      sourceLink: 'https://github.com/mcnuttandrew/N-Body-Simulator',
      text: 'A low N gravitional interaction simulator built in processing.'
    },
    {
      title: 'Asteroids',
      liveLink: 'https://mcnuttandrew.github.io/asteroids/',
      sourceLink: 'https://github.com/mcnuttandrew/Asteroids',
      text: 'A reimaging of the classic arcade game. Technologies included Javascipt, HTML5 Canvas, and jQuery'
    }
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
