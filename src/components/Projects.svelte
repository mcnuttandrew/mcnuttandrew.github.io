<script>
  import {PROJECTS} from '../constants';
  import {groupBy} from '../utils';
  const sections = Object.entries(groupBy(PROJECTS, 'section'))
    .map(([sectionName, rows]) => ({sectionName, rows}));
</script>

<style>
  img {
    margin-bottom: 30px;
    margin-top: 30px;
    max-height: 200px;
    max-width: 250px;
  }

  .flex-with-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .project-block {
    margin-bottom: 50px;
    margin-right: 10px;
    max-width: 250px;
  }

  p {
    font-size: 12px;
  }

  .img-container {
    align-items: flex-start;
    display: flex;
    height: 250px;
    width: 250px;
    justify-content: center;
  }
</style>

<div class="">
  {#each sections as {sectionName, rows} (sectionName)}
    <h1>{sectionName.toUpperCase()}</h1>
    <div class="flex-with-wrap">
      {#each rows as project (project.title)}
        <div class="project-block">
          <a href={project.link}>
            <div class="img-container">
              <img src="{project.imgLink}" alt="image for {project.title}"/>
            </div>
          </a>
          <h3>{project.title}</h3>
          <h5>{project.dates}</h5>
          <p>{project.text}</p>
        </div>
      {/each}
    </div>
  {/each}
</div>
