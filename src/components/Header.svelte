<script>
  export let currentSection;
  import {classnames} from '../utils.js';
</script>

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
  a {
    font-size: 20px;
  }
  @media screen and (max-width: 600px) {
    .header {
      display: none;
    }
  }
</style>

<div class="flex-down bar align header">
  <div class="flex">
    {#each [
      'about',
      'projects',
      'research'
    ] as section (section)}
      <a
        href="/#/{section}"
        class={classnames({
          selected: currentSection === section,
          padding: true
        })}>
        {section.toUpperCase()}
      </a>
    {/each}
  </div>
</div>
