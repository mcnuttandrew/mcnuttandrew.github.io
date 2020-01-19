<script>
  import {TEACHING} from '../constants';
  import {groupBy} from '../utils';
  const groups = groupBy(TEACHING, 'role');
  console.log(groups);
</script>

<style>
  .margin-left {
    margin-left: 5px;
  }

  .margin-bottom {
    margin-bottom: 5px;
  }
  .margin-large-bottom {
    margin-bottom: 20px;
  }
</style>

<div>
  {#each Object.keys(groups) as key}
    <div class="margin-large-bottom">
      <h3>{key.toUpperCase()}</h3>
      {#each groups[key] as position}
        <div class="margin-bottom">
          {#if position.link}
            <a href={position.link}>{position.title}</a>
          {/if}
          {#if !position.link}
            <div>{position.title}</div>
          {/if}

          <div class="flex">
            <i>{`${position.fancyTitle || position.role}`}</i>
            <span class="margin-left">{position.date}</span>
          </div>

        </div>
      {/each}
    </div>
  {/each}
</div>
