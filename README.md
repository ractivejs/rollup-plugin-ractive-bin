# ractive-bin-loader

This [rollup](https://rollupjs.org) plugin allows you to write [Ractive.js](https://ractive.js.org) components and pre-compile them with the rest of your build.

## Installation

```sh
npm install --save-dev rollup-plugin-ractive-bin
```

## Usage

Import the plugin from your rollup config or add it on the command line.

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
    They can also include a src attribute to be loaded from an external file.
  </p>
</script>

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
