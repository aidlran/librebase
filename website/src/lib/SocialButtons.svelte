<script>
  import GithubButton from './ButtonGitHub.svelte';
  import XButton from './ButtonX.svelte';

  export let labels = true;
  export let align = 'center';
</script>

<nav style:justify-content={align}>
  <GithubButton>
    {#if labels}
      Star on GitHub
    {/if}
  </GithubButton>
  <XButton>
    {#if labels}
      Follow on X
    {/if}
  </XButton>
</nav>

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--margin);
    font-size: 14px;
  }
</style>
