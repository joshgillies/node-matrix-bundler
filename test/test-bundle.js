var Bundler = require('../')
var extract = require('tar-stream').extract()
var gunzip = require('gunzip-maybe')
var concat = require('concat-stream')
var path = require('path')
var test = require('tape')
var fs = require('fs')

var testFile = path.join(__dirname, '/fixtures/test.txt')
var testName = 'txt/test.txt'
var testContent = fs.readFileSync(testFile, 'utf-8')

test('create bundle', function (assert) {
  var bundle = Bundler()

  bundle.add(testFile)

  extract.on('entry', function (header, stream, next) {
    if (header.name !== testName) return next()

    assert.equal(header.name, testName)
    stream.pipe(concat({ encoding: 'string' }, function (text) {
      assert.equal(text, testContent)
      next()
    }))
  })

  extract.on('finish', function () {
    assert.end()
  })

  bundle.createBundle()
    .pipe(gunzip())
    .pipe(extract)
})
