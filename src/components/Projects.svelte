<script>
  import {PROJECTS} from '../constants';
  let selectedProjects = PROJECTS;
  const tagCounts = PROJECTS.reduce((acc, {tags}) => {
    tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});
  let selectedTags = Object.keys(tagCounts).reduce((acc, row) => ({...acc, [row]: true}), {});

  function filterProjects(selectedTags) {
    selectedProjects = PROJECTS.filter(({tags}) => tags.some((tag) => selectedTags[tag]));
  }
  function toggleTag(tag) {
    selectedTags[tag] = !selectedTags[tag];
    filterProjects(selectedTags);
  }
  function reset() {
    Object.keys(selectedTags).forEach((tag) => {
      selectedTags[tag] = true;
    });
    filterProjects(selectedTags);
  }
</script>

<div class="">
  <div class="flex-down">
    <h3>Tags</h3>
    <div class="flex">
      {#each Object.keys(selectedTags) as tag}
        <div
          class="tag tag-{tag} {selectedTags[tag] ? 'selected-tag' : 'unselected-tag'}"
          on:click={() => toggleTag(tag)}
        >
          {tag} - {tagCounts[tag]}
        </div>
      {/each}
      <div on:click={reset} class="tag tag-reset">reset</div>
    </div>
  </div>
  <h3>Projects</h3>
  <div class="flex-with-wrap">
    {#each selectedProjects as project (project.title)}
      <div class="project-block">
        <a href={project.link}>
          <div class="img-container"><img src={project.imgLink} alt="image for {project.title}" /></div>
        </a>
        <h3>{project.title}</h3>
        <h5>{project.dates}</h5>
        <div>
          {#if project.sourceLink}
            <a href={project.sourceLink}>
              <img alt="github icon" src="icons/github.svg" class="gh-icon" />
            </a>
          {/if}
          {#if project.link}<a href={project.link}>Live</a>{/if}
        </div>
        <p>{project.text}</p>
        <div class="flex">
          {#each project.tags as tag}
            <div
              class="tag tag-{tag} {selectedTags[tag] ? 'selected-tag' : 'unselected-tag'}"
              on:click={() => toggleTag(tag)}
            >
              {tag}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  img {
    /* margin-bottom: 30px;
    margin-top: 30px; */
    /* height: 200px; */
    max-height: 200px;
    max-width: 220px;
  }

  .flex-with-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .project-block {
    margin-bottom: 50px;
    margin-right: 10px;
    max-width: 220px;
  }

  p {
    font-size: 12px;
  }

  .img-container {
    align-items: center;
    display: flex;
    height: 200px;
    width: 200px;
    justify-content: center;
  }

  .gh-icon {
    padding: 0;
    margin: 0;
    height: 18px;
  }

  .tag {
    border-radius: 7px;
    color: white;
    cursor: pointer;
    font-size: 10px;
    font-weight: 800;
    margin-right: 3px;
    padding: 5px;
  }

  .tag-visualization {
    background: tomato;
  }
  .tag-tech {
    background: cadetblue;
  }
  .tag-art {
    background: rebeccapurple;
  }
  .tag-reset {
    background: grey;
  }
  .unselected-tag {
    opacity: 0.5;
  }
</style>
