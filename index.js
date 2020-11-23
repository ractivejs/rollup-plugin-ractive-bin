const fs = require('fs');
const path = require('path');
const component = require('ractive/lib/component');

const rcache = {};

module.exports = function ractive(options) {
  const opts = options || {};
  const extensions = opts.extensions || ['.ract.html', '.ractive.html', '.ractive', '.ract'];

  return {
    name: 'ractive-bin',
    async resolveId(id) {
      if (id.startsWith(opts.root || '') && (!path.extname(id) || extensions.find(e => id.endsWith(e)))) {
        if (!path.extname(id)) {
          for (const e of extensions) {
            try {
              await new Promise((ok, fail) => fs.stat(`${id}${e}`, err => err ? fail(err) : ok()));
              const res = await resolveFile.call(this, id, `${id}${e}`, opts);
              return res;
            } catch {}
          }
        } else {
          try {
            await new Promise((ok, fail) => fs.stat(id, err => err ? fail(err) : ok()));
            const res = await resolveFile.call(this, id, id, opts);
            return res;
          } catch {}
        }
      }
    },
    async load(id) {
      if (rcache[id]) {
        let cache = rcache[id];
        if (cache.redo) {
          const src = rcache[cache.redo];
          await resolveFile.call(this, cache.redo, src.src, opts);
        }
        cache = rcache[id];
        if (cache.watches) {
          cache.watches.forEach(w => {
            this.addWatchFile(w);
          })
        } else {
          this.addWatchFile(cache.src);
          return new Promise((ok, fail) => fs.readFile(cache.dest, { encoding: 'utf8' }, (err, data) => err ? fail(err) : ok(data)));
        }
      }
      if (extensions.find(e => id.endsWith(e))) {
        const res = await loadFile.call(this, id, opts);
        return res;
      }
    },
    watchChange(file) {
      if (rcache[file] && rcache[file].watches) {
        if (rcache[file].redone) {
          delete rcache[file].redone;
        } else {
          rcache[file].redo = rcache[file].src;
        }
      } else {
        for (const [k, v] of Object.entries(rcache)) {
          if (v.sources && ~v.sources.indexOf(file)) {
            rcache[v.dest].redo = k;
          }
        }
      }
    }
  }
};

async function resolveFile(id, file, opts) {
  if (opts.outputDir) {
    const res = await loadFile.call(this, file, opts);
    const dest = path.resolve(opts.outputDir, `${id}${opts.outputExtension || '.js'}`);
    await new Promise((ok, fail) => fs.mkdir(path.dirname(dest), { recursive: true }, err => err ? fail(err) : ok()));
    if (rcache) {
      rcache[id] = { src: file, dest, sources: res.watches };
      rcache[dest] = { watches: res.watches, src: id, redone: true };
    }
    await new Promise((ok, fail) => fs.writeFile(dest, res.code, err => err ? fail(err) : ok()));
    return dest;
  }
  return file;
}

async function loadFile(id, opts) {
  const str = await new Promise((ok, fail) => fs.readFile(id, { encoding: 'utf8' }, (err, data) => err ? fail(err) : ok(data)));
  const watches = [path.resolve(id)];

  const readFile = file => {
    if (Array.isArray(file)) file = path.join.apply(path, file)
    const f = path.join(path.dirname(id), file);
    return new Promise((ok, fail) => {
      fs.readFile(f, { encoding: 'utf8' }, (err, data) => {
        if (err) return fail(err);
        ok(data);
        const resolved = path.resolve(path.dirname(id), file);
        watches.push(resolved);
      });
    });
  }

  try {
    const code = await component.build(str, opts, readFile);
    return { code, watches };
  } catch (e) {
    console.error(e);
    this.error(e);
  }
}
