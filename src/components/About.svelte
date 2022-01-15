<script>
  import {NEWS} from '../constants';
  import ABOUT from '../text-chunks/about.md';
  import {marked} from 'marked';
</script>

<div>
  <div class="about-section">
    <div class="description">
      {@html marked(ABOUT)}
    </div>
    <img alt="me in canyonlands utah" class="self-pic" src="assets/desert-pic.jpg" />
  </div>
  <h2>NEWS</h2>
  <div class="about-section">
    {#each NEWS.slice(0, 10) as { date, content }}
      <div class="news-item">
        <div class="news-item-date">{date}</div>
        <div class="news-item-content">
          {@html marked(content)}
        </div>
      </div>
    {/each}
    <a href="/#/news">Older News</a>
  </div>
</div>

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
    width: 100px;
    min-width: 100px;
    max-width: 100px;
    margin-right: 8px;
    word-spacing: 9999999px;
    text-align: right;
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
