<script lang="ts">
  import NewsItem from "./NewsItem.svelte";
  import { NEWS, SELECTED_PUBLICATIONS } from "../constants";
  // @ts-ignore
  import ABOUT from "../text-chunks/about.md?raw";
  import markdownit from "markdown-it";
  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
  });
  import Publication from "./Publication.svelte";

  let news = NEWS.slice(0, 4);
</script>

<div class="">
  <div class="my-8 text-xl md-container">
    {@html md.render(ABOUT)}
  </div>

  <h2 class="text-2xl font-bold italic">SELECTED PUBLICATIONS</h2>
  <div class="mb-8">Some highlights of my recent research work</div>
  {#each SELECTED_PUBLICATIONS as pub}
    <Publication publication={pub} />
  {/each}

  <h2 class="text-2xl font-bold italic mt-8 md:hidden">NEWS</h2>
  <div class="about-section md:hidden">
    {#each news as newsItem}
      <NewsItem {newsItem} />
    {/each}
    <a href="/#/news">Older News</a>
  </div>
</div>
