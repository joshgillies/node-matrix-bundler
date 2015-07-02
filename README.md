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
  * `opts.globalLinkType`: String defaults to 'TYPE_1'
  * `opts.globalRootNode`: String or Number representing the default root node. Defaults to '1'
  * `opts.globalUnrestricted`: Boolean defaults to false

### bundle.add(file, content, opts)

The `file` argument accpets a String representing the path of a file you wish to add to the bundle.

The `content` argument accepts an optional Buffer or String containing the contents of the file
you wish to add to the bundle. If undefined, `Bundler` will use the relative path
supplied as the `file` argument to source the file contents.

The `opts` argument accepts an object with the following properties:

  * `opts.id`
  * `opts.parentId`
  * `opts.file`
  * `opts.type`
  * `opts.link`
  * `opts.value`
  * `opts.dependant`
  * `opts.exclusive`

These `opts` are used to define attributes of the resulting File Asset within Squiz Matrix.

### bundle.createBundle()

Bundle the files and the Import XML Manifest into a singe file.

Returns a readable stream with the gzipped contents of your bundle.

## License

MIT

[node-matrix-importer]: https://github.com/joshgillies/node-matrix-importer
[Bulk File Import Tool]: http://manuals.matrix.squizsuite.net/tools/chapters/bulk-file-import-tool
[Import Assets from XML Tool]: http://manuals.matrix.squizsuite.net/tools/chapters/import-assets-from-xml-tool
