<script lang="ts">
  export let currentSection;
</script>

<div class="h-14 justify-around hidden md:flex items-center bg-gray-600">
  {#each ["about", "publications", "misc"] as section (section)}
    <a
      href="/#/{section}"
      class:font-bold={currentSection === section}
      class="pr-3 text-xl text-white"
    >
      {section.toUpperCase()}
    </a>
  {/each}
</div>
