<script lang="ts">
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  const rotation = tweened(0, {
    duration: 400,
    easing: cubicOut,
  });

  export let currentSection;
  let open = false;
  function toggleHeader() {
    open = !open;
    rotation.set(!$rotation ? 90 : 0);
  }
  const externalLinks = [
    {
      link: "https://scholar.google.com/citations?user=AHwQg4kAAAAJ&hl=en",
      name: "scholar",
    },
    { link: "https://github.com/mcnuttandrew", name: "github" },
    { link: "https://vis.social/@mcnutt", name: "mastodon" },
    { link: "https://www.mcnutt.in/assets/cv.pdf", name: "cv", noImage: true },
    { link: "", name: "amcnutt @ uw.edu", noImage: true },
  ];
</script>

<div
  class="flex-col cursor-pointer px-3 z-10 flex md:hidden bg-white shadow-md"
>
  <button
    on:click={toggleHeader}
    class="flex h-16 justify-between w-full items-center"
  >
    <h1 class="text-3xl">Andrew McNutt</h1>
    <div>
      <!-- hamburger menu -->
      <svg transform="rotate({$rotation})" width="25px" height="21px">
        <rect x="0" y="0" width="25" height="3" />
        <rect x="0" y="7" width="25" height="3" />
        <rect x="0" y="14" width="25" height="3" />
      </svg>
    </div>
  </button>
  {#if open}
    <div class="flex-col flex mb-3">
      {#each ["about", "publications", "projects"] as section (section)}
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
          {#if !x.noImage}
            <img
              src="icons/{x.name}.svg"
              alt="link to {x.name} account"
              class="ml-2 w-7"
            />
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
