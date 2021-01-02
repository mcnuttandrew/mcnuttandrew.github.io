<script>
  import {slide} from 'svelte/transition';
  import {flip} from 'svelte/animate';

  import {COLLABORATOR_LINKS} from '../constants';
  import marked from 'marked';

  export let noImg = false;
  export let publication;
  let abstractOpen = false;
  function toggleAbstract(e) {
    e.preventDefault();
    abstractOpen = !abstractOpen;
  }
  const keys = ['subtitle', 'journal', 'date'];
  function addLinks(authors) {
    return Object.entries(COLLABORATOR_LINKS).reduce((str, [key, link]) => {
      return str.replace(key, `[${key}](${link})`);
    }, authors.replace('Andrew McNutt', '__Andrew McNutt__'));
    return done;
  }
</script>

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
    margin-bottom: 20px;
  }

  .content-container {
    display: flex;
  }
  @media screen and (max-width: 600px) {
    .content-container {
      flex-direction: column;
    }
  }
</style>

<div class="flex-down publication">
  <div class="content-container">
    {#if !noImg}
      <div class="img-container">
        <img alt="image drawn from {publication.title}" src={publication.imgLink} />
      </div>
    {/if}
    <div class="flex-down">
      <a href={publication.link}>{publication.title}</a>
      {#if publication.authors}
        <span>{@html marked(addLinks(publication.authors))}</span>
      {/if}
      <span>
        {#each keys as key}
          {#if publication[key]}<span>{publication[key]} </span>{/if}
        {/each}
      </span>

      <div class="flex">
        {#each publication.links as {name, link}}<a class="publink" href={link}>{name}</a>{/each}
        {#if publication.abstract}
          <div class="publink" on:click={toggleAbstract}>abstract ({abstractOpen ? '-' : '+'})</div>
        {/if}
      </div>
    </div>
  </div>
  {#if abstractOpen}
    <div class="abstract" transition:slide>{publication.abstract}</div>
  {/if}
</div>
