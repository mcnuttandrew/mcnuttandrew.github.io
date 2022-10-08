<script lang="ts">
  import Header from './components/Header.svelte';
  import MobileHeader from './components/MobileHeader.svelte';

  import About from './components/About.svelte';
  import Projects from './components/Projects.svelte';
  import Publications from './components/Publications.svelte';
  import Teaching from './components/Teaching.svelte';
  import ShowPage from './components/ShowPage.svelte';
  import CV from './components/CV.svelte';
  import News from './components/News.svelte';
  import Zines from './components/Zines.svelte';
  import {getRoute} from './utils';
  let currentSection = getRoute();
  window.onhashchange = () => {
    currentSection = getRoute();
  };
</script>

<div class="h-full w-full md:justify-center flex flex-col md:flex-row leading-tight">
  <MobileHeader {currentSection} />
  <div class="h-full flex-col items-center justify-center hidden md:flex min-w-fit w-64 static">
    <img
      src="converted-images/headshot.jpg"
      alt="headshot of andrew mcnutt"
      class="w-52 max-w-full h-auto rounded-full"
    />
    <h1 class="text-xl font-bold">Andrew McNutt</h1>
    <h3 class="text-xl">PhD Candidate</h3>
    <h3 class="text-xl">Visualization / HCI</h3>
    <h3 class="text-xl">UChicago CS</h3>
    <div class="flex align space-between">
      <a class="mr-2" href="https://twitter.com/_mcnutt_"
        ><img src="icons/twitter.svg" alt="link to twitter account" /></a
      >
      <a class="mr-2" href="https://github.com/mcnuttandrew"
        ><img src="icons/github.svg" alt="link to github account" /></a
      >
      <a href="https://scholar.google.com/citations?user=BFOrUoQAAAAJ"
        ><img src="icons/scholar.svg" alt="link to scholar page" /></a
      >
    </div>
  </div>
  <div class="px-4 md:w-1/2">
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
      {:else if currentSection === 'news'}
        <News />
      {:else if currentSection === 'zines'}
        <Zines />
      {:else}
        <About />
      {/if}
    </div>
  </div>
</div>

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  /* .w-xxxxxl {
    width: 54rem;
  } */
</style>
