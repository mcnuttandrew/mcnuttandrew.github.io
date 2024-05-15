<script lang="ts">
  import {NEWS} from '../constants';
  import markdownit from 'markdown-it';
  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true
  });
  const groupedByYear = Object.entries(
    NEWS.reduce((acc, row) => {
      const [_, year] = row.date.split(' ');
      acc[year] = (acc[year] || []).concat(row);
      return acc;
    }, {})
  ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA)) as unknown as [number, (typeof NEWS)[0][]][];
</script>

<h1>NEWS</h1>
{#each groupedByYear as [year, items]}
  <h3>{year}</h3>
  {#each items as { date, content }}
    <div class="news-item">
      <div class="news-item-date">{date}</div>
      <div class="news-item-content">
        {@html md.render(content)}
      </div>
    </div>
  {/each}
{/each}

<style>
  .news-item {
    display: flex;
    margin-bottom: 10px;
  }
  .news-item-date {
    /* border: thin solid red; */
    font-style: italic;
    font-weight: 500;
    width: 100px;
    min-width: 100px;
    max-width: 100px;
    margin-right: 8px;
    word-spacing: 9999999px;
    text-align: right;
  }

  @media screen and (max-width: 600px) {
    .news-item {
      flex-direction: column;
    }
    .news-item-date {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
    }
  }
</style>
