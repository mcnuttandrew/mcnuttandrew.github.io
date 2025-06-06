<script lang="ts">
  import { PUBLICATIONS } from "../constants";
  import { onMount } from "svelte";
  import { scaleLinear, scaleBand } from "d3-scale";
  import store from "../store";

  type Combination = {
    cardinality: number;
    name: string;
  };
  $: combinations = [] as Combination[];
  $: sets = [] as Combination[];
  const SPLIT_KEY = " INTERSECT ";
  onMount(() => {
    const preSets = PUBLICATIONS.map((pub) => ({
      name: pub.title,
      sets: pub.topics,
    })) as {
      name: string;
      sets: string[];
    }[];
    const results = buildSets(preSets);
    combinations = results.combinations;
    sets = results.sets;
  });
  function buildSets(sets: { name: string; sets: string[] }[]): {
    sets: Combination[];
    combinations: Combination[];
  } {
    // computer set info
    const setCategories = sets.reduce(
      (acc, set) => {
        set.sets.forEach((s) => {
          if (!acc[s]) {
            acc[s] = new Set<string>();
          }
          acc[s].add(set.name);
        });
        return acc;
      },
      {} as Record<string, Set<string>>
    );
    const intersections = sets.reduce(
      (acc, set) => {
        const keyName = set.sets.sort().join(SPLIT_KEY);
        acc[keyName] = (acc[keyName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return {
      sets: Object.entries(setCategories)
        .map(([name, set]) => [name, set.size] as [string, number])
        .map(([name, cardinality]) => ({ name, cardinality }))
        .sort((a, b) => b.cardinality - a.cardinality),
      combinations: Object.entries(intersections)
        .map(([name, count]) => ({ name, cardinality: count }))
        .sort((a, b) => b.cardinality - a.cardinality),
    };
  }

  const width = 300;
  const topBarHeight = 150;

  $: setSizeScale = scaleLinear()
    .domain([0, Math.max(...sets.map((s) => s.cardinality))])
    .range([0, topBarHeight]);

  $: setScale = scaleBand()
    .domain(sets.map((s) => s.name))
    .range([0, width])
    .padding(0);

  const rowSize = 25;
  const interSectionWidth = 50;
  $: height = rowSize * combinations.length;
  $: intersectionSizeScale = scaleLinear()
    .domain([0, Math.max(...combinations.map((c) => c.cardinality))])
    .range([0, interSectionWidth]);
  $: intersectionScale = scaleBand()
    .domain(combinations.map((c) => c.name))
    .range([0, height])
    .padding(0);

  const sectionMargin = 20;
  const margins = { left: 20, right: 0, top: 20, bottom: 0 };

  $: focusedIntersection = null as string | null;
  $: focusedSets = [] as string[];
  $: focusedColumn = null as string | null;
  const barColor = "oklch(87.2% 0.01 258.338)";
  const circleColor = "oklch(96.7% 0.003 264.542)";
  const selectedColor = "oklch(70.6% 0.03 256.802)";
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
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <rect
            x={setScale(set.name) || 0}
            y={topBarHeight - setSizeScale(set.cardinality)}
            width={setScale.bandwidth()}
            height={setSizeScale(set.cardinality)}
            fill={focusedSets.includes(set.name) || focusedColumn === set.name
              ? selectedColor
              : barColor}
            stroke="white"
            on:mouseenter={() => {
              focusedColumn = set.name;
              focusedIntersection = null;
              focusedSets = [];
            }}
            on:mouseout={() => {
              focusedColumn = null;
            }}
            on:click={() => {
              store.setPubs([set.name]);
              store.setMode("include-subsets");
            }}
          />

          <g
            transform="translate({(setScale(set.name) || 0) +
              setScale.bandwidth() / 2}, {topBarHeight}) rotate(-90)"
          >
            <text
              font-size="10"
              y={2}
              x={5}
              text-anchor="start"
              class="pointer-events-none"
            >
              {set.name}
            </text>
          </g>
        {/each}
      </g>

      <!-- intersection -->
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
              <!-- svelte-ignore a11y-mouse-events-have-key-events -->
              <rect
                x={0}
                y={-intersectionScale.bandwidth() / 2}
                width={setScale.bandwidth()}
                height={intersectionScale.bandwidth()}
                fill={focusedColumn === set.name ? highlightColor : "white"}
                opacity={focusedColumn === set.name ? 1 : 0}
                on:mouseenter={() => {
                  if ($store.focusedPubs.length) {
                    return;
                  }
                  focusedSets = Array.from(
                    combination.name.split(SPLIT_KEY) || []
                  ).filter((s) => s !== set.name);
                  focusedIntersection = combination.name;
                }}
                on:mouseout={() => {
                  if ($store.focusedPubs.length) {
                    return;
                  }
                  focusedIntersection = null;
                  focusedColumn = null;
                }}
                on:click={() => {
                  focusedSets = Array.from(
                    combination.name.split(SPLIT_KEY) || []
                  ).filter((s) => s !== set.name);
                  focusedIntersection = combination.name;
                  if (
                    focusedSets.join(",") === $store.focusedPubs.join(",") &&
                    focusedSets.length
                  ) {
                    store.setPubs([]);
                  } else {
                    store.setPubs(focusedSets);
                  }
                  store.setMode("only-exact-matches");
                }}
              />
              <circle
                cx={setScale.bandwidth() / 2}
                cy={0}
                r={8}
                class="pointer-events-none"
                fill={combination.name.split(SPLIT_KEY)?.includes(set.name)
                  ? selectedColor
                  : circleColor}
              />
            </g>
          {/each}
          {#if combination.name.split(SPLIT_KEY).length >= 1}
            <line
              x1={Math.min(
                ...Array.from(combination.name.split(SPLIT_KEY) || []).map(
                  (s) => setScale(s) || 0
                )
              ) + 5}
              y1={intersectionScale(combination.name) || 0}
              x2={Math.max(
                ...Array.from(combination.name.split(SPLIT_KEY) || []).map(
                  (s) => setScale(s) || 0
                )
              ) + 5}
              y2={intersectionScale(combination.name) || 0}
              stroke={selectedColor}
              stroke-width="5"
              class="pointer-events-none"
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
              : barColor}
            stroke="white"
          />
          <text
            x={width + 5}
            y={(intersectionScale(combination.name) || 0) + 5}
            font-size="10"
            class="pointer-events-none"
          >
            {combination.cardinality}
          </text>
        {/each}
      </g>
    </g>
  </svg>
</div>
<button
  class="mt-2"
  on:click={() => {
    focusedColumn = null;
    focusedIntersection = null;
    focusedSets = [];
    store.setPubs([]);
    store.setMode("only-exact-matches");
  }}
>
  Clear
</button>

<style>
  svg {
    overflow: visible;
  }
</style>
