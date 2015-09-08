var PassThrough = require('readable-stream').PassThrough
var inherits = require('inherits')
var Buffer = Buffer || require('buffer').Buffer
var gzip = require('zlib').createGzip()
var tar = require('tar-stream')

module.exports = Bundler

function Bundler (opts) {
  if (!(this instanceof Bundler)) {
    return new Bundler(opts)
  }

  if (!opts) {
    opts = {}
  }

  PassThrough.call(this)

  var pack = tar.pack()

  this._entry = function entry () {
    return pack.entry.apply(pack, arguments)
  }
  this._finalize = function finalize () {
    return pack.finalize.apply(pack, arguments)
  }
  this._tarStream = function tarStream () {
    return pack
  }

  this._isStreaming = false
  this._pending = 0
}

inherits(Bundler, PassThrough)

Bundler.prototype.add = function addEntry (headers, buffer) {
  this._pending++
  this._entry(headers, buffer, onError.bind(this))

  function onError (err) {
    if (err) {
      this.emit('error', err)
    }
    --this._pending
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
    this._finalize()

    if (this._isStreaming) {
      this._tarStream().pipe(gzip).pipe(this)
    } else {
      return this._tarStream().pipe(gzip)
    }
  }
}
