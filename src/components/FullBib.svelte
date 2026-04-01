<script lang="ts">
  import { PUBLICATIONS } from "../data/publications";
  import { buildBibTexEntry } from "../utils";
  import markdownit from "markdown-it";
  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
  });
</script>

<div class="p-4">
  <div class="border bg-stone-300 p-4">
    <code class="">
      {#each PUBLICATIONS as publication}
        {@html md.render(buildBibTexEntry(publication))}
      {/each}
    </code>
  </div>
</div>
