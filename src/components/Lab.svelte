<script lang="ts">
  import { STUDENTS, GROUP_PHOTOS } from "../data/students";
  let darkMode = false;
</script>

<div class="mb-10 block" class:bg-black={darkMode} class:bg-white={!darkMode}>
  <div>
    <img
      src="assets/logo-{darkMode ? 'white' : 'black'}.jpg"
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
  range of topics in visualization and human-computer interaction. Broadly we
  aim to understand and improve how people interact with information, whether it
  is in data, visualization, art, or anywhere else. Methodologically, we use a
  mix of qualitative and quantitative methods and user interface design to
  answer questions in these spaces. If you are currently a student at the
  University of Utah and are interested in doing some research, please reach out
  to me via email. If you are not a student at the University of Utah, please
  check out my web page calls for applications for the lab.
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
        {#if student.link}
          <a href={student.link} class="text-blue-500 hover:underline">
            webpage
          </a>
        {/if}
        <p class="text-sm italic max-w-48">{student.researchInterests}</p>
      </div>
    </div>
  {/each}
</div>

<h1 class="text-3xl font-bold mt-4">Group Photos</h1>
<div class="flex flex-wrap justify-center">
  {#each GROUP_PHOTOS as photo}
    <div class="flex flex-col items-center mb-2 ml-4">
      <img src={photo.image} alt={photo.altText} class="w-80 mr-2" />
    </div>
  {/each}
</div>
