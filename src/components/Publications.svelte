<script lang="ts">
  import { PUBLICATIONS } from "../constants";
  import store from "../store";
  import PublicationComponent from "./Publication.svelte";

  type sort = "type" | "year" | "paper name" | "theme";
  let currentSort: sort = "theme";
  const sorts: sort[] = ["theme", "type", "year", "paper name"];
  const typeOrder = [
    "conference / journal articles",
    "extended abstract / workshop papers",
    "posters",
    "theses / book chapters",
  ];

  const themeExplainers: Record<
    string,
    { title: string; description: string }
  > = {
    "vis-correctness": {
      title: "Visualization Correctness",
      description:
        "What does it mean for a visualization to be good? This line of work explores systems and strategies for evaluating the correctness of visualizations. Much of this work draws on the Algebraic Visualization Design framework as underlying theory.",
    },
    "creative-coding": {
      title: "Creative Coding",
      description:
        "This area explores the use of code in art. This includes questions like, as toolmakers how can we support artists? What sorts of interventions are useful for art? What about those for who are learning to code via art?",
    },
    "programming-interfaces": {
      title: "Programming Interfaces and Programming Interface Accessories",
      description:
        "How does one do things with computers (mediated by text)? This area explore various approaches and techniques for helping with programming tasks. A key question in this area is how do you make your assistant (be it a tool, a language, or a documentation system) more polite? (That is not domineering, respectful of your agency, and so on)",
    },
    "critical-perspectives": {
      title: "Critical Perspectives on Visualization",
      description:
        "An essential role for research in challenging paradigms, assumptions, and practices. This area explores perspectives on visualization that are critical of the status quo, and that seek to challenge and change the way we think about visualization.",
    },
    NA: {
      title: "Other and errata",
      description:
        "Some other things defy categorization! Or just don't fit with other categories (yet).",
    },
  };

  export function sortPublications(currentSort: sort) {
    if (currentSort === "theme") {
      return PUBLICATIONS.reduce(
        (acc, x) => {
          const theme = x.theme;
          if (!acc[theme]) {
            acc[theme] = [];
          }
          acc[theme].push({ ...x });
          return acc;
        },
        {} as Record<string, any>
      );
    }

    if (currentSort === "type" || currentSort === "year") {
      const yearOrder = Array.from(
        PUBLICATIONS.reduce((acc, x) => acc.add(x.year), new Set())
      ) as string[];
      return PUBLICATIONS.map((x) => ({ ...x, year: x.year })).reduce(
        (acc, row) => {
          acc[row[currentSort]].push({ ...row });
          return acc;
        },
        (currentSort === "type" ? typeOrder : yearOrder).reduce(
          (acc, key: string) => ({ ...acc, [key]: [] }),
          {} as Record<string, any>
        )
      );
    }

    return {
      publications: PUBLICATIONS.sort((a, b) => a.title.localeCompare(b.title)),
    };
  }

  $: sortedPublications = Object.entries(sortPublications(currentSort));
  $: if (currentSort === "year") {
    sortedPublications = sortedPublications.sort(
      (a, b) => Number(b[0]) - Number(a[0])
    );
  }
  $: if (currentSort === "theme") {
    sortedPublications = Object.keys(themeExplainers).map((theme) => {
      return [theme, sortedPublications.find((x) => x[0] === theme)?.[1] || []];
    });
  }
</script>

<div>
  <div class="flex w-full justify-between">
    {#each sorts as sort}
      <button
        class:font-bold={sort === currentSort}
        class="text-lg p-2 border-none text-cyan-800"
        on:click={() => {
          currentSort = sort;
        }}
      >
        Sort by {sort}
      </button>
    {/each}
  </div>
</div>

<div class="mb-16 max-w-fit">
  {#each sortedPublications as pubs}
    <h2 class="mt-8 text-2xl font-bold">
      {themeExplainers[pubs[0]]?.title || pubs[0].toUpperCase()}
    </h2>
    {#if themeExplainers[pubs[0]]}
      <p class="text-lg mb-4">{themeExplainers[pubs[0]].description}</p>
    {/if}
    <div class="flex flex-col">
      {#each pubs[1] as publication}
        {#if ($store.focusedPubs.length && $store.focusedPubs.join("----") === publication.topics.join("----")) || $store.focusedPubs.length === 0}
          <PublicationComponent bind:publication />
        {/if}
      {/each}
    </div>
  {/each}
</div>
