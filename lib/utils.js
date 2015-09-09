exports.apply = function apply (fn) {
  return function callee () {
    return fn.apply(this, arguments)
  }
}
