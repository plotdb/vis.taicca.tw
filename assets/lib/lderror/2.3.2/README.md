# lderror

Simple wrapper for Error object.

## Usage

lderror contains an `id` field for identify what kind of error it is. to create a lderror object, simply:

    new lderror(1000);
    new lderror("custom message", 1000);
    new lderror({message: "custom message", id: 1000});
    lderror(1000); /* auto new upon invocation */
    lderror(1002,"additional information")
    lderror("custom message"); /* by default, id will be 0 */

valid lderror object contains a field 'name' with value 'lderror', and an id field with values listed in `src/lde.ls`. Following demonstrates how to make a lderror-compatible error object with id 1000 by duck typing:

    new Error! <<< {id: 1000, name: "lderror"}

or

    Object.assign(new Error(), {id: 1000, name: "lderror"});


## Members

 - `id`: lderror defined error code.
 - `message`: custom error message (optional)
 - `stack`: stacktrace (optional)
 - `code`: http status code, if applicable (optional)
 - `log`: should this error be logged. default false.
 - `error`: an Error object constructed


## Helper Functions

lderror exports several help functions for making use lderror easier:

 - `lderror.id(err)`: get the id for an error object `err`.
   - return value:
     - `err.id` if `err` is a valid `lderror` object and `lderror.id` is defined.
     - otherwise, 0
   - alternatively you can get `id` by accessing `err.id` directly - while this is not recommended..
 - `lderror.message(err)`: get the message corresponding to input `err` where `err` is either:
   - a number: return the message corresponding to given error id
   - an object: return the message corresponding to `err.id`
   - return `lderror.message(0)` if none of above, or return message of above is empty.
 - `lderror.reject(...)`: shorthand for `Promise.reject(new lderror(...))`
 - `lderror.handler(opt)`: a constructor function. when constructed, return an error handler
   - return a function `func(err)` for handling `err`. this function also exposes below method:
     - `isOn()`: return true if there are any ongoing errors, otherwise false.
   - options:
     - `ignore`: a list of id to ignore in this handler. error `999` is always ignored.
     - `rule(id)`: convert an error `id` to an user-defined object `o`, which is passed to `handler` below.
       - by default, `rule` is `function(id) { return id; }`
     - `handler(o, e)`: a actual handler for handling the given error
       - should return a promise.
       - options:
         - `o`: user-defined object returned by `rule(id)`.
         - `e`: the original error object.
 - `lderror.eventHandler`: helper event handler. See below section for more information.
   - `eventHandler` provides two member functions:
     - `error(evt)`: handler for `error` event.
     - `rejection(evt)`: handler for `unhandledrejection` event.
   - for both functions, return true if `lderror` is handled. otherwise false.


### Error Handler

Helper to contruct a reusable Error handler which supports:

 - custom error object wrapper / converter
 - id list of lderror to ignore
 - customizable handler


A sample scenario of using `lderror.handler`:

    handler = new lderror.handler({
      handler: function(o,e) {
        return Promise.resolve(alert("error: ", o, e));
      }
    });

    doSomething(...)
      .then(...)
      .catch(handler);


Work along with `@plotdb/block` + `ldcvmgr`:

    @manager = new block.manager!
    @ldcvmgr = new ldcvmgr {manager}
    handler = new lderror.handler do
      ignore: <[1005 1004]>
      handler: (~> @ldcvmgr.toggle it )
      rule: (id) -> "error/#id"

    doSomething ...
      .then ...
      .catch handler


## error / unhandledrejection events

You can use `lderror.eventHandler.error` and `lderror.eventHandler.rejection` to take care of lderror related errors:

    window.addEventListenen("error", lderror.eventHandler.error);
    window.addEventListenen("unhandledrejection", lderror.eventHandler.rejection);

These handlers simply check if incoming error is a lderror with original error object; if it is, additional information is logged and the original error object will be thrown for showing stacktrace information.

To wrap them along with your own event handler, test its return value and proceed if it returns `false`:

    window.addEventListenen("error", function(evt) {
      if(!lderror.eventHandler.error) { /* your own handler */ }
    });


## Customized Information

Additional information can be added if needed:

 - redirect - instruct a redirect url in order to proper take care of this error.


## Customized Error ID

Use ID `10000` ~ `29999` for customized error.


## License

MIT
