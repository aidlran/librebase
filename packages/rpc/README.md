# @librebase/rpc

This package provides an RPC system for Librebase in JavaScript. Using this system, we can define procedures that may happen locally, or in another thread, or even remotely, without worrying about the implementation required to make this happen. This enables advanced functionality to be built, such as:

- **Multi-threading with workers** - We can support workers and build decoupled from the implementation. This allows us to support different environments, including the browser and Node.js. In the case of web workers, it means we can offload intensive workloads from the main thread (responsible for the UI) which can improve application responsiveness.

- **Memory encapsulation** - We can keep sensitive runtime memory away from the main application and in a separate, or even remote, process. For instance, we can use this to keep a private key safe, only interacting with it via a restrictive API that prevents the key from being exposed.

- **Remote or distributed computing** - We can run a procedure on a remote device on the network, or divide a large workload across many devices.

## Usage

To setup the RPC client in your application so that you can use features that depend on RPC, see [this guide](https://librebase.io/docs/documents/RPC.Guides.Client_Setup_Guide.html).
