var EventEmitter = require('events').EventEmitter
var fileAsset = require('node-matrix-file-types')
var Importer = require('node-matrix-importer')
var PassThrough = require('readable-stream').PassThrough
var inherits = require('inherits')
var Buffer = Buffer || require('buffer').Buffer
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
  this.stream = new PassThrough()
  this.isStreaming = false
  this.pending = 0
  this.globalLinkType = opts.globalLinkType
  this.globalRootNode = opts.globalRootNode
  this.globalUnrestricted = !!opts.globalUnrestricted
}

inherits(Bundler, EventEmitter)

Bundler.prototype.add = function addFile (file, content, opts) {

  this.pending++

  if (!Buffer.isBuffer(content) && typeof content === 'object') {
    opts = content
    content = undefined
  }

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

  if (this.globalRootNode && !opts.parentId) {
    opts.parentId = this.globalRootNode
  }

  if (!opts.type) {
    opts.type = fileAsset(file)
  }

  if (!opts.link) {
    opts.link = this.globalLinkType
  }

  var source = opts.file
  var base = path.basename(source)
  var destination = opts.file = opts.type + '/' + base
  var entry = this.writer.createAsset(opts)

  this.writer.addPath({
    assetId: entry.id,
    path: base
  })

  if (this.globalUnrestricted) {
    this.writer.setAttribute({
      assetId: entry.id,
      attribute: 'allow_unrestricted',
      value: this.globalUnrestricted
    })
  }

  function addEntry (err, data) {
    if (err) {
      this.emit('error', err)
      return
    }

    --this.pending

    this.packer.entry({ name: destination }, data)
  }

  if (Buffer.isBuffer(content) || typeof content === 'string') {
    addEntry.call(this, null, content)
  } else {
    fs.readFile(source, addEntry.bind(this))
  }
}

Bundler.prototype.createBundle = function createBundle () {
  if (this.pending) {
    setTimeout(function () {
      this.createBundle()
    }.bind(this), 100)

    if (this.isStreaming) {
      return
    } else {
      this.isStreaming = true
      return this.stream
    }
  } else {
    this.packer.entry({ name: 'export.xml' }, this.writer.toString())
    this.packer.finalize()

    if (this.isStreaming) {
      this.packer.pipe(gzip).pipe(this.stream)
    } else {
      return this.packer.pipe(gzip)
    }
  }
}

module.exports = Bundler
