<script>
  export let publication;
  let abstractOpen = false;
  function toggleAbstract(e) {
    e.preventDefault();
    abstractOpen = !abstractOpen;
  }
  const keys = ['subtitle', 'date', 'authors', 'journal']
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
    display: flex;
    font-size: 13px;
    text-decoration: none;
  }
  .publink::after {
    content: '•';
    padding: 0 3px;
  }
  .publink:last-of-type::after {
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
  }
  .publication {
    max-width: 100%;
    margin-bottom: 10px;
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
    <div class="img-container">
      <img src="{publication.imgLink}" />
    </div>
    <div class="flex-down">
      <a href="{publication.link}">{publication.title}</a>

      {#each keys as key}
        {#if publication[key]}
          <span>{publication[key]}</span>
        {/if}
      {/each}

      <div class="flex">
        {#each publication.links as {name, link}}
          <a class="publink" href={link}>{name}</a>
        {/each}
        {#if publication.abstract}
          <a
            class="publink"
            href=""
            on:click={toggleAbstract}>abstract ({abstractOpen ? '-' : '+'})</a>
        {/if}
      </div>

    </div>
  </div>
  {#if abstractOpen}
  <div class="abstract">
    {publication.abstract}
  </div>
  {/if}
</div>
