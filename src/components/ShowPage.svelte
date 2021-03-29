<script>
  import {PUBLICATIONS} from '../constants';
  import {getShowPage, addLinks} from '../utils';
  const pubName = getShowPage();
  const publication = PUBLICATIONS.find((d) => d.urlTitle === pubName);
  const keys = ['subtitle', 'date', 'journal'];
  import marked from 'marked';
</script>

<div class="flex-down publication">
  <div class="img-container">
    <img alt="image drawn from {publication.title}" src={publication.imgLink} />
  </div>
  <div class="flex-down">
    <a href={publication.link} class="title">{publication.title}</a>

    {#each keys as key}
      {#if publication[key]}<span>{publication[key]}</span>{/if}
    {/each}
    {#if publication.authors}
      <span>{@html marked(addLinks(publication.authors))}</span>
    {/if}
  </div>
  <div class="section-subtitle">Materials</div>
  <div class="materials">
    <div class="flex">
      {#each publication.links as {name, link}}<a class="publink" href={link}>{name}</a>{/each}
    </div>
  </div>
  <div class="section-subtitle">Abstract</div>
  <div class="abstract">{@html marked(publication.abstract)}</div>
</div>

<style>
  img {
    cursor: pointer;
    height: 500px;
    max-height: 500px;
    max-width: 500px;
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
    font-size: 20px;
  }

  .img-container {
    align-items: flex-start;
    display: flex;
    justify-content: center;
    height: 500px;
    margin-right: 5px;
    /* width: 500px; */
    width: 100%;
  }
  .publication {
    max-width: 100%;
    margin-bottom: 10px;
  }

  .section-subtitle {
    font-weight: bolder;
    margin-top: 20px;
  }

  .materials a {
    font-size: 20px;
  }

  .title {
    font-size: 30px;
  }
</style>
