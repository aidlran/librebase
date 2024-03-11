<script>
  import SocialButtons from '../lib/SocialButtons.svelte';
</script>

<svelte:head>
  <title>Librebase - An open source intragalactic protocol stack</title>
  <meta
    name="description"
    content="An open source intragalactic protocol stack for building decentralized multi-user, multi-tenanted
apps that are secure and private by default."
  />
</svelte:head>

<section>
  <h1>Build robust apps at an <span class="accent">intragalactic</span> scale.</h1>
  <SocialButtons />
</section>

<style>
  section {
    padding: var(--margin);
    margin: auto;
    max-width: 800px;
    text-align: center;
  }

  h1 {
    font-size: 48px;
  }
</style>
