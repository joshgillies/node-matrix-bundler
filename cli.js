var Bundler = require('../')
var argv = require('minimist')(process.argv.slice(2))
var fs = require('fs')

var bundle = Bundler()
var entry = argv.entry || argv.e || '.'
var output = argv.output || argv.o || './export.tgz'

if (!argv.length || argv.h || argv.help) {
  console.log(help())
}

bundle.createBundle()
  .pipe(fs.createWriteStream(output))

function help () {
  return [
    'Usage:',
    '  matrix-bundler [entry] [opts]',
    '',
    'Options:',
    '  --help, -h           show help message',
    '  --entry, -e          the enrty point for bundler, default "."',
    '  --output, -o         the exported file bundle, default "./export.tgz"',
    '  --parent, -p         an asset id to import the files under, default "1"',
    '  --link, -l           the link type all assets will be imported as, default "TYPE_1"',
    '  --unrestricted, -u   whether unrestricted access is allowed, default "false"',
    '',
    'Examples:',
    '  matrix-bundler --entry ./files --link 2 --unrestricted --output ./files.tgz'
  ].join('\n')
}
