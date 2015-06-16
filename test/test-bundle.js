var Bundler = require('../')
var extract = require('tar-stream').extract()
var gunzip = require('gunzip-maybe')
var concat = require('concat-stream')
var path = require('path')
var test = require('tape')
var fs = require('fs')

var fixtures = {
  'txt/test.txt': {
    source: path.join(__dirname, '/fixtures/test.txt'),
    content: fs.readFileSync(path.join(__dirname, '/fixtures/test.txt'))
  },
  'export.xml': {
    source: path.join(__dirname, '/fixtures/export.xml'),
    content: fs.readFileSync(path.join(__dirname, '/fixtures/export.xml'))
  }
}

test('create bundle', function (assert) {
  var bundle = Bundler()

  bundle.add(fixtures['txt/test.txt'].source)

  extract.on('entry', function (header, stream, next) {
    if (header.name in fixtures) {
      stream.pipe(concat(function (text) {
        assert.deepEqual(text, fixtures[header.name].content)
        next()
      }))
    } else return next()
  })

  extract.on('finish', function () {
    assert.end()
  })

  bundle.createBundle()
    .pipe(gunzip())
    .pipe(extract)
})
