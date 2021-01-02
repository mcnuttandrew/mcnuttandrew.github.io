<script lang="ts">
  import Header from './components/Header.svelte';
  import MobileHeader from './components/MobileHeader.svelte';

  import About from './components/About.svelte';
  import Projects from './components/Projects.svelte';
  import Publications from './components/Publications.svelte';
  import Teaching from './components/Teaching.svelte';
  import ShowPage from './components/ShowPage.svelte';
  import CV from './components/CV.svelte';
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

  .header {
    align-items: center;
    /* background: url(https://raw.githubusercontent.com/mcnuttandrew/mcnuttandrew.github.io/master/assets/art-sub.png); */
    /* background-color: #0c140c; */
    /* background-position-y: -300px;
    background-size: 1200px 1200px; */
    display: flex;
    flex-direction: row;
    font-weight: 300;
    height: auto;
    justify-content: center;
    /* max-height: fit-content; */
    position: relative;
    /* width: 350px; */
  }
  .header h1,
  .header h3,
  .header a,
  .header a:visited {
    color: black;
  }

  .main-container {
    /* padding: 0 60px; */
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;
    overflow: scroll;
    width: auto;
  }

  .full-height {
    height: 100%;
  }
  .full-width {
    width: 100%;
  }

  .content-wrapper {
    justify-content: center;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    max-width: 700px;
    width: 700px;
  }

  .info-container {
    align-items: center;
    /* background: rgba(0, 0, 0, 0.2); */
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 50px;
    width: 100%;
  }
  @media screen and (max-width: 600px) {
    .header {
      display: none !important;
    }

    .main-container {
      padding: 0 20px;
    }

    .content-wrapper {
      width: unset;
      max-width: unset;
    }
  }
</style>

<div class="flex-down full-height">
  <div class="header flex-down">
    <div class="info-container">
      <h1>ANDREW MCNUTT</h1>
      <!-- <div>
        <a href="https://github.com/mcnuttandrew">GITHUB</a>
        <a href="https://twitter.com/_mcnutt_">TWITTER</a>
        <a href="https://www.mcnutt.in/assets/resume.pdf">CV</a>
      </div> -->
    </div>
  </div>
  <div class="flex-down full-width">
    <MobileHeader {currentSection} />
    <div class="main-container">
      <Header {currentSection} />
      <div class="content-wrapper">
        {#if currentSection === 'publications'}
          <Publications />
        {:else if currentSection === 'show-page'}
          <ShowPage />
        {:else if currentSection === 'cv'}
          <CV />
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
