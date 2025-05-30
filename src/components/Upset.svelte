<script lang="ts">
  import { extractCombinations } from "@upsetjs/bundle";
  import { PUBLICATIONS } from "../constants";
  import { onMount } from "svelte";
  import { scaleLinear, scaleBand } from "d3-scale";
  import store from "../store";

  type Combination = {
    cardinality: number;
    degree?: number;
    name: string;
    elems: { title: string; sets: string[] }[];
    type: "set" | "intersection";
    sets?: Set<string>;
  };
  $: combinations = [] as Combination[];
  $: sets = [] as Combination[];
  onMount(() => {
    const preSets = PUBLICATIONS.map((pub) => ({
      name: pub.title,
      sets: pub.topics,
    })) as {
      name: string;
      sets: string[];
    }[];
    // buildSets(preSets);

    const result = extractCombinations(preSets);
    sets = result.sets as unknown as Combination[];
    sets.sort(
      (a, b) => b.cardinality - a.cardinality || a.name.localeCompare(b.name)
    );
    combinations = result.combinations as unknown as Combination[];
    combinations.forEach((c) => {
      c.sets = new Set(Array.from((c as any).sets).map((x: any) => x.name));
    });
    // combinations = combinations.filter((x) => x.cardinality > 1);
    combinations.sort(
      (a, b) => b.cardinality - a.cardinality || a.name.localeCompare(b.name)
    );
  });
  //   function buildSets(sets: { name: string; sets: string[] }[]): {
  //     sets: Combination[];
  //     combinations: Combination[];
  //   } {
  //     // computer set info
  //     const setCategories = sets.reduce(
  //       (acc, set) => {
  //         set.sets.forEach((s) => {
  //           if (!acc[s]) {
  //             acc[s] = new Set<string>();
  //           }
  //           acc[s].add(set.name);
  //         });
  //         return acc;
  //       },
  //       {} as Record<string, Set<string>>
  //     );
  //     console.log(setCategories);
  //     return;
  //   }

  const width = 300;
  const topBarHeight = 150;

  $: setSizeScale = scaleLinear()
    .domain([0, Math.max(...sets.map((s) => s.cardinality))])
    .range([0, topBarHeight]);

  $: setScale = scaleBand()
    .domain(sets.map((s) => s.name))
    .range([0, width])
    .padding(0.1);

  const rowSize = 25;
  const interSectionWidth = 50;
  $: height = rowSize * combinations.length;
  $: intersectionSizeScale = scaleLinear()
    .domain([0, Math.max(...combinations.map((c) => c.cardinality))])
    .range([0, interSectionWidth]);
  $: intersectionScale = scaleBand()
    .domain(combinations.map((c) => c.name))
    .range([0, height])
    .padding(0.1);

  const sectionMargin = 20;
  const margins = { left: 20, right: 0, top: 20, bottom: 0 };

  $: focusedIntersection = null as string | null;
  $: focusedSets = [] as string[];
  const barColor = "oklch(87.2% 0.01 258.338)";
  const circleColor = "oklch(96.7% 0.003 264.542)";
  const selectedColor = "oklch(44.6% 0.03 256.802)";
  const highlightColor = "oklch(88.2% 0.059 254.128)";
</script>

<div class="block">
  <svg
    width={width + interSectionWidth + margins.left + margins.right}
    height={height + topBarHeight + margins.top + margins.bottom}
  >
    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <!-- top bar chart  -->
      <rect x={0} y={0} {width} height={topBarHeight} fill="white"></rect>
      <g class="sets">
        {#each sets as set}
          <rect
            x={setScale(set.name) || 0}
            y={topBarHeight - setSizeScale(set.cardinality)}
            width={setScale.bandwidth()}
            height={setSizeScale(set.cardinality)}
            fill={focusedSets.includes(set.name) ? selectedColor : barColor}
          />

          <g
            transform="translate({(setScale(set.name) || 0) +
              setScale.bandwidth() / 2}, {topBarHeight}) rotate(-90)"
          >
            <text font-size="10" y={2} x={5} text-anchor="start">
              {set.name}
            </text>
          </g>
        {/each}
      </g>

      <!-- set names -->

      <!-- intersections -->
      <g transform={`translate(0, ${topBarHeight + sectionMargin * 1})`}>
        {#each combinations as combination}
          <!-- background row -->
          <rect
            x={0}
            y={(intersectionScale(combination.name) || 0) -
              intersectionScale.bandwidth() / 2}
            width={width + interSectionWidth}
            height={intersectionScale.bandwidth()}
            fill={focusedIntersection === combination.name
              ? highlightColor
              : "white"}
          />

          <!-- labels -->
          {#each sets as set}
            <!-- interaction target -->
            <g
              transform={`translate(${setScale(set.name) || 0}, ${intersectionScale(combination.name)})`}
            >
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <rect
                x={0}
                y={-intersectionScale.bandwidth() / 2}
                width={setScale.bandwidth()}
                height={intersectionScale.bandwidth()}
                fill="white"
                opacity="0"
                on:mouseenter={() => {
                  if ($store.focusedPubs.length) {
                    return;
                  }
                  focusedSets = Array.from(combination.sets || []).filter(
                    (s) => s !== set.name
                  );
                  focusedIntersection = combination.name;
                }}
                on:click={() => {
                  console.log(combination);
                  focusedSets = Array.from(combination.sets || []).filter(
                    (s) => s !== set.name
                  );
                  focusedIntersection = combination.name;
                  if (
                    focusedSets.join(",") === $store.focusedPubs.join(",") &&
                    focusedSets.length
                  ) {
                    store.setPubs([]);
                  } else {
                    store.setPubs(focusedSets);
                  }
                }}
              />
              <circle
                cx={setScale.bandwidth() / 2}
                cy={0}
                r={8}
                class="pointer-events-none"
                fill={combination.sets?.has(set.name)
                  ? selectedColor
                  : circleColor}
              />
            </g>
          {/each}
          {#if (combination?.degree || 0) > 1}
            <line
              x1={Math.min(
                ...Array.from(combination.sets || []).map(
                  (s) => setScale(s) || 0
                )
              ) + 5}
              y1={intersectionScale(combination.name) || 0}
              x2={Math.max(
                ...Array.from(combination.sets || []).map(
                  (s) => setScale(s) || 0
                )
              ) + 5}
              y2={intersectionScale(combination.name) || 0}
              stroke={selectedColor}
              stroke-width="5"
            />
          {/if}
          <!-- histogram -->
          <rect
            x={width}
            y={(intersectionScale(combination.name) || 0) -
              intersectionScale.bandwidth() / 2}
            width={intersectionSizeScale(combination.cardinality)}
            height={intersectionScale.bandwidth()}
            fill={focusedIntersection === combination.name
              ? selectedColor
              : "lightgray"}
          />
        {/each}
      </g>
    </g>
  </svg>
</div>

<style>
  svg {
    overflow: visible;
  }
</style>
