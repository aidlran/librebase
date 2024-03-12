<script>
  import SocialButtons from './SocialButtons.svelte';
</script>

<header>
  <a class="logo" href="/">Librebase</a>
  <a href="/">Home</a>
  <a href="/features">Features</a>
  <SocialButtons />
</header>

<style>
  header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: sticky;
    top: 0;
    background: var(--bg);
    gap: var(--margin);
    padding: 12px 0;
    z-index: 1;
  }

  a,
  a:visited {
    font-size: 18px;
    color: var(--txt);
  }

  .logo {
    font-size: 24px;
    text-decoration: none;
    font-weight: 900;
    margin-right: 72px;
  }
</style>
