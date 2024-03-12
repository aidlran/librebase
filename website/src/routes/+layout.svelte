<script>
  import SocialButtons from '$lib/SocialButtons.svelte';
</script>

<main>
  <div>
    <section>
      <h1>Build robust apps at an <span class="accent">intragalactic</span> scale.</h1>
      <SocialButtons />
    </section>
  </div>

  <slot />
</main>

<style>
  @import '../style.css';

  div {
    display: flex;
    min-height: 100vh;
  }

  section {
    padding: var(--margin);
    margin: auto;
    max-width: 800px;
    text-align: center;
  }
</style>
