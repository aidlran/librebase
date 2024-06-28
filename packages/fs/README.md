# @astrobase/immutable

A content addressable file system protocol with an extensible codec system for Astrobase.

## Usage

### JSON Codec

```js
import { registerCodec } from '@astrobase/core';
import { json } from '@astrobase/immutable/json';
import { binary } from '@astrobase/immutable/middleware';

const codec = json(
  binary,
  // pass any additional middlewares
);

registerCodec('application/json', codec);
```

### Middleware

Middlewares hook into the parsing and stringification processes to validate and replace some or all of the JSON content. For instance, the binary middleware will look for values that are binary streams (which are unsupported by standard JSON) and swap them with base encoded strings.

Middlewares are objects that can provide two functions: `replace` and `revive`.

- `replace` runs during stringification.
- `revive` runs during parsing.

These functions behave similarly to the [replacer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer) and [reviver](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver) callbacks of the native `JSON.stringify` and `JSON.parse` functions. The middleware versions of these functions, however, can be async - they can return a promise which will be awaited.

The JSON structure is walked and middleware functions are invoked, in order of their registration, for each value, each key/value pair of an object and each entry of an array. An error is thrown if a circular reference is encountered.

Middleware functions **must** either return a replacement value or promise **or** return the value unchanged. If the middleware is performing some validation and that validation fails, it should **throw** instead.
