# node-matrix-bundler

Generate file bundles for import into Squiz Matrix systems. Useful as an alternative
to the cubmersome "[Bulk File Import Tool]".

Generated bundles are compatible with but not exclusive to the "[Import Assets from XML Tool]" 

[![Build Status](https://travis-ci.org/joshgillies/node-matrix-bundler.svg)](https://travis-ci.org/joshgillies/node-matrix-bundler)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Example

```js
var Bundler = require('node-matrix-bundler')
var bundle = Bundler()

bundle.add('./source/path.txt')

bundle.createBundle()
  .pipe(fs.createWriteStream('./bundle.tgz'))
```

## API (WIP)

### Bundler

`node-matrix-bundler` provides an API for generating Squiz Matrix compatible file bundles via `require('node-matrix-bundler')`.

### var bundle = Bundler(opts)

The `opts` argument accepts an object with the following properties:

  * `opts.writer`: `writer` is a mechanism for producing Squiz Matrix compatible input. Defaults to [node-matrix-importer].
  * `opts.globalLinkType`: String defaults 'TYPE_1'
  * `opts.globalUnrestricted`: Bool defaults false

### bundle.add(path, opts)

The `path` argument accpets a String representing the path of a file you wish to add to the bundle.

The `opts` argument accepts an object with the following properties:

  * `opts.id`
  * `opts.parentId`
  * `opts.file`
  * `opts.type`
  * `opts.link`
  * `opts.value`
  * `opts.dependant`
  * `opts.exclusive`

### bundle.createBundle()

## License

MIT

[node-matrix-importer]: https://github.com/joshgillies/node-matrix-importer
[Bulk File Import Tool]: http://manuals.matrix.squizsuite.net/tools/chapters/bulk-file-import-tool
[Import Assets from XML Tool]: http://manuals.matrix.squizsuite.net/tools/chapters/import-assets-from-xml-tool
