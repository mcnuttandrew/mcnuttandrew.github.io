<script lang="ts">
  import {ZINES} from '../constants';
</script>

<h1 class="mt-8 text-2xl font-bold">Zines</h1>

<div>
  I think zines are super cool! They are interesting and engaging way to to tell stories, create accessible
  lessons about obscure or complex or technical topics, or just make art. Here a bunch of zines I've made:

  <div class="flex flex-row flex-wrap mt-8">
    {#each ZINES as zine}
      <div class="zine-block">
        {#if zine.link}
          <a href={zine.link}>
            <div class="zine-img-container">
              <img src={zine.imgLink} alt="image for {zine.title}" />
            </div>
          </a>
        {:else}
          <div class="zine-img-container">
            <img src={zine.imgLink} alt="image for {zine.title}" />
          </div>
        {/if}
        <h3 class="text-xl">
          {#if zine.link}
            <a href={zine.link}>{zine.title}</a>
          {:else}
            <span>{zine.title}</span>
          {/if} ({zine.year})
        </h3>

        <p class="text-sm">{zine.text}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  img {
    max-height: 200px;
    max-width: 220px;
  }

  .zine-block {
    margin-bottom: 50px;
    margin-right: 10px;
    max-width: 220px;
  }

  .zine-img-container {
    align-items: center;
    display: flex;
    height: 200px;
    width: 200px;
    justify-content: center;
  }
</style>
