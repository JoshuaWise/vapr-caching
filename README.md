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

There are three different configurations to choose from, list below.

### caching.never([*options*])

Disables all caching, including any caching done by ETags (e.g., [`vapr-conditionals`](https://github.com/JoshuaWise/vapr-conditionals)). This configuration should only be used to satisfy strict security requirements, as it can result in unnecessary bandwidth usage. If you need your content to always be up-to-date, it's probably better to use [`.private()`](#cachingprivateoptions) or [`.shared()`](#cachingsharedoptions) with a duration of `0`.

```js
route.use(caching.never());
```

### caching.private([*options*])

Disables shared caches (e.g., [CDNs](https://en.wikipedia.org/wiki/Content_delivery_network)) but enables private caches (e.g., browsers). This configuration should be used when the content being served varies depending on which user requested it. The `duration` option determines how many seconds the content should be cached for.

```js
route.use(caching.private({ duration: 60 }));
```

If you need your content to always be up-to-date, use a duration of `0`.

### caching.shared([*options*])

Enables both shared caches (e.g., [CDNs](https://en.wikipedia.org/wiki/Content_delivery_network)) and private caches (e.g., browsers). This configuration should be used when the content being served does *not* vary depending on which user requested it. The `duration` option determines how many seconds the content should be cached for.

```js
route.use(caching.shared({ duration: 60 }));
```

If you need your content to always be up-to-date, use a duration of `0`.

You can also configure shared caches to have a different duration from private caches by using the `sharedDuration` option, as shown below.

```js
route.use(caching.shared({
  duration: 0,
  sharedDuration: 60,
}));
```

## Options

The following options can be used with any configuration.

### options.condition = *default*

By default, this plugin will only affect responses whose status codes are defined as being "cacheable by default" by the [HTTP specification](https://tools.ietf.org/html/rfc7231#section-6.1), as well as `304`, in order to support ETags. Specifically, that's `200`, `203`, `204`, `206`, `300`, `301`, `304`, `404`, `405`, `410`, `414`, and `501`.

If you'd like to override this behavior, you can pass a `condition` function to define your own logic for determining which responses will be affected. The `condition` function is given a [request](https://github.com/JoshuaWise/vapr/blob/master/docs/reference/request.md#class-request) and a [response](https://github.com/JoshuaWise/vapr/blob/master/docs/reference/response.md), and should return `true` or `false`.

```js
route.use(caching.shared({
  duration: 60,
  condition: (req, res) => res.code === 200,
}));
```

Keep in mind that if no caching headers are present on a response that is "cacheable by default", caches may choose to cache it for any arbitrary amount of time, or not at all.

### options.allowUnsafe = *false*

By default, this plugin will not cache responses to POST requests. However, you can set the `allowUnsafe` option to `true` to support caching POSTs.

```js
route.use(caching.private({
  duration: 3600,
  allowUnsafe: true,
}));
```

## Remarks

This plugin prevents caches from ever serving stale content (i.e., content whose cache duration has expired), which some caches might try to do in some circumstances. Due to the lack of standards in regards to serving stale content, cache implementations vary wildly in their behavior here. Therefore, in the interest of your application having deterministic behavior, we take the opinionated approach of preventing stale content from ever being served. If you have total control of the caches you're using and you need more customized behavior, you should set the Cache-Control header yourself instead of using this plugin.
