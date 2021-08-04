<script>
  import {NEWS} from '../constants';
  import marked from 'marked';
  const groupedByYear = Object.entries(
    NEWS.reduce((acc, row) => {
      const [_, year] = row.date.split(' ');
      acc[year] = (acc[year] || []).concat(row);
      return acc;
    }, {}),
  ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));
</script>

<h1>NEWS</h1>
{#each groupedByYear as [year, items]}
  <h3>{year}</h3>
  {#each items as {date, content}}
    <div class="news-item">
      <div class="news-item-date">{date}</div>
      <div class="news-item-content">
        {@html marked(content)}
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
