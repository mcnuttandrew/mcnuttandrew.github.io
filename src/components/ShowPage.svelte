<script>
  import {PUBLICATIONS} from '../constants';
  import {getShowPage} from '../utils';
  const pubName = getShowPage();
  const publication = PUBLICATIONS.find(d => d.urlTitle === pubName);
  const keys = ['subtitle', 'date', 'authors', 'journal'];
</script>

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
  div.publink::after {
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

<div class="flex-down publication">
  <div class="img-container">
    <img alt="image drawn from {publication.title}" src={publication.imgLink} />
  </div>
  <div class="flex-down">
    <a href={publication.link} class="title">{publication.title}</a>

    {#each keys as key}
      {#if publication[key]}
        <span>{publication[key]}</span>
      {/if}
    {/each}

  </div>
  <div class="section-subtitle">Materials</div>
  <div class="materials">
    <div class="flex">
      {#each publication.links as {name, link}}
        <a class="publink" href={link}>{name}</a>
      {/each}
    </div>
  </div>
  <div class="section-subtitle">Abstract</div>
  <div class="abstract">{publication.abstract}</div>
</div>
