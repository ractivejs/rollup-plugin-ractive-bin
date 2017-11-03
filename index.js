const fs = require('fs');
const path = require('path');
const createFilter = require('rollup-pluginutils').createFilter;
const component = require('ractive/lib/component');

module.exports = function ractive(options) {
  const opts = options || {};
  const filter = createFilter(opts.include || '**/*.ractive.html');

  return {
    name: 'ractive-bin',
    transform(code, id) {
      if (!filter(id)) return;

      function readFile(file) {
        const f = path.join(path.dirname(id), file);
        return new Promise((ok, fail) => {
          fs.readFile(f, { encoding: 'utf8' }, (err, data) => {
            if (err) return fail(err);
            ok(data);
          });
        });
      }

      return component.build(code, opts, readFile).then(out => {
        return { code: out, map: { mappings: '' } };
      });
    }
  }
};
