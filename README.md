# Wrap Ware

A middleware wrapper which works with promises / async.

Wrap the main function using `wrap(main)`, then add middlewares using `use(middleware)`.

```
const wrappedMain = wrap(main).use(middleware2).use(middleware1)
wrappedMain('some data')
```

The middlewares will execute the `before` function from right to left.
Then the main will execute.
Then the middlewares will execute the `after` function from left to right.

This will result in this execution order:

```
middleware1 before
middleware2 before
main
middleware2 after
middleware1 after
```

## Example

An example can be found here: [router example](https://github.com/TomGB/wrap-ware/blob/master/examples/router-example.js)

Usage of this example: [router usage example](https://github.com/TomGB/wrap-ware/blob/master/examples/router-example.test.js)

## Install

`npm install wrap-ware`

## API / Usage

```
const wrap = require('wrap-ware);
const wrappedMain = wrap(main).use(middleware);
```

`main` = callback

Will be passed the arguments that you call `wrappedMain` with.

`middleware` = object with some of these functions: `before`, `after`, `onError`.

`wrap` also exposes the functions `.before(fn)`, `.after(fn)` and `.onError(fn)`.

returns an instance of `wrap` which allows further `.use(fn)` to be added.

---

`before` / `after` = callback `({ input, output, error, resolve, reject }) => ['arg1', 'arg2']`

`input` = [] of the args that `wrappedMain` was called with.

`output` = the return value of the wrappedMain function.

`error` = the return value of the wrappedMain function when an error has been thrown.

`resolve` = callback which accepts an [] of args. This will be used to call the next middleware.

`reject` = callback to trigger the onError method of the next middleware.

The controller object can be modified to affect the subsequent middlewares.
The `before` / `after` function can also simply return an array rather than calling the `resolve` callback.

---

`onError` = callback `({ input, output, error, input, response }) => `

`error` = the return value of the wrappedMain function when an error has been thrown.

`resolve` = callback which accepts an [] of args. This will be used to call the next middleware.

`reject` = callback to skip the remaining onError methods of the middlewares and throws to where `wrap(core)()` was executed
