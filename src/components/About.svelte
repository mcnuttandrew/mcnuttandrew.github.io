<script>
  import {ABOUT, HISTORY, INTERESTS, NEWS} from '../constants';
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
    margin-bottom: 10px;
  }
  .news-item-date {
    font-style: italic;
  }
</style>

<div>
  <h1>INTRODUCTION</h1>
  <div class="about-section">
    <div>{ABOUT} {HISTORY} {INTERESTS}</div>
    <img
      alt="picture of me in canyonlands utah"
      class="self-pic"
      src="assets/desert-pic.jpg" />
  </div>
  <h1>NEWS</h1>
  <div class="about-section">
    {#each NEWS as {date, content}}
      <div class="news-item">
        <span class="news-item-date">{date}:</span>
        <span>{content}</span>
      </div>
    {/each}
  </div>
</div>
