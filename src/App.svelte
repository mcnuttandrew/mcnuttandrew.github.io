<script>
  import Header from './components/Header.svelte';
  import MobileHeader from './components/MobileHeader.svelte';

  import About from './components/About.svelte';
  import Projects from './components/Projects.svelte';
  import Research from './components/Research.svelte';
  import Teaching from './components/Teaching.svelte';
  import ShowPage from './components/ShowPage.svelte';
  import {getRoute} from './utils';
  let currentSection = getRoute();
  window.onhashchange = () => {
    currentSection = getRoute();
  };
</script>

<style>
  h1 {
    color: purple;
  }

  :global(.flex) {
    display: flex;
  }

  :global(.flex-down) {
    display: flex;
    flex-direction: column;
  }

  .left-panel {
    background: url(https://raw.githubusercontent.com/mcnuttandrew/mcnuttandrew.github.io/master/assets/art-sub.png);
    background-color: #0c140c;
    background-position-y: -300px;
    background-size: 1200px 1200px;
    display: flex;
    flex-direction: column;
    font-weight: 300;
    height: auto;
    /* max-height: fit-content; */
    position: relative;
    width: 350px;
  }
  .left-panel h1,
  .left-panel h3,
  .left-panel a,
  .left-panel a:visited {
    color: white;
  }

  .right-panel {
    overflow: scroll;
    overflow-x: hidden;
    padding: 0 60px;
    width: auto;
    height: 100%;
  }

  .full-height {
    height: 100%;
  }
  .full-width {
    width: 100%;
  }

  @media screen and (max-width: 600px) {
    .left-panel {
      display: none !important;
    }

    .right-panel {
      padding: 0 20px;
    }
  }

  .content-wrapper {
    margin-top: 10px;
  }

  .info-container {
    align-items: center;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 50px;
    width: 100%;
  }
</style>

<div class="flex full-height">
  <div class="left-panel flex-down">
    <div class="info-container">
      <h1>ANDREW</h1>
      <h1>MCNUTT</h1>
      <h3>VISUALIZATION</h3>
      <div>
        <a href="https://github.com/mcnuttandrew">GITHUB</a>
        <a href="https://twitter.com/_mcnutt_">TWITTER</a>
        <a href="https://www.mcnutt.in/assets/resume.pdf">CV</a>
      </div>
    </div>
  </div>
  <div class="flex-down full-width">
    <MobileHeader {currentSection} />
    <div class="right-panel">
      <Header {currentSection} />
      <div class="content-wrapper">
        {#if currentSection === 'research'}
          <Research />
        {:else if currentSection === 'show-page'}
          <ShowPage />
        {:else if currentSection === 'projects'}
          <Projects />
        {:else if currentSection === 'teaching'}
          <Teaching />
        {:else}
          <About />
        {/if}
      </div>
    </div>
  </div>
</div>
