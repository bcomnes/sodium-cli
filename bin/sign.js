#!/usr/bin/env node
const minimist = require('minimist')
const cliOpts = require('cliclopts')
const path = require('path')

const pkg = require('../package.json')
const sodiumFrontend = require('../')

const allowedOptions = [
  {
    name: 'secret',
    abbr: 's',
    help: 'path to secret key to sign with',
    default: './key.secret'
  },
  {
    name: 'help',
    abbr: 'h',
    help: 'show help',
    boolean: true
  },
  {
    name: 'version',
    abbr: 'v',
    help: 'print the version of the program'
  }
]

const opts = cliOpts(allowedOptions)
const argv = minimist(process.argv.slice(2), opts.options())

const argPath = argv._[0]

if (argv.version) {
  console.log(pkg.version)
  process.exit()
}

if (argv.help || !argPath) {
  console.log(`${pkg.name} sign: Sign a file with a libsodium crypto_sign secret key and print to stdout\n`)
  console.log(`Usage: sign [file] {options}`)
  opts.print()
  process.exit(argv.help ? 0 : 1)
}

const secretPath = path.resolve(process.cwd(), argv.secret)
const filePath = path.resolve(process.cwd(), argPath)

sodiumFrontend.sign(secretPath, filePath, (err, signature) => {
  if (err) {
    console.error(`ERROR: ${err.message}`)
    process.exit(1)
  }

  console.log(signature)
})
