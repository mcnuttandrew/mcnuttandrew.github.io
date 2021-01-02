<script>
  import {PUBLICATIONS, BLOG_POSTS, PRESENTATIONS} from '../constants';

  import Publication from './Publication.svelte';
  import {classnames} from '../utils';

  let currentSort = 'type';
  const sorts = ['type', 'year', 'name'];
  const typeOrder = [
    'conference / journal article',
    'extended abstract / workshop paper',
    'poster',
    'book chapter',
    'thesis',
  ];
  const yearOrder = [2021, 2014, 2017, 2018, 2019, 2020, 2021];

  function sortPublications(currentSort) {
    if (currentSort === 'type' || currentSort === 'year') {
      return PUBLICATIONS.map((x) => ({...x, year: new Date(x.date).getFullYear()})).reduce(
        (acc, row) => {
          acc[row[currentSort]].push(row);
          return acc;
        },
        (currentSort === 'type' ? typeOrder : yearOrder).reduce((acc, key) => ({...acc, [key]: []}), {}),
      );
    }
    return {publications: PUBLICATIONS.sort((a, b) => a.title.localeCompare(b.title))};
  }
  $: sortedPublications = sortPublications(currentSort);
</script>

<style>
  .research-section {
    margin-bottom: 60px;
    max-width: fit-content;
  }
  .research-section h2 {
    margin-top: 30px;
  }
  .sort-button {
    background: none;
    border: none;
    text-decoration: underline;
  }
  .selected-button {
    font-weight: 900;
  }
</style>

<div>
  <h3>Sort by</h3>
  {#each sorts as sort}
    <button
      class={classnames({'sort-button': true, 'selected-button': sort === currentSort})}
      on:click={() => {
        currentSort = sort;
      }}>{sort}</button>
  {/each}
</div>

<div class="research-section">
  {#each Object.entries(sortedPublications) as pubs}
    <h2>{pubs[0].toUpperCase()}</h2>

    {#each pubs[1] as publication}
      <br />
      <Publication {publication} />
    {/each}
  {/each}
</div>
