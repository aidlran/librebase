# @librebase/driver-indexeddb

## Installation

```sh
npm install @librebase/driver-indexeddb
```

## Usage

```js
import { getChannels } from '@librebase/core';
import { indexeddb } from '@librebase/driver-indexeddb';

// We must await the database connection
const channel = await indexeddb();

getChannels().push(channel);
```
