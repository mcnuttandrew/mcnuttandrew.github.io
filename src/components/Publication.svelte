<script lang="ts">
  import { slide } from "svelte/transition";
  import { addLinks } from "../utils";
  import markdownit from "markdown-it";
  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
  });
  import type { Publication } from "../data/publications";

  export let publication: Publication;
  let abstractOpen = false;
  function toggleAbstract(e: MouseEvent) {
    e.preventDefault();
    abstractOpen = !abstractOpen;
  }
  const keys = ["subtitle", "journal"] as const;
  $: preppedKeys = keys.map((x) => publication[x]).filter((x) => x) as string[];
</script>

<div class="flex-col mb-10" transition:slide>
  <div class="flex flex-col md:flex-row">
    <!-- the regular image -->
    <div class="h-full hidden md:block">
      <div
        class="flex justify-center w-24 min-w-24 mx-6 max-h-24 h-24 overflow-hidden items-center"
      >
        <a href={publication.link}>
          <img
            alt="image drawn from {publication.title}"
            src={publication.imgLink}
            class="cursor-pointer min-w-24"
          />
        </a>
      </div>
    </div>

    <!-- the normal content -->
    <div class="flex-col w-full">
      <div class="info-container">
        <a href={publication.link} class="text-cyan-800 font-bold">
          {publication.title}
        </a>
        {#if publication.authors}
          <span>{@html md.render(addLinks(publication.authors))}</span>
        {/if}
        <span>
          {#each preppedKeys as key}
            <span>{@html md.render(key)}</span>
          {/each}
        </span>
      </div>

      <div class="flex flex-wrap">
        {#each publication.links as { name, link }}<a
            class="publink text-cyan-800"
            href={link}
          >
            {name}
          </a>{/each}
        {#if publication.abstract}
          <button
            class="publink items-center text-cyan-800 cursor-pointer flex text-sm no-underline"
            on:click={toggleAbstract}
          >
            abstract ({abstractOpen ? "-" : "+"})
          </button>
        {/if}
      </div>
    </div>
  </div>
  {#if abstractOpen}
    <div class="text-sm abstract-content" transition:slide>
      {@html md.render(publication.abstract)}
    </div>
  {/if}
  <div class="rounded-xl uppercase font-bold italic" />
</div>

<style>
  .publink::after {
    content: "•";
    padding: 0 3px;
  }
  .publink:last-child::after {
    content: "";
  }
</style>
