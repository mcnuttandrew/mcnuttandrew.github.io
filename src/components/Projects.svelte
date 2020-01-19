<script>
  import {PROJECTS} from '../constants';
  import {groupBy} from '../utils';
  const sections = Object.entries(groupBy(PROJECTS, 'section')).map(
    ([sectionName, rows]) => ({sectionName, rows})
  );
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
              <img src={project.imgLink} alt="image for {project.title}" />
            </div>
          </a>
          <h3>{project.title}</h3>
          <h5>{project.dates}</h5>
          <div>
            {#if project.sourceLink}
              <a href={project.sourceLink}>
                <svg
                  class="github-icon"
                  fill="black"
                  preserveAspectRatio="xMidYMid meet"
                  height="1em"
                  width="1em"
                  viewBox="0 0 40 40">
                  <g>
                    <path
                      d="m20 0c-11 0-20 9-20 20 0 8.8 5.7 16.3 13.7 19 1 0.2
                      1.3-0.5 1.3-1 0-0.5 0-2 0-3.7-5.5
                      1.2-6.7-2.4-6.7-2.4-0.9-2.3-2.2-2.9-2.2-2.9-1.9-1.2
                      0.1-1.2 0.1-1.2 2 0.1 3.1 2.1 3.1 2.1 1.7 3 4.6 2.1 5.8
                      1.6 0.2-1.3 0.7-2.2 1.3-2.7-4.5-0.5-9.2-2.2-9.2-9.8 0-2.2
                      0.8-4 2.1-5.4-0.2-0.5-0.9-2.6 0.2-5.3 0 0 1.7-0.5 5.5 2
                      1.6-0.4 3.3-0.6 5-0.6 1.7 0 3.4 0.2 5 0.7 3.8-2.6 5.5-2.1
                      5.5-2.1 1.1 2.8 0.4 4.8 0.2 5.3 1.3 1.4 2.1 3.2 2.1 5.4 0
                      7.6-4.7 9.3-9.2 9.8 0.7 0.6 1.4 1.9 1.4 3.7 0 2.7 0 4.9 0
                      5.5 0 0.6 0.3 1.2 1.3 1 8-2.7 13.7-10.2 13.7-19
                      0-11-9-20-20-20z" />
                  </g>
                </svg>
              </a>
            {/if}
            {#if project.link}
              <a href={project.link}>Live</a>
            {/if}
          </div>
          <p>{project.text}</p>
        </div>
      {/each}
    </div>
  {/each}
</div>
