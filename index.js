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

  PassThrough.call(this)

  var packer = tar.pack()
  var writer = opts.writer

  this._createAsset = function createAsset () {
    return writer.createAsset.apply(writer, arguments)
  }
  this._setAttribute = function setAttribute () {
    return writer.setAttribute.apply(writer, arguments)
  }
  this._addPath = function addPath () {
    return writer.addPath.apply(writer, arguments)
  }
  this._toString = function toString () {
    return writer.toString.apply(writer, arguments)
  }

  this._entry = function entry () {
    return packer.entry.apply(packer, arguments)
  }
  this._finalize = function finalize () {
    return packer.finalize.apply(packer, arguments)
  }
  this._tarStream = function tarStream () {
    return packer
  }

  this._isStreaming = false
  this._pending = 0

  this.globalLinkType = opts.globalLinkType
  this.globalRootNode = opts.globalRootNode
  this.globalUnrestricted = !!opts.globalUnrestricted
}

inherits(Bundler, PassThrough)

Bundler.prototype.add = function addFile (file, content, opts) {

  this._pending++

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
  var entry = this._createAsset(opts)

  this._addPath({
    assetId: entry.id,
    path: base
  })

  if (this.globalUnrestricted) {
    this._setAttribute({
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

    --this._pending

    this._entry({ name: destination }, data)
  }

  if (Buffer.isBuffer(content) || typeof content === 'string') {
    addEntry.call(this, null, content)
  } else {
    fs.readFile(source, addEntry.bind(this))
  }
}

Bundler.prototype.createBundle = function createBundle () {
  if (this._pending) {
    setImmediate(function deferBundle () {
      this.createBundle()
    }.bind(this))

    if (this._isStreaming) {
      return
    } else {
      this._isStreaming = true
      return this
    }
  } else {
    this._entry({ name: 'export.xml' }, this._toString())
    this._finalize()

    if (this._isStreaming) {
      this._tarStream().pipe(gzip).pipe(this)
    } else {
      return this._tarStream().pipe(gzip)
    }
  }
}

module.exports = Bundler
