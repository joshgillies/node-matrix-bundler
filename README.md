# node-matrix-bundler

Generate file bundles for import into Squiz Matrix systems. Useful as an alternative
to the cubmersome [Bulk File Import Tool].

## Example

```js
var Bundler = require('node-matrix-bundler')
var bundle = Bundler('./')

bundle.add('./source/path.txt', function (err, path) {
  console.log(path)
  // returns './destination/path.txt'
})

bundle.createBundle(function (err, bundle) {
  
})
```

## API (WIP)

### Bundler

### var bundle = Bundler(baseDir)

### bundle.add(path, cb)

### bundle.createBundle(path, cb)

## License

MIT

[Bulk File Import Tool]: http://manuals.matrix.squizsuite.net/tools/chapters/bulk-file-import-tool
