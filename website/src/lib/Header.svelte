<script>
  import SocialButtons from './SocialButtons.svelte';
</script>

<header>
  <a class="logo" href="/">Librebase</a>
  <SocialButtons />
</header>

<style>
  header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: sticky;
  }

  .logo {
    font-size: 24px;
    text-decoration: none;
    font-weight: 900;
    margin-right: 96px;
  }

  a {
    color: var(--txt);
  }
</style>
