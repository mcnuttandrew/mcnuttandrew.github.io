<script>
  // import {ABOUT, HISTORY, INTERESTS, NEWS} from '../constants';
  import {NEWS} from '../constants';
  import ABOUT from '../text-chunks/about.md';
  // const ABOUT = require('../text-chunks/about.md');
  import marked from 'marked';
</script>

<style>
  .about-section {
    margin-bottom: 60px;
  }

  .self-pic {
    margin-top: 10px;
    width: 100%;
  }
  .news-item {
    display: flex;
    margin-bottom: 10px;
  }
  .news-item-date {
    /* border: thin solid red; */
    font-style: italic;
    font-weight: 500;
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    margin-right: 5px;
    /* white-space: normal; */
  }

  .description {
    font-size: 20px;
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

<div>
  <div class="about-section">
    <div class="description">
      {@html marked(ABOUT)}
    </div>
    <img
      alt="picture of me in canyonlands utah"
      class="self-pic"
      src="assets/desert-pic.jpg" />
  </div>
  <h2>NEWS</h2>
  <div class="about-section">
    {#each NEWS as {date, content}}
      <div class="news-item">
        <div class="news-item-date">{date}:</div>
        <div class="news-item-content">
          {@html marked(content)}
        </div>
      </div>
    {/each}
  </div>
</div>
