#!/usr/bin/env node
const minimist = require('minimist')
const cliOpts = require('cliclopts')
const path = require('path')

const pkg = require('../package.json')
const sodiumFrontend = require('../')

const allowedOptions = [
  {
    name: 'public',
    abbr: 'p',
    help: 'path to public key file to verify with',
    default: './key.public'
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

const hexSignature = argv._[0]
const argFilePath = argv._[1]

if (argv.help || !argFilePath || !hexSignature) {
  console.log(`${pkg.name} verify: Verify a file with a libsodium crypto_sign public key and signature\n`)
  console.log(`Usage: verify [signature] [file] {options}`)
  opts.print()
  process.exit()
}

if (argv.version) {
  console.log(pkg.version)
  process.exit()
}

const publicPath = path.resolve(process.cwd(), argv.public)
const filePath = path.resolve(process.cwd(), argFilePath)

sodiumFrontend.verify(hexSignature, publicPath, filePath, (err, valid) => {
  if (err) {
    console.error(`ERROR: ${err.message}`)
    process.exit(1)
  }

  if (valid) {
    console.log(`Valid signature for ${argFilePath} by ${argv.public}`)
  } else {
    console.error(`INVALID SIGNATURE: signature for ${argFilePath} is not valid for ${argv.public}`)
  }
})
