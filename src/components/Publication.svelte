<script lang="ts">
  import { slide } from "svelte/transition";
  import { addLinks, buildBibTexEntry } from "../utils";
  import store from "../store";

  import markdownit from "markdown-it";
  export let showTopics = false;
  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
  });
  import type { Publication } from "../data/publications";

  export let publication: Publication;
  let abstractOpen = false;
  let bibTexOpen = false;
  function toggleAbstract(e: MouseEvent) {
    e.preventDefault();
    abstractOpen = !abstractOpen;
  }
  function toggleBibtex(e: MouseEvent) {
    e.preventDefault();
    bibTexOpen = !bibTexOpen;
  }
  $: altSpace = publication.imgDescription.at(-1) === "." ? "" : ".";
  $: altText = `${publication.imgDescription}${altSpace} The image is drawn from ${publication.title}.`;
  let copiedState = false;
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
            alt={altText}
            title={altText}
            src={publication.imgLink}
            class="cursor-pointer min-w-24"
          />
        </a>
      </div>
    </div>

    <!-- the normal content -->
    <div class="flex-col w-full">
      <div class="info-container">
        {#if publication.link && publication.link !== ""}
          <a href={publication.link} class="text-cyan-800 font-bold">
            {publication.title}
          </a>
        {:else}
          <span class="text-black-800 font-bold">{publication.title}</span>
        {/if}
        {#if publication.authors}
          <span>{@html md.render(addLinks(publication.authors))}</span>
        {/if}
        <span>
          <span>
            {`${publication.journal} ${publication.year} ${publication.note}`}
          </span>
        </span>
      </div>
      {#if showTopics}
        <div class="mt-1">
          Topics:
          {#each publication.topics as topic}
            <button
              class="text-xs px-2 py-1 mr-2 mb-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 no-underline"
              class:font-bold={$store.focusTopic.includes(topic)}
              class:bg-gray-400={$store.focusTopic.includes(topic)}
              class:text-white={$store.focusTopic.includes(topic)}
              on:click={() => {
                if (
                  JSON.stringify($store.focusTopic) === JSON.stringify([topic])
                ) {
                  store.focusSet("");
                } else {
                  store.focusSet(topic);
                }
              }}
            >
              {topic}
            </button>
          {/each}
        </div>
      {/if}
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
        <button
          class="publink items-center text-cyan-800 cursor-pointer flex text-sm no-underline"
          on:click={toggleBibtex}
        >
          bibtex ({bibTexOpen ? "-" : "+"})
        </button>
      </div>
    </div>
  </div>
  {#if abstractOpen}
    <div class="text-sm abstract-content" transition:slide>
      {@html md.render(publication.abstract)}
    </div>
  {/if}
  {#if bibTexOpen}
    <div class="text-sm abstract-content" transition:slide>
      {@html md.render(buildBibTexEntry(publication))}
      <!-- copy the text -->
      <button
        class="mt-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        class:font-bold={copiedState}
        on:click={() => {
          let entry = buildBibTexEntry(publication).slice(4, -5).trim(); // remove the <pre> tags

          navigator.clipboard.writeText(entry);
          copiedState = true;
          setTimeout(() => (copiedState = false), 2000);
        }}
      >
        {#if copiedState}Copied!{:else}Copy to clipboard{/if}
      </button>
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
