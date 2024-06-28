# @astrobase/driver-indexeddb

An IndexedDB driver for Astrobase.

## Usage

### Recommended

A special export provides an `init` function which automatically registers the driver.

Note that this function returns a promise. The database connection will not be available until the returned promise has resolved.

```js
import { init } from '@astrobase/driver-indexeddb/recommended';

init();
```

### Manual

For more control, you can register the driver manually. Be sure to await the promise returned by `indexeddb`. The database connection will not be available until the returned promise has resolved.

```js
import { getChannels } from '@astrobase/core';
import { indexeddb } from '@astrobase/driver-indexeddb';

indexeddb().then((driver) => {
  getChannels().push(driver);
});
```
