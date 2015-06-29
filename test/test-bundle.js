var Bundler = require('../')
var extract = require('tar-stream').extract()
var gunzip = require('gunzip-maybe')
var concat = require('concat-stream')
var path = require('path')
var test = require('tape')
var fs = require('fs')

var fixtures = {
  'text_file/test.txt': {
    source: path.join(__dirname, '/fixtures/test.txt'),
    content: fs.readFileSync(path.join(__dirname, '/fixtures/test.txt'))
  },
  'css_file/style.css': {
    source: 'style.css',
    content: 'body { background: #000 }'
  },
  'image/baboon.png': {
    source: 'baboon.png',
    content: fs.readFileSync(require('resolve').sync('baboon-image/baboon.png'))
  },
  'export.xml': {
    source: path.join(__dirname, '/fixtures/export.xml'),
    content: fs.readFileSync(path.join(__dirname, '/fixtures/export.xml'))
  }
}

test('create bundle', function (assert) {
  var bundle = Bundler()

  bundle.add(fixtures['text_file/test.txt'].source)

  bundle.add(fixtures['image/baboon.png'].source, fixtures['image/baboon.png'].content)

  bundle.add(fixtures['css_file/style.css'].source, fixtures['css_file/style.css'].content)

  extract.on('entry', function (header, stream, next) {
    if (header.name in fixtures) {
      stream.pipe(concat(function (buf) {
        if (header.name === 'css_file/style.css') assert.deepEqual(buf.toString(), fixtures[header.name].content)
        else assert.deepEqual(buf, fixtures[header.name].content)
        next()
      }))
    } else next()
  })

  extract.on('finish', function () {
    assert.end()
  })

  // async smell. Should look into this!
  bundle.createBundle()
    .pipe(gunzip())
    .pipe(extract)
})

test('configure bundle', function (assert) {
  var defaults = Bundler()
  var custom = Bundler({
    globalLinkType: 2,
    globalUnrestricted: true,
    globalRootNode: '100'
  })

  assert.equal(defaults.globalLinkType, 1)
  assert.equal(defaults.globalUnrestricted, false)

  assert.equal(custom.globalLinkType, 2)
  assert.equal(custom.globalUnrestricted, true)
  assert.equal(custom.globalRootNode, '100')
  assert.end()
})
