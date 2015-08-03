# vantage-watch

<img src="https://travis-ci.org/vantagejs/vantage-watch.svg" alt="Build Status" />

Listens for changes in Vantage.js extension files, and reloads the extensions without interrupting your app's lifecycle.

Useful when developing new Vantage commands.

### Installation

```bash
npm install vantage-watch
npm install vantage
```

### Usage

```js
const Vantage = require('vantage');
const watch = require('vantage-watch');
const commands = require('./lib/vantage-commands');

let vantage = new Vantage();

vantage
  .listen(4000)
  .use(commands)
  .use(watch, {
    files: ['./lib/vantage-commands.js']
  })
  .show();
```
Now, whenever `./lib/vantage-commands.js` is changed, Vantage will import and update its existing commands and / or register new commands.

### Error Handling

If the watched file is not a valid Vantage extension, `vantage-watch` will gracefully catch the error and not attempt to load the module until it has been changed again, at which point it will retry. Examples of invalid imports include:

 - Its `module.exports` does not return a function
 - It has syntax errors
 - It is not a valid file

### License

MIT
