<script>
  import {slide} from 'svelte/transition';
  import {addLinks} from '../utils';
  import marked from 'marked';

  export let noImg = false;
  export let publication;
  let abstractOpen = false;
  function toggleAbstract(e) {
    e.preventDefault();
    abstractOpen = !abstractOpen;
  }
  const keys = ['subtitle', 'journal', 'date'];
</script>

<div class="flex-down publication">
  <div class="content-container">
    {#if !noImg}
      <div class="pub-img-holder">
        <div class="pub-img-label">{publication.subtype}</div>
        <div class="img-container">
          <img alt="image drawn from {publication.title}" src={publication.imgLink} />
        </div>
      </div>
    {/if}
    <div class="flex-down">
      <a href={publication.link}>{publication.title}</a>
      {#if publication.authors}
        <span>{@html marked(addLinks(publication.authors))}</span>
      {/if}
      <span>
        {#each keys as key}
          {#if publication[key]}<span>{@html marked(publication[key])}</span>{/if}
        {/each}
      </span>

      <div class="flex flex-wrap">
        {#each publication.links as {name, link}}<a class="publink" href={link}>{name}</a>{/each}
        {#if publication.abstract}
          <div class="publink" on:click={toggleAbstract}>abstract ({abstractOpen ? '-' : '+'})</div>
        {/if}
      </div>
    </div>
  </div>
  {#if abstractOpen}
    <div class="abstract" transition:slide>{@html marked(publication.abstract)}</div>
  {/if}
</div>

<style>
  img {
    cursor: pointer;
    height: 100px;
    max-height: 100px;
    max-width: 100px;
  }
  .flex {
    display: flex;
  }

  .flex-down {
    display: flex;
    flex-direction: column;
  }
  .flex-wrap {
    flex-wrap: wrap;
  }
  .publink {
    align-items: center;
    color: rgb(0, 100, 200);
    cursor: pointer;
    display: flex;
    font-size: 13px;
    text-decoration: none;
  }
  .publink::after {
    content: '•';
    padding: 0 3px;
  }
  .publink:last-child::after {
    content: '';
  }

  .abstract {
    font-size: 12px;
  }

  .img-container {
    align-items: flex-start;
    display: flex;
    justify-content: center;
    height: 100px;
    margin-right: 5px;
    width: 100px;
    min-width: 100px;
  }
  .publication {
    max-width: 100%;
  }

  .content-container {
    display: flex;
  }

  .pub-img-holder {
    display: flex;
    flex-direction: column-reverse;
    padding: 10px;
    height: 100%;
  }
  .pub-img-label {
    border-radius: 10px;
    text-transform: uppercase;
    font-weight: 900;
    font-style: italic;
  }
  @media screen and (max-width: 600px) {
    .content-container {
      flex-direction: column;
    }
  }
</style>
