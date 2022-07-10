<script lang="ts">
  import Teaching from './Teaching.svelte';
  import {PRESENTATIONS, PUBLICATIONS, AWARDS, REVEIWING, SERVICE} from '../constants';
  import Publication from './Publication.svelte';
</script>

<h1 class="text-2xl font-bold">Andrew McNutt</h1>
<div class="leading-tight">
  <div>PhD Student at Univeristy of Chicago in Computer Science</div>
  <div>For a pdf version of my CV <a href="./assets/cv.pdf" class="text-cyan-800">click here</a></div>
  <div>CV updated July 2022</div>
</div>

<section class="section leading-tight">
  <h2 class="font-bold text-xl underline">Education</h2>
  <h3 class="font-bold">University of Chicago</h3>
  <div>PhD, Computer Science, 2017 - Present</div>
  <div>Thesis: In Progress</div>
  <div>Advised by <a href="http://people.cs.uchicago.edu/~rchugh/" class="text-cyan-800">Ravi Chugh</a></div>
  <br />
  <h3 class="font-bold">University of Chicago</h3>
  <div>MS, Computer Science, 2017 - 2019</div>
  <div>
    Thesis: Design and Analysis of Table Cartograms: Simultaneous-Multipurpose Tabular Area-Encoding Displays
  </div>
  <div>
    Advised by <a href="http://people.cs.uchicago.edu/~glk/" class="text-cyan-800">Gordon Kindlmann</a>
  </div>
  <br />
  <h3 class="font-bold">Reed College</h3>
  <div>BA, Physics, 2010 - 2014</div>
  <div>Thesis: Nonequivalent Lagrangian Mechanics</div>
  <div>
    Advised by <a
      href="https://www.union.edu/physics-and-astronomy/faculty-staff/nelia-mann"
      class="text-cyan-800">Nelia Mann</a
    >
  </div>
</section>

<section class="section leading-tight">
  <h2 class="font-bold text-xl underline">Professional Experience</h2>
  <div>
    Research Intern at <a href="https://www.microsoft.com/en-us/research/group/vida/" class="text-cyan-800"
      >Microsoft Research</a
    >, 2022
  </div>
  <div>
    Research Intern at <a href="https://research.tableau.com/" class="text-cyan-800">Tableau Research</a>,
    2019
  </div>
  <div>
    Graduate Researcher at <a href="https://computerscience.uchicago.edu/" class="text-cyan-800"
      >University of Chicago</a
    >, 2017 -
  </div>
  <div>
    Data Visualization Engineer at <a href="https://vis.gl/" class="text-cyan-800">Uber</a>, 2015 - 2017
  </div>
  <div>
    Scientific Visualization Developer at <a href="https://www.collaborativedrug.com/" class="text-cyan-800"
      >Collaborative Drug Discovery</a
    >, 2014 - 2015
  </div>
  <div>
    Undergraduate Researcher at <a href="https://www.reed.edu/physics/" class="text-cyan-800"
      >Reed College, 2013</a
    >
  </div>
</section>

<section class="section cv-pubs">
  <h2 class="font-bold text-xl underline">Publications</h2>
  <div class="research-section">
    {#each PUBLICATIONS as publication}
      <Publication {publication} compact={true} />
    {/each}
  </div>
</section>

<section class="section">
  <h2 class="font-bold text-xl underline">Awards</h2>
  <div class="research-section">
    {#each AWARDS as award}
      <div>
        <span class="font-bold">{award.awardName}. </span><span>{award.society}. </span><span
          >{award.date}</span
        >
        <!-- {#if award.detail}
          <span>{award.detail}</span>
        {/if} -->
      </div>
    {/each}
  </div>
</section>

<!-- <section class="section">
  <h2>BLOG POSTS</h2>
  <div class="research-section">
    {#each BLOG_POSTS as publication}
      <Publication {publication} noImg={true} />
    {/each}
  </div>
</section> -->

<section class="section">
  <h2 class="font-bold text-xl underline">Invited Talks</h2>
  <div class="research-section">
    {#each PRESENTATIONS as talk}
      <div class="flex flex-col mb-2">
        <span class="font-bold">{talk.title}</span>
        {#each talk.details as detail}
          <span>{detail}</span>
        {/each}
        <div class="flex">
          {#each talk.links || [] as link}
            <a class="mr-2" href={link.link}>{link.name}</a>
          {/each}
        </div>
      </div>
      <!-- <Publication {publication} compact={true} /> -->
    {/each}
  </div>
</section>

<section class="section">
  <h2 class="font-bold text-xl underline">Service</h2>
  <div class="research-section">
    {#each SERVICE as service}
      <div class="flex">
        {#if service.link}
          <a class="flex" href={service.link}>
            <span class="font-bold">{service.organization}</span>
            <span>. {service.role}. {service.date}</span>
          </a>
        {:else}
          <span class="font-bold">{service.organization}</span>
          <span>. {service.role}. {service.date}</span>
        {/if}
      </div>
    {/each}
    <div class="flex flex-col">
      <span class="font-bold">Reviewing</span>
      <div class="flex flex-col">
        {#each REVEIWING as review}
          <span>{review}</span>
        {/each}
      </div>
      <span>⭐ - Special Recognition for Outstanding Review</span>
    </div>
  </div>
</section>

<section class="section">
  <h2 class="font-bold text-xl underline">Teaching</h2>
  <Teaching />
</section>

<style>
  .section {
    margin-top: 20px;
  }
</style>
