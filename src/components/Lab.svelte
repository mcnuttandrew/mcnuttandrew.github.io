<script lang="ts">
  import { STUDENTS } from "../data/students";
  let darkMode = false;
</script>

<div class="mb-10 block" class:bg-black={darkMode} class:bg-white={!darkMode}>
  <div>
    <img
      src="converted-images/logo-{darkMode ? 'white' : 'black'}.png"
      alt="logo for the havoc lab. it is a stylized representation of the word havoc"
    />
  </div>
</div>
<div class="flex justify-end">
  <label class="inline-flex items-center cursor-pointer">
    <input type="checkbox" class="sr-only peer" bind:checked={darkMode} />
    <div
      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 relative"
    >
      <span
        class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out transform peer-checked:translate-x-full dark:peer-checked:bg-blue-600"
      ></span>
    </div>
  </label>
  <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
    Dark Mode
  </span>
</div>

<p>
  The HAVOC Lab is my research group at the University of Utah. We study a broad
  range of topics in visualization and human-computer interaction. We're always
  looking for new students to join us, so if you're interested in working with
  us, please reach out!
</p>

<h1 class="text-3xl font-bold mt-4">People</h1>
<div class="flex flex-wrap justify-center">
  {#each STUDENTS as student}
    <div class="flex flex-col items-center mb-2 ml-4">
      <a href={student.link} class="flex items-center mb-2">
        <img
          src={student.image}
          alt="head shot of {student.name}"
          class="w-64 h-64 rounded-full mr-2"
        />
      </a>
      <div class="text-center">
        <h3 class="text-lg font-bold">{student.name}</h3>
        <p>{student.role}</p>
        <a href={student.link} class="text-blue-500 hover:underline">webpage</a>
        <p class="text-sm italic">{student.researchInterests}</p>
      </div>
    </div>
  {/each}
</div>
