# ractive-bin-loader

This [rollup](https://rollupjs.org) plugin allows you to write [Ractive.js](https://ractive.js.org) components and pre-compile them with the rest of your build.

## Installation

```sh
npm install --save-dev rollup-plugin-ractive-bin
```

## Usage

Import the plugin from your rollup config or add it on the command line. You can pass any of the ractive bin options through to the plugin as well. You'll need relatively recent versions of rollup (2.0+) and Ractive (1.0+) installed as well. This plugin will process files ending in `.ractive.html`, `.ractive`, `.ract.html`, and `.ract` by default, and it's recommended that you keep all of your ractive templates in a subdirectory separate from your non-template sources e.g. `views` and set a `root: 'views'` option in your plugin config to avoid the plugin trying to process every un-extensioned import.

```js
import ractive from 'rollup-plugin-ractive-bin';

export default {
  input: 'src/index.js',
  external: ['ractive'],
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'MyRactiveThingy',
    globals: {
      ractive: 'Ractive'
    }
  },
  plugins: [
    ractive()
  ]
};
```

It's generally recommended to include ractive on the page before loading your bundle rather than bundling ractive, since ractive isn't a small unminified dependency. This allows you to more easily change ractive versions or flavors, so you can get a nice debuggable sourcemapped library if you need it and change it out with the minified runtime-only version when you're ready.

Then you can write components like this:

```html
<!-- you can also use a link tag with an external stylesheet -->
<style>
  /* styles are concatenated, stringified, and injected wherever $CSS is found in the template */
  .my-ractive-component {
    margin: 1em;
    background-color: #eee;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0,12), 0 1px 2px rgba(0, 0, 0, 0.24);
    padding: 1em;
  }
</style>

<script type="text/ractive" id="myPartial">
  <p>
    Partials can be added as scripts with a type of text/ractive or text/html.
  </p>
  <p>
    They can also include a src attribute to be loaded from an external file, and included files are also monitored for changes in watch mode.
  </p>
</script>

<template id="otherPartial">
  Partials can also be added as template elements, and can also be loaded from an external file using the src attribute.
</template>

<!-- any html is gathered up to be parsed and injected wherever $TEMPLATE is found in the script -->
<div class="my-ractive-component">
  {{>myPartial}}
  <button on-click="['go']">Go</button>
</div>

<script>
  // any non-partial scripts are concatenated
  // ES module syntax is _strongly_ recommended
  import Ractive from 'ractive';

  export default Ractive.extend({
    template: $TEMPLATE,
    css: $CSS,
    on: {
      go() { alert('Hello, from my webpacked Ractive.js component!'); }
    }
  });

  // external scripts can also be loaded and concatenated with any inline scripts
  // by supplying a relative src attribute
</script>
```

Another option is to just use this plugin for your templates, so you can place your code in a more editor-friendly file like a `.js` or `.ts`. To do this, you'll want to pass `autoExport: true` to the plugin, which will make it automatically export a `template` member containing any parsed template and a `css` member if you have any style sections in your template.

```html
<div>
  Any old template.
</div>

This line is part of the template, but it's telling you that the next line will add a partial to the exported template:
<template id="imported" src="some/other/template.ractive.html" />

<style>
  /* if you include any styles, they will be exported as css, otherwise, there's no css member exported */
  div {
    color: purple;
  }
</style>
```

```js
import { template, css } from 'views/template.ractive.html';
import Ractive from 'ractive';

export default class MyComponent extends Ractive {
  constructor(opts) { super(opts); }
  someMethod() {
    console.log('I can be called using the instance e.g. (new MyComponent()).someMethod() or @this.someMethod() in the template');
  }
}

// Don't forget to ractive-ify the class
Ractive.extendWith(MyComponent, {
  template, css
});
```

This flavor of component opens up the possibility to use TypeScript for your component code, though unfortunately not expressions within the template at this time. Since TypeScript doesn't exactly use the rollup module cache, this plugin does some slightly hacky things to make your compiled templates available when ts goes looking for them. This slight hackiness requires a little bit of setup.

1. This plugin needs a path to write output files to, so you'll need to pass an `outputDir` option to your plugin config. You'll probably want to git ignore it, and something like `.views` is recommended.
2. You'll need to add an alias to your `tsconfig.json` to tell typescript where to find your templates when you import them e.g. `"paths": { "views/*": [".views/views/*"] }`. This also means you'll need to set a `baseUrl` e.g. `"baseUrl": "."`.
3. The plugin needs to be configured to set the output extension to `.ts` in your plugin config e.g. `outputExtension: '.ts'`.
4. You'll probably want to use `autoExport: true` in your plugin config too, so that you can write the code portions in ts and just have template in the templates.
5. This plugin should be loaded before `@rollup/plugin-typescript`

Now you can transition your js to ts and enjoy much less stressful refactoring:

```ts
import { template, css } from 'views/template.ractive.html';
import Ractive, { InitOpts } from 'ractive';

export default class MyComponent extends Ractive {
  constructor(opts?: InitOpts) { super(opts); }

  someMethod() {
    this.otherMethod(); // nope!
  }
}

Ractive.extendWith(MyComponent, {
  template, css,
  on: {
    foo: 'bar' // nope!
  }
});
```

## Options

* `extensions`: `string[]` - the list of file extensions to process (defaults to `['.ractive.html', '.ractive', '.ract.html', '.ract']`)
* `root`: `string` - the path prefix used to limit processing i.e. only files in this path are considered processing by ractive
* `autoExport`: `boolean` - automatically export `template` and optionally `css` if the template has no script sections
* `outputExtension`: `string` - change output files to the given extension - only applies if `outputDir` is supplied
* `outputDir`: `string` - write processed files to this directory when loading

### Pass-through options

* `delimiters`: `[string, string]` - the mustache delimiters to use when parsing the template
* `staticDelimiters`: `[string, string]` - the static delimiters to use when parsing the template
* `tripleDelimiters`: `[string, string]` - the triple delimiters to use when parsing the template
* `staticTripleDelimiters`: `[string, string]` - the static triple delimiters to use when parsing the template
* `escapeUnicode`: `boolean` - export non-ascii characters as unicode escape sequences
* `csp`: `boolean` - provide js functions for template expressions so that they don't have to be compiled at runtime (defaults to `true`)
