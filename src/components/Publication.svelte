<script lang="ts">
  import {slide} from 'svelte/transition';
  import {addLinks} from '../utils';
  import {marked} from 'marked';
  import type {Publication} from '../constants';

  export let asTile = false;
  export let compact = false;
  export let publication: Publication;
  let abstractOpen = false;
  function toggleAbstract(e) {
    e.preventDefault();
    abstractOpen = !abstractOpen;
  }
  const keys = ['subtitle', 'journal', 'date'];
  const preppedKeys = keys.map((x) => publication[x]).filter((x) => x);
  const moreInfo = [addLinks(publication.authors), publication.date].filter((x) => x).join('. ');
  const knownPunc = new Set(['.', '?', '!']);
  const punc = knownPunc.has(publication.title[publication.title.length - 1]) ? '' : '.';
  const mdRepresentation = `**${publication.title}**${punc} _${publication.journal}_. ${moreInfo}`;
</script>

<div class="flex-col" class:mb-5={compact}>
  <div class="flex flex-col md:flex-row" class:leading-tight={compact}>
    <!-- the regular image -->
    {#if !compact && !asTile}
      <div class="flex flex-col-reverse p-2 h-full">
        <div class="rounded-xl uppercase font-bold italic">{publication.subtype}</div>
        <div class="items-start flex justify-center h-24 mr-1 w-24 min-w-24">
          <a href={publication.link}>
            <img
              alt="image drawn from {publication.title}"
              src={publication.imgLink}
              class="cursor-pointer h-24"
            />
          </a>
        </div>
      </div>
    {/if}
    <!-- the tile mode -->
    <div class="flex flex-col w-48  mr-8 mb-8" class:hidden={!asTile}>
      <img alt="image drawn from {publication.title}" src={publication.imgLink} class="cursor-pointer w-48" />
      <a href={publication.link} class="text-cyan-800 font-bold">{publication.title}</a>
    </div>
    <!-- the normal content -->
    <div class="flex-col w-full" class:hidden={asTile}>
      {#if !compact}
        <div class="info-container">
          <a href={publication.link} class="text-cyan-800 font-bold">{publication.title}</a>
          {#if publication.authors}
            <span>{@html marked(addLinks(publication.authors))}</span>
          {/if}
          <span>
            {#each preppedKeys as key}
              <span>{@html marked(key)}</span>
            {/each}
          </span>
        </div>
      {:else}
        <div>{@html marked(mdRepresentation)}</div>
      {/if}

      <div class="flex flex-wrap">
        {#each publication.links as { name, link }}<a class="publink text-cyan-800" href={link}>{name}</a
          >{/each}
        {#if publication.abstract}
          <div
            class="publink items-center text-cyan-800 cursor-pointer flex text-sm no-underline"
            on:click={toggleAbstract}
          >
            abstract ({abstractOpen ? '-' : '+'})
          </div>
        {/if}
      </div>
    </div>
  </div>
  {#if abstractOpen}
    <div class="text-xs" transition:slide>{@html marked(publication.abstract)}</div>
  {/if}
  <div class="rounded-xl uppercase font-bold italic " />
</div>

<style>
  .publink::after {
    content: '•';
    padding: 0 3px;
  }
  .publink:last-child::after {
    content: '';
  }
</style>
