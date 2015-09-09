var EventEmitter = require('events').EventEmitter
var fileAsset = require('node-matrix-file-types')
var Importer = require('node-matrix-importer')
var inherits = require('inherits')
var Bundler = require('./bundler')
var apply = require('./utils').apply
var path = require('path')
var fs = require('fs')

module.exports = FileBundle

function FileBundle (opts) {
  if (!(this instanceof FileBundle)) {
    return new FileBundle(opts)
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

  var writer = opts.writer
  var bundler = Bundler()

  EventEmitter.call(this)

  bundler.on('error', function onError (err) {
    this.emit('error', err)
  }.bind(this))

  this.globalLinkType = opts.globalLinkType
  this.globalRootNode = opts.globalRootNode
  this.globalUnrestricted = !!opts.globalUnrestricted

  this._add = apply(bundler.add).bind(bundler)
  this._createBundle = apply(bundler.createBundle).bind(bundler)
  this._createAsset = apply(writer.createAsset).bind(writer)
  this._setAttribute = apply(writer.setAttribute).bind(writer)
  this._addPath = apply(writer.addPath).bind(writer)
  this._toString = apply(writer.toString).bind(writer)
}

inherits(FileBundle, EventEmitter)

FileBundle.prototype.add = function addFile (file, content, opts) {
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
  var destination = opts.file = ['export', opts.type, base].join('/')
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
    this._add({ name: destination }, data)
  }

  if (Buffer.isBuffer(content) || typeof content === 'string') {
    addEntry.call(this, null, content)
  } else {
    fs.readFile(source, addEntry.bind(this))
  }
}

FileBundle.prototype.createBundle = function createBundle () {
  this._add({ name: 'export.xml' }, this._toString())
  return this._createBundle()
}
