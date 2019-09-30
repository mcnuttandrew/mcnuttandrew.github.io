<script>
  import {PUBLICATIONS, BLOG_POSTS} from '../constants';
  import Publication from './Publication.svelte';
</script>

<style>
  .research-section {
    margin-bottom: 60px;
    max-width: fit-content;
  }
</style>

<div>
  <h1>PUBLICATIONS</h1>
  <div class="research-section">
    {#each PUBLICATIONS as publication}
      <Publication publication={publication}/>
    {/each}
  </div>

  <h1>BLOG POSTS</h1>
  <div class="research-section">
    {#each BLOG_POSTS as publication}
      <Publication publication={publication}/>
    {/each}
  </div>
</div>
