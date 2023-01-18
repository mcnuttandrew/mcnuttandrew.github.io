<script lang="ts">
  import {NEWS, SELECTED_PUBLICATIONS} from '../constants';
  import ABOUT from '../text-chunks/about.md';
  import {marked} from 'marked';
  import Publication from './Publication.svelte';
</script>

<div class="">
  <div class="my-8 text-xl">
    {@html marked(ABOUT)}
  </div>

  <h2 class="text-2xl font-bold italic">SELECTED PUBLICATIONS</h2>
  <div class="mb-8">Some highlights of my recent research work</div>
  {#each SELECTED_PUBLICATIONS as pub}
    <Publication publication={pub} />
  {/each}

  <h2 class="text-2xl font-bold italic mt-8">NEWS</h2>
  <div class="about-section">
    {#each NEWS.slice(0, 10) as { date, content }}
      <div class="mb-2">
        <span class="italic font-bold text-right">{date}</span>
        {@html marked(content)}
      </div>
    {/each}
    <a href="/#/news">Older News</a>
  </div>
</div>
