<script lang="ts">
  import {PUBLICATIONS} from '../constants';
  import Publication from './Publication.svelte';

  type sort = 'type' | 'year' | 'paper name' | 'tile';
  let currentSort: sort = 'type';
  const sorts: sort[] = ['type', 'year', 'paper name'];
  const typeOrder = [
    'conference / journal articles',
    'extended abstract / workshop papers',
    'posters',
    'theses / book chapters'
  ];

  export function sortPublications(currentSort: sort) {
    if (currentSort === 'type' || currentSort === 'year') {
      const yearOrder = Array.from(PUBLICATIONS.reduce((acc, x) => acc.add(x.year), new Set())) as string[];
      return PUBLICATIONS.map((x) => ({...x, year: x.year})).reduce(
        (acc, row) => {
          acc[row[currentSort]].push(row);
          return acc;
        },
        (currentSort === 'type' ? typeOrder : yearOrder).reduce(
          (acc, key: string) => ({...acc, [key]: []}),
          {} as Record<string, any>
        )
      );
    }
    if (currentSort === 'tile') {
      return {'': PUBLICATIONS.sort((a, b) => a.title.localeCompare(b.title))};
    }
    return {publications: PUBLICATIONS.sort((a, b) => a.title.localeCompare(b.title))};
  }

  $: sortedPublications = Object.entries(sortPublications(currentSort));
  $: if (currentSort === 'year') {
    sortedPublications = sortedPublications.sort((a, b) => Number(b[0]) - Number(a[0]));
  }
</script>

<div>
  <div class="flex w-full justify-between">
    <button
      class:font-bold={currentSort === 'tile'}
      class="text-lg p-2 border-none text-cyan-800"
      on:click={() => {
        currentSort = 'tile';
      }}>As tiles</button
    >
    {#each sorts as sort}
      <button
        class:font-bold={sort === currentSort}
        class="text-lg p-2 border-none text-cyan-800"
        on:click={() => {
          currentSort = sort;
        }}>Sort by {sort}</button
      >
    {/each}
  </div>
</div>

<div class="mb-16 max-w-fit">
  {#each sortedPublications as pubs}
    <h2 class="mt-8 text-2xl font-bold">{pubs[0].toUpperCase()}</h2>

    <div
      class="flex"
      class:flex-col={currentSort !== 'tile'}
      class:flex-wrap={currentSort === 'tile'}
      class:justify-between={currentSort === 'tile'}
    >
      {#each pubs[1] as publication}
        <br />
        <Publication {publication} asTile={currentSort === 'tile'} />
      {/each}
    </div>
  {/each}
</div>
