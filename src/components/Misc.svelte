<script lang="ts">
  import { MISC } from "../constants";
  let selectedMisc = MISC;
  import markdownit from "markdown-it";
  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
  });
</script>

<div class="px-4">
  <p class="my-6">
    This is a small collection of things I've made for various tech,
    visualization, or artistic purposes. Some of them are serious, some of them
    are fanciful. I made some of them for fun, while others are standalone
    artifacts from academic work.
  </p>
  <div class="flex flex-wrap justify-around">
    {#each selectedMisc as project (project.title)}
      <div class="project-block">
        <a href={project.link}>
          <div class="img-container">
            <img src={project.imgLink} alt="image for {project.title}" />
          </div>
        </a>
        <h3 class="text-xl">{project.title}</h3>
        <!-- <h5>{project.dates}</h5> -->
        <div class="flex justify-start items-center">
          {#if project.sourceLink}
            <a href={project.sourceLink} class="mr-3">
              <img
                alt="github icon"
                src="icons/github.svg"
                class="gh-icon p-0 m-0 h-4"
              />
            </a>
          {/if}
          {#if project.link}<a href={project.link}>Live</a>{/if}
        </div>
        <p class="text-sm">{@html md.render(project.text)}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  img {
    max-height: 200px;
    max-width: 220px;
  }

  .project-block {
    margin-bottom: 50px;
    margin-right: 10px;
    max-width: 220px;
  }

  .img-container {
    align-items: center;
    display: flex;
    height: 200px;
    width: 200px;
    justify-content: center;
  }
</style>
