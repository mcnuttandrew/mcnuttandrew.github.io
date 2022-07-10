<script lang="ts">
  import {TEACHING} from '../constants';
  import {groupBy} from '../utils';
  const groups = groupBy(TEACHING, 'role');
</script>

<div class="leading-tight">
  {#each Object.keys(groups) as key}
    <div class="mb-5">
      <h3 class="font-bold">{key.toUpperCase()}</h3>
      {#each groups[key] as position}
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
    </div>
  {/each}
</div>
