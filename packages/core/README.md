# @astrobase/core

An extensible suite of protocols for building decentralized, secure, multi-user apps. This package includes core engine.

## Channel Drivers

Channels bridge the engine with the outside world. They can serve multiple purposes like:

- Providing an interface used by the engine to request data from or push data to a source like a cache, a file, an API, or another peer.
- Receiving realtime updates and pushing them into the engine.
- Providing developers with reactive APIs for application development.

### Identifier Schemas

Identifier schemas tell the engine how to handle the different types of data that enter the engine by providing validation and serialization. They deal with binary content and allow for higher level protocols and abstractions to be built on top.

## RPC

This package provides an RPC system for Astrobase in JavaScript. Using this system, we can define procedures that may happen locally, or in another thread, or even remotely, without worrying about the implementation required to make this happen. This enables advanced functionality to be built, such as:

- **Multi-threading with workers** - We can support workers and build decoupled from the implementation. This allows us to support different environments, including the browser and Node.js. In the case of web workers, it means we can offload intensive workloads from the main thread (responsible for the UI) which can improve application responsiveness.

- **Memory encapsulation** - We can keep sensitive runtime memory away from the main application and in a separate, or even remote, process. For instance, we can use this to keep a private key safe, only interacting with it via a restrictive API that prevents the key from being exposed.

- **Remote or distributed computing** - We can run a procedure on a remote device on the network, or divide a large workload across many devices.
