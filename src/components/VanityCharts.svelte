<script lang="ts">
  import {
    radialWheel,
    publicationsByYear,
    publicationsByVenue,
  } from "../data/vega-charts";
  import { Vega, VegaLite } from "svelte-vega";
</script>

Some vanity charts about my and my group's publication records.

<div class="flex flex-col items-center justify-center w-full mb-32 pb-32">
  <div class="flex flex-col w-full">
    <span class="italic text-sm"> Publications by Venue </span>
    <VegaLite spec={publicationsByVenue()} options={{ actions: false }} />
  </div>
  <div class="flex flex-col w-full">
    <span class="italic text-sm"> Publications by Year </span>

    <VegaLite spec={publicationsByYear()} options={{ actions: false }} />
  </div>
  <div class="flex flex-col w-full justify-center items-center">
    <Vega spec={radialWheel()} options={{ actions: false }} />
    <span class="w-full self-start italic text-sm"> Collaborator Network </span>
  </div>
</div>
