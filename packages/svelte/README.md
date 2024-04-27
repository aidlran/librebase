# Librebase for Svelte

## About

This package cybernetically enhances [Librebase](https://librebase.io) with reactive [stores](https://svelte.dev/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values) and convenient components for Svelte app development.

## Usage

TODO

### SvelteKit SSR Caveat

When using SSR (enabled by default in SvelteKit) you might encounter `ReferenceError: Worker is not defined`.

To solve this you must disable SSR for any pages using Librebase. See [Svelte Docs](https://learn.svelte.dev/tutorial/ssr).

This is due to the Librebase library using the web worker API, which is only available in the browser environment. This is a known issue and will eventually be addressed as SSR can have valid use cases, e.g. to render pages using public (unencrypted) protocol data.
