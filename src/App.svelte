<script lang="ts">
  import "./app.css";

  import Header from "./components/Header.svelte";
  import MobileHeader from "./components/MobileHeader.svelte";

  import About from "./components/About.svelte";
  import Misc from "./components/Misc.svelte";
  import Publications from "./components/Publications.svelte";
  import Teaching from "./components/Teaching.svelte";
  import ShowPage from "./components/ShowPage.svelte";
  import News from "./components/News.svelte";
  import Zines from "./components/Zines.svelte";
  import NewsItem from "./components/NewsItem.svelte";
  import { NEWS } from "./constants";

  import { getRoute } from "./utils";

  let currentSection = getRoute();
  window.onhashchange = () => {
    currentSection = getRoute();
  };
  let news = NEWS.slice(0, 4);
</script>

<div
  class="h-full w-full md:justify-center flex flex-col md:flex-row leading-tight"
>
  <MobileHeader {currentSection} />
  <div
    class="h-full flex-col items-center justify-center hidden md:flex min-w-fit w-64 static"
  >
    <img
      src="converted-images/headshot.jpg"
      alt="head shot of andrew mcnutt"
      class="w-52 max-w-full h-auto rounded-full"
    />
    <h1 class="text-xl font-bold">Andrew McNutt</h1>
    <h3 class="text-xl">Assistant Professor</h3>
    <h3 class="text-xl">Visualization / HCI</h3>
    <h3 class="mb-2">University of Utah</h3>

    <div class="flex align space-between">
      <a class="mr-2" href="https://github.com/mcnuttandrew">
        <img src="icons/github.svg" alt="link to github account" />
      </a>
      <a href="https://scholar.google.com/citations?user=AHwQg4kAAAAJ&hl=en">
        <img src="icons/scholar.svg" alt="link to scholar page" />
      </a>
      <a href="https://vis.social/@mcnutt" rel="me" class="ml-2">
        <img
          src="icons/mastodon.png"
          alt="link to mastodon page"
          class="w-8"
          id="mastodon"
        />
      </a>
      <a class="ml-2 text-xl text-cyan-800 font-bold" href="./assets/cv.pdf">
        CV
      </a>
    </div>
    <h3 class="">amcnutt @ uw.edu</h3>
    <h2 class="text-2xl font-bold italic mt-8 hidden md:block text-left">
      NEWS
    </h2>
    <div class="about-section hidden md:block w-80">
      {#each news as newsItem}
        <NewsItem {newsItem} />
      {/each}
      <a href="/#/news">Older News</a>
    </div>
  </div>
  <div class="px-4 md:w-1/2">
    <Header {currentSection} />
    <div class="content-wrapper mb-11">
      {#if currentSection === "publications"}
        <Publications />
      {:else if currentSection === "show-page"}
        <ShowPage />
      {:else if currentSection === "misc"}
        <Misc />
      {:else if currentSection === "teaching"}
        <Teaching />
      {:else if currentSection === "news"}
        <News />
      {:else if currentSection === "zines"}
        <Zines />
      {:else}
        <About />
      {/if}
    </div>
  </div>
</div>
<noscript>test</noscript>
