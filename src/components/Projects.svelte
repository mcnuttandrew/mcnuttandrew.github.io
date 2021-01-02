<script>
  import {PROJECTS} from '../constants';
  import {groupBy} from '../utils';
  const sections = Object.entries(groupBy(PROJECTS, 'section')).map(([sectionName, rows]) => ({
    sectionName,
    rows,
  }));
</script>

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
</style>

<div class="">
  {#each sections as {sectionName, rows} (sectionName)}
    <h2>{sectionName.toUpperCase()}</h2>
    <div class="flex-with-wrap">
      {#each rows as project (project.title)}
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
        </div>
      {/each}
    </div>
  {/each}
</div>
