<script lang="ts">
  export let currentSection;
  import {classnames, wrapEvent} from '../utils.js';
</script>

<div class="bar align header">
  <div class="flex">
    {#each ['about', 'publications', 'projects', 'cv'] as section (section)}
      <a
        href="/#/{section}"
        on:click={wrapEvent(() => {}, {type: 'nav-click', value: section, context: 'desktop'})}
        class={classnames({selected: currentSection === section, padding: true})}
      >
        {section.toUpperCase()}
      </a>
    {/each}
  </div>
  <div class="flex align space-between">
    <a href="https://twitter.com/_mcnutt_"><img src="icons/twitter.svg" alt="link to twitter account" /></a>
    <a href="https://github.com/mcnuttandrew"><img src="icons/github.svg" alt="link to github account" /></a>
    <a href="https://scholar.google.com/citations?user=BFOrUoQAAAAJ"
      ><img src="icons/scholar.svg" alt="link to scholar page" /></a
    >
  </div>
</div>

<style>
  .selected {
    font-weight: bold;
  }
  .align {
    justify-content: center;
  }
  .bar {
    height: 50px;
  }
  .padding {
    padding-right: 10px;
  }
  .space-between * {
    margin: 0 10px;
  }
  a {
    font-size: 20px;
  }
  @media screen and (max-width: 600px) {
    .header {
      display: none;
    }
  }
</style>
