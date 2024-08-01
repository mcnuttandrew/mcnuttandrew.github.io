<script lang="ts">
  import { TEACHING } from "../constants";
  import { groupBy } from "../utils";
  let groups = groupBy(TEACHING, "role");
  $: Object.keys(groups).forEach((key) => {
    groups[key] = groupBy(groups[key], "location");
  });
</script>

<div class="leading-tight">
  {#each Object.keys(groups) as key}
    <div class="mb-5">
      <h2 class="font-bold text-2xl">{key.toUpperCase()}</h2>
      {#each Object.keys(groups[key]) as location, idx}
        <h3 class="italic text-xl" class:mt-4={!!idx}>{location}</h3>
        {#each groups[key][location] as position}
          <div class="mb-1 flex">
            {#if position.link}
              <a class="text-cyan-800" href={position.link}>{position.title}</a>
            {/if}
            {#if !position.link}
              <div>{position.title}</div>
            {/if}

            <div class="flex">
              <i>{`. ${position.fancyTitle || position.role}`}</i>
              <span class="ml-1">{position.date}</span>
            </div>
          </div>
        {/each}
      {/each}
    </div>
  {/each}
</div>
