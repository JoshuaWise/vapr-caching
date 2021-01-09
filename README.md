# vapr-caching [![Build Status](https://travis-ci.org/JoshuaWise/vapr-caching.svg?branch=master)](https://travis-ci.org/JoshuaWise/vapr-caching)

## Installation

```bash
npm install --save vapr
npm install --save vapr-caching
```

## Usage

This plugin provides some convenience functions for setting HTTP caching headers (Cache-Control). Although setting headers is a simple task, it's common for people to use caching headers incorrectly, which can be avoided by using this plugin.

```js
const caching = require('vapr-caching');
const app = require('vapr')();
const route = app.get('/foo');

route.use(caching.never());
route.use((req) => { ... });
```

### caching.never()

Disables all caching, including any caching done by ETags (e.g., [`vapr-conditionals`](https://github.com/JoshuaWise/vapr-conditionals)). This should only be used to satisfy strict security requirements, as it can result in unnecessary bandwidth usage. If you need your content to always be up-to-date, it's probably better to use [`.private()`](#cachingprivateoptions) or [`.shared()`](#cachingsharedoptions) with a duration of `0`.

```js
route.use(caching.never());
```

### caching.private([*options*])

Disables shared caches (e.g., [CDNs](https://en.wikipedia.org/wiki/Content_delivery_network)) but enables private caches (e.g., browsers). This should always be used when the content being served varies depending on which user requested it. The given duration is measured in seconds.

```js
route.use(caching.private({ duration: 60 }));
```

If you need your content to always be up-to-date, use a duration of `0`.

### caching.shared([*options*])

Enables both shared caches (e.g., [CDNs](https://en.wikipedia.org/wiki/Content_delivery_network)) and private caches (e.g., browsers). This should only be used when the content being served does *not* vary depending on which user requested it. The given duration is measured in seconds.

```js
route.use(caching.shared({ duration: 60 }));
```

If you need your content to always be up-to-date, use a duration of `0`.

You can also configure shared caches to have a different duration from private caches, as shown below.

```js
route.use(caching.shared({
  duration: 0,
  sharedDuration: 60,
}));
```

## Remarks

This plugin prevents caches from ever serving stale content (i.e., content whose cache duration has expired), which some caches might try to do in some circumstances. Due to the lack of standards in regards to serving stale content, cache implementations vary wildly in their behavior here. Therefore, in the interest of your application having deterministic behavior, we take the opinionated approach of preventing stale content from ever being served. If you have total control of the caches you're using and you need more customized behavior, you should set the Cache-Control header yourself instead of using this plugin.
