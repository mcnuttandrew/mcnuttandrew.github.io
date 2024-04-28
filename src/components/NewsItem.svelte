<script lang="ts">
  import markdownit from 'markdown-it';
  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true
  });
  import {NEWS} from '../constants';
  type NewsItem = (typeof NEWS)[0];
  export let newsItem: NewsItem;
</script>

<div class="mb-2">
  <span class="italic font-bold text-right">{newsItem.date}</span>
  {@html md.render(newsItem.content)}
</div>
