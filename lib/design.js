var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var Bundler = require('./bundler')
var apply = require('./utils').apply
var path = require('path')
var fs = require('fs')

module.exports = Design

function Design (parseFile) {
  if (!(this instanceof Design)) {
    return new Design(parseFile)
  }

  if (!parseFile) {
    throw new Error('parse file required')
  }

  var bundler = Bundler()

  EventEmitter.call(this)

  bundler.on('error', function onError (err) {
    this.emit('error', err)
  }.bind(this))

  this._add = apply(bundler.add).bind(bundler)
  this._createBundle = apply(bundler.createBundle).bind(bundler)
  this._parseFile = parseFile
  this._ready = function ready () {
    return !bundler._pending
  }
}

inherits(Design, EventEmitter)

Design.prototype.add = function add (file, content, opts) {
  function addEntry (err, data) {
    if (err) {
      this.emit('error', err)
      return
    }
    this._add({ name: path.basename(file) }, data)
  }

  if (Buffer.isBuffer(content) || typeof content === 'string') {
    addEntry.call(this, null, content)
  } else {
    fs.readFile(file, addEntry.bind(this))
  }
}

Design.prototype.createBundle = function createBundle () {
  return this._createBundle()
}
