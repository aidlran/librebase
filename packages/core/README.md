# @librebase/core

The Librebase core engine and primitives.

## Usage

### Channel Drivers

Channels bridge the engine with the outside world. They can serve multiple purposes like:

- Providing an interface used by the engine to request data from or push data to a source like a cache, a file, an API, or another peer.
- Receiving realtime updates and pushing them into the engine.
- Providing developers with reactive APIs for application development.

#### Available Channel Drivers

| Package                       | Description                     |
| :---------------------------- | :------------------------------ |
| `@librebase/driver-indexeddb` | A storage driver for IndexedDB. |

### Identifier Schemas

Identifier schemas tell the engine how to handle the different types of data that enter the engine by providing validation and serialization. They deal with binary content and allow for higher level protocols and abstractions to be built on top.

#### Available Identifier Schemas

| Package         | Description                                                           |
| :-------------- | :-------------------------------------------------------------------- |
| `@librebase/fs` | A content addressable file system with a codec system for file types. |
