<script lang="ts">
  import Header from './components/Header.svelte';
  import MobileHeader from './components/MobileHeader.svelte';

  import About from './components/About.svelte';
  import Projects from './components/Projects.svelte';
  import Publications from './components/Publications.svelte';
  import Teaching from './components/Teaching.svelte';
  import ShowPage from './components/ShowPage.svelte';
  import CV from './components/CV.svelte';
  import Zines from './components/Zines.svelte';
  import {getRoute} from './utils';
  let currentSection = getRoute();
  window.onhashchange = () => {
    currentSection = getRoute();
  };
</script>

<div class="flex-down full-height">
  <div class="header">
    <h1>ANDREW MCNUTT</h1>
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
        {:else if currentSection === 'zines'}
          <Zines />
        {:else}
          <About />
        {/if}
      </div>
    </div>
  </div>
</div>

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
    font-weight: 300;
    text-align: center;
  }
  .header h1 {
    color: black;
  }

  .main-container {
    align-items: center;
    display: flex;
    flex-direction: column;
    width: auto;
  }

  .full-height {
    height: 100%;
  }
  .full-width {
    width: 100%;
  }

  .content-wrapper {
    /* justify-content: center;
    display: flex;
    flex-direction: column; */
    margin-top: 10px;
    max-width: 700px;
    width: 700px;
  }

  @media screen and (max-width: 600px) {
    .header {
      display: none !important;
    }

    .main-container {
      padding: 0 20px;
    }

    .content-wrapper {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
