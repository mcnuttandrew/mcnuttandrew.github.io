<script lang="ts">
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
  const externalLinks = [
    {link: 'https://scholar.google.com/citations?user=BFOrUoQAAAAJ', name: 'scholar'},
    {link: 'https://github.com/mcnuttandrew', name: 'github'}
  ];
</script>

<div class="flex-col cursor-pointer px-3 z-10 flex md:hidden bg-white shadow-md">
  <div on:click={toggleHeader} class="flex h-16 justify-between w-full items-center">
    <h1 class="text-3xl">Andrew McNutt</h1>
    <div>
      <!-- hamburger menu -->
      <svg transform="rotate({$rotation})" width="25px" height="21px">
        <rect x="0" y="0" width="25" height="3" />
        <rect x="0" y="7" width="25" height="3" />
        <rect x="0" y="14" width="25" height="3" />
      </svg>
    </div>
  </div>
  {#if open}
    <div class="flex-col flex mb-3">
      {#each ['about', 'publications', 'projects', 'cv'] as section (section)}
        <a
          href="/#/{section}"
          class:font-bold={currentSection === section}
          class="padding text-3xl no-underline"
          on:click={toggleHeader}
        >
          {section.toUpperCase()}
        </a>
      {/each}
      {#each externalLinks as x}
        <a
          href={x.link}
          class:font-bold={currentSection === x.name}
          class="padding externalLink text-3xl no-underline flex"
        >
          {x.name.toUpperCase()}
          <img src="icons/{x.name}.svg" alt="link to {x.name} account" class="ml-2" />
        </a>
      {/each}
    </div>
  {/if}
</div>
