<script>
  import {classnames} from '../utils.js';
  import {tweened} from 'svelte/motion';
  import {cubicOut} from 'svelte/easing';

  const rotation = tweened(0, {
    duration: 400,
    easing: cubicOut
  });

  export let currentSection;
  let open = false;
  function toggleHeader() {
    open = !open;
    rotation.set(!$rotation ? 90 : 0);
  }
</script>

<style>
  .selected {
    font-weight: bold;
  }
  .header {
    background: white;
    box-shadow: 0 2px 4px 0 #0c140c;
    display: none;
  }
  @media screen and (max-width: 600px) {
    .header {
      display: flex;
    }
  }
  .bar {
    cursor: pointer;
    padding: 0 10px;
    width: auto;
    z-index: 10;
  }
  .align {
    height: 50px;
    justify-content: space-between;
    align-items: center;
  }

  a {
    font-size: 30px;
    text-decoration: none;
  }

  .margin-bottom {
    margin-bottom: 10px;
  }

</style>

<div class="flex-down bar header">
  <div
    on:click={toggleHeader}
    class="flex align">
    <h3>Andrew McNutt</h3>
    <div>
      <svg
        transform="rotate({$rotation})"
        width="25px"
        height="21px">
        <rect x="0" y="0" width="25" height="3"></rect>
        <rect x="0" y="7" width="25" height="3"></rect>
        <rect x="0" y="14" width="25" height="3"></rect>
      </svg>
    </div>
  </div>
  {#if open}
    <div class="flex-down margin-bottom">
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
  {/if}
</div>
