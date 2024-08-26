<script lang="ts">
  export let content: string;
  import markdownit from "markdown-it";
  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
  });
</script>

<div class="my-8 text-xl md-container">
  {@html md.render(content)}
</div>
