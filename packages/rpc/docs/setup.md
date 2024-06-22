---
title: Setup Guide
---

# Setup Guide

This guide covers the setup of workers for RPC in your application. A worker is a script that runs as a different thread. You can think of each worker as its own program, with its own state. A worker can communicate with the program that spawned it by sending and receiving messages.

Setup is done in two steps:

1. [Creating a worker script.](#1-create-a-worker-script)
2. [Using the `workerStrategy` in your application.](#2-use-the-workerstrategy-in-your-application)

## 1. Create a worker script

You first need to create a new file to be the entrypoint for your worker script.

### Request Handling

In your worker script, you can use `Handlers.set` to register a handler for a given request type. The return value of the handler is used as the response value. If, instead, an error is thrown, an error response will be given which will include that error's `message` property if present.

Packages that rely on RPC may offer scripts that can be imported to easily register their handlers, so check their documentation.

```js
import { Handlers } from '@librebase/rpc/server';

Handlers.set('speak', (req, instanceID) => {
  return 'Hello!';
});
```

### 'Ready' Message

Once your worker has finished initializing, it needs to emit a 'ready' message to inform the main thread it is ready to process requests. Until this message has been received, the main thread will keep requests queued, and their promises will remain unresolved.

Add the following to your worker script to be executed when all other initialisation tasks are complete:

```js
postMessage('ready');
```

### Complete example

This example of a worker script uses `Handlers.set` to register a handler, and then emits the 'ready' message.

```js
// worker-entrypoint.js

import { Handlers } from '@librebase/rpc/server';

Handlers.set('speak', (req, instanceID) => {
  return 'Hello!';
});

postMessage('ready');
```

## 2. Use the `workerStrategy` in your application

Now we need to tell the main thread to spawn the worker(s) and use them for remote procedures. We can use the `workerStrategy`, providing a constructor for the worker with our worker script.

### Web Worker for Vite

This example is for web workers and should work with Vite. Other bundlers may have different quirks when working with web workers, so please consult their documentation.

```js
import { setHost } from '@librebase/rpc/client';
import { workerStrategy } from '@librebase/rpc/client/worker';

function constructWorker() {
  return new Worker(new URL('./worker-entrypoint?worker', import.meta.url), {
    type: 'module',
  });
}

const host = workerStrategy(constructWorker);

setHost(host);
```
