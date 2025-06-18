<script lang="ts">
  import { scaleLinear, scaleBand } from "d3-scale";

  // data
  export let data: { name: string; sets: string[] }[] = [];
  // selection
  export let focusedTopic: string[] = [];
  export let focusIntersection: (topics: string[]) => void;
  export let focusSet: (set: string) => void;

  // styling
  export let barColor: string = "oklch(87.2% 0.01 258.338)";
  export let circleColor: string = "oklch(96.7% 0.003 264.542)";
  export let selectedColor: string = "oklch(70.6% 0.03 256.802)";
  export let highlightColor: string = "oklch(88.2% 0.059 254.128)";
  export let width = 300;
  export let topBarHeight = 150;
  export let rowSize = 25;
  export let interSectionWidth = 50;
  export let sectionMargin = 20;
  export let margins = { left: 20, right: 0, top: 20, bottom: 0 };

  type Combination = {
    cardinality: number;
    name: string;
  };
  $: results = buildSets(data);
  $: combinations = results.combinations as Combination[];
  $: sets = results.sets as Combination[];

  const SPLIT_KEY = " INTERSECT ";
  function buildSets(sets: { name: string; sets: string[] }[]): {
    sets: Combination[];
    combinations: Combination[];
  } {
    // compute set info
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

  $: setSizeScale = scaleLinear()
    .domain([0, Math.max(...sets.map((s) => s.cardinality))])
    .range([0, topBarHeight]);

  $: setScale = scaleBand()
    .domain(sets.map((s) => s.name))
    .range([0, width])
    .padding(0);

  $: height = rowSize * combinations.length;
  $: intersectionSizeScale = scaleLinear()
    .domain([0, Math.max(...combinations.map((c) => c.cardinality))])
    .range([0, interSectionWidth]);
  $: intersectionScale = scaleBand()
    .domain(combinations.map((c) => c.name))
    .range([0, height])
    .padding(0);

  $: locked = false;
  $: comboToNumbers = (combo: string): number[] => [
    ...Array.from(combo.split(SPLIT_KEY) || []).map((s) => setScale(s) || 0),
  ];
</script>

<div>
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
            fill={focusedTopic.includes(set.name) ? selectedColor : barColor}
            stroke="white"
            class="cursor-pointer"
            on:mouseenter={() => {
              if (!locked) focusSet(set.name);
            }}
            on:mouseout={() => {
              if (!locked) focusIntersection([]);
            }}
            on:click={() => {
              if (
                locked === true &&
                focusedTopic.join(SPLIT_KEY) === set.name
              ) {
                locked = false;
              } else {
                focusSet(set.name);
                locked = true;
              }
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
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#each combinations as combination}
          <!-- background row -->
          <rect
            x={0}
            y={(intersectionScale(combination.name) || 0) -
              intersectionScale.bandwidth() / 2}
            width={width + interSectionWidth}
            height={intersectionScale.bandwidth()}
            fill={focusedTopic.join(SPLIT_KEY) === combination.name
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
                fill={focusedTopic.join(SPLIT_KEY) === set.name
                  ? highlightColor
                  : "white"}
                opacity={focusedTopic.join(SPLIT_KEY) === set.name ? 1 : 0}
                class="cursor-pointer"
                on:mouseenter={() => {
                  if (!locked)
                    focusIntersection(combination.name.split(SPLIT_KEY));
                }}
                on:mouseout={() => {
                  if (!locked) focusIntersection([]);
                }}
                on:click={() => {
                  if (
                    locked === true &&
                    focusedTopic.join(SPLIT_KEY) === combination.name
                  ) {
                    locked = false;
                  } else {
                    focusIntersection(combination.name.split(SPLIT_KEY));
                    locked = true;
                  }
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
              x1={Math.min(...comboToNumbers(combination.name)) +
                setScale.bandwidth() / 2}
              y1={intersectionScale(combination.name) || 0}
              x2={Math.max(...comboToNumbers(combination.name)) +
                setScale.bandwidth() / 2}
              y2={intersectionScale(combination.name) || 0}
              stroke={selectedColor}
              stroke-width="5"
              class="pointer-events-none"
            />
          {/if}
          <!-- histogram -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <rect
            x={width}
            y={(intersectionScale(combination.name) || 0) -
              intersectionScale.bandwidth() / 2}
            width={intersectionSizeScale(combination.cardinality)}
            height={intersectionScale.bandwidth()}
            fill={focusedTopic.join(SPLIT_KEY) === combination.name
              ? selectedColor
              : barColor}
            stroke="white"
            class="cursor-pointer"
            on:mouseenter={() => {
              if (!locked) focusIntersection(combination.name.split(SPLIT_KEY));
            }}
            on:mouseout={() => {
              if (!locked) focusIntersection([]);
            }}
            on:click={() => {
              if (
                locked === true &&
                focusedTopic.join(SPLIT_KEY) === combination.name
              ) {
                locked = false;
              } else {
                focusIntersection(combination.name.split(SPLIT_KEY));
                locked = true;
              }
            }}
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
<button class="mt-2" on:click={() => focusIntersection([])}>Clear</button>

<style>
  svg {
    overflow: visible;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .pointer-events-none {
    pointer-events: none;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
</style>
