<script lang="ts">
  import {NEWS} from '../constants';
  import ABOUT from '../text-chunks/about.md';
  import {marked} from 'marked';
</script>

<div class="">
  <div class="my-8 text-xl">
    {@html marked(ABOUT)}
  </div>
  <h2 class="text-2xl font-bold italic">NEWS</h2>
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
