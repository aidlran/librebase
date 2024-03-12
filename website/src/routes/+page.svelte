<script>
  import GithubButton from '$lib/ButtonGitHub.svelte';
</script>

<svelte:head>
  <title>Librebase - An open source intragalactic protocol stack</title>
  <meta
    name="description"
    content="An open source intragalactic protocol stack for building decentralized multi-user, multi-tenanted
apps that are secure and private by default."
  />
</svelte:head>

<section class="hero">
  <h1>Features - JavaScript SDK</h1>
  <p>
    Librebase is an open specification and could be re-implemented in virtually any language.
    However the first "official" implementation is JavaScript, chosen for its portability and
    versatility.
  </p>

  <div class="buttons">
    <GithubButton>Explore on GitHub</GithubButton>
  </div>
</section>

<section>
  <h2>Runtimes</h2>

  <p>
    One of JavaScript's strengths is its versatility. Supporting major runtimes means that the JS
    SDK alone can cover most use cases, such as cross platform apps and headless relay nodes.
  </p>

  <div class="feature-category">
    <div class="feature">
      <h3>Browser <span class="status p" /></h3>
      <p>
        The ability to run Librebase clients on the web with only modern browser APIs is under
        active development and is planned for the first pre-release version.
      </p>
    </div>

    <div class="feature">
      <h3>Node.js <span class="status f" /></h3>
      <p>
        The ability to run Librebase on Node.js-like server runtimes will enable possibilities such
        as headless relays and making available additional APIs for native desktop and mobile
        clients like better file system and networking support.
      </p>
    </div>
  </div>
</section>

<section>
  <h2>Channel Adapter Interface</h2>

  <p>
    Adapters allow clients to sync data with a variety of sources in parallel. You can implement
    your own using the generic <code>ChannelAdapter</code> interface to support any storage backend you
    can dream of.
  </p>

  <div class="feature-category">
    <div class="feature">
      <h3>Push & Pull <span class="status p" /></h3>
      <p>Push and pull from channel drivers with single requests.</p>
    </div>

    <div class="feature">
      <h3>Realtime <span class="status f" /></h3>
      <p>Support for realtime data from compatible channel drivers.</p>
    </div>
  </div>

  <h2>Adapters</h2>

  <div class="feature-category">
    <div class="feature">
      <h3>IndexedDB <span class="status p" /></h3>
      <p>Sync data on device in local browser IndexedDB.</p>
    </div>

    <div class="feature">
      <h3>Enclaves <span class="status f" /></h3>
      <p>Sync data reliably and securely to your own private enclave in the cloud.</p>
    </div>

    <div class="feature">
      <h3>Others? <span class="status f" /></h3>
      <p>Databases? IPFS? Nostr? S3? P2P over WebRTC?</p>
      <p>Reach out and let us know what you're interested in.</p>
    </div>
  </div>
</section>

<section>
  <h2>Serializers</h2>

  <p>
    Serializers convert JavaScript data structures into raw bytes ready for the wire and vice versa.
    You can implement your own using the generic <code>Serializer</code> interface to support additional
    media types.
  </p>

  <div class="feature-category">
    <div class="feature">
      <h3>Binary <span class="status p" /></h3>
      <p><code>application/octet-stream</code></p>
      <p>Serializing to/from <code>Uint8Array</code>.</p>
    </div>

    <div class="feature">
      <h3>Plaintext <span class="status p" /></h3>
      <p><code>text/plain</code></p>
      <p>Serializing to/from <code>String</code>.</p>
    </div>

    <div class="feature">
      <h3>JSON <span class="status p" /></h3>
      <p><code>application/json</code></p>
      <p>Serializing to/from POJO.</p>
    </div>

    <div class="feature">
      <h3>Wrapped <span class="status p" /></h3>
      <p><code>application/???</code></p>
      <p>
        Serializing to/from Librebase protocol wrapped objects (signed, encrypted, etc.) This spec
        is under development.
      </p>
    </div>
  </div>
</section>

<section>
  <h2>APIs</h2>

  <div class="feature-category">
    <div class="feature">
      <h3>Data <span class="status p" /></h3>
      <p>
        Functions for registering and unregistering channel drivers and serializers and building
        Nodes.
      </p>
    </div>

    <div class="feature">
      <h3>Keyring <span class="status p" /></h3>
      <p>Functions for creating, importing and managing keyrings and identities.</p>
    </div>
  </div>
</section>

<style>
  .hero {
    text-align: center;
  }

  .buttons {
    display: flex;
    align-items: center;
    gap: var(--margin);
  }

  .hero .buttons {
    justify-content: center;
    padding: var(--margin);
  }

  section {
    padding-top: var(--margin);
    border-bottom: var(--border);
    max-width: 1000px;
    margin: auto;
    padding: var(--margin);
  }

  .feature-category {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: var(--margin) 0;
  }

  .feature {
    min-width: 200px;
    width: calc(50% - var(--margin));
  }

  .feature p {
    color: var(--acc3);
    opacity: 60%;
  }

  .status {
    margin: auto 6px;
    padding: 3px 6px;
    border: 2px solid transparent;
    border-radius: 5px;
    font-size: 14px;
  }

  /* .status.d {
    border-color: var(--valid);
    color: var(--valid);
  }

  .status.d:before {
    content: 'Done';
  } */

  .status.p {
    border-color: var(--acc2);
    color: var(--acc2);
  }

  .status.p:before {
    content: 'Planned';
  }

  .status.f {
    border-color: var(--acc3);
    color: var(--acc3);
  }

  .status.f:before {
    content: 'Future';
  }
</style>
