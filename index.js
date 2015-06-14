var EventEmitter = require('events').EventEmitter
var Importer = require('node-matrix-importer')
var inherits = require('inherits')
var gzip = require('zlib').createGzip()
var path = require('path')
var tar = require('tar-stream')
var fs = require('fs')

function Bundler (opts) {
  if (!(this instanceof Bundler)) {
    return new Bundler(opts)
  }

  if (!opts) {
    opts = {}
  }

  if (!opts.writer) {
    opts.writer = Importer()
  }

  if (!opts.globalLinkType) {
    opts.globalLinkType = 1
  }

  EventEmitter.call(this)

  this.writer = opts.writer
  this.packer = tar.pack()
  this.globalLinkType = opts.globalLinkType
  this.globalUnrestricted = !!opts.globalUnrestricted
}

inherits(Bundler, EventEmitter)

Bundler.prototype.add = function addFile (file, opts) {
  if (typeof file === 'object') {
    opts = file
    file = undefined
  }

  if (!opts) {
    opts = {}
  }

  if (typeof file === 'string') {
    opts.file = file
  }

  if (!opts.type) {
    opts.type = 'file'
  }

  if (!opts.link) {
    opts.link = this.globalLinkType
  }

  var source = opts.file
  var destination = opts.file = (function destinationPath (opts) {
    return opts.ext.replace('.', '') + '/' + opts.base
  })(path.parse(source))

  var entry = this.writer.createAsset(opts)
  this.writer.addPath({
    assetId: entry.id,
    path: destination
  })

  if (this.globalUnrestricted) {
    this.writer.setAttribute({
      assetId: entry.id,
      attribute: 'allow_unrestricted',
      value: this.globalUnrestricted
    })
  }

  function addEntry (err, buf) {
    if (err) {
      this.emit('error', err)
      return
    }

    this.packer.entry({ name: destination }, buf)
    this.packer.finalize()
  }

  fs.readFile(source, addEntry.bind(this))
}

Bundler.prototype.createBundle = function createBundle (cb) {
  this.packer.entry({ name: 'export.xml' }, this.writer.toString())

  if (!cb) {
    return this.packer.pipe(gzip)
  }
}

module.exports = Bundler
