#!/usr/bin/env node
const minimist = require('minimist')
const cliOpts = require('cliclopts')
const path = require('path')
const fs = require('fs')

const pkg = require('../package.json')
const sodiumFrontend = require('../')

const allowedOptions = [
  {
    name: 'dest',
    abbr: 'd',
    help: 'path to save keypair',
    default: '.'
  },
  {
    name: 'force',
    abbr: 'f',
    help: 'overwrite existing key files',
    default: false
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

if (argv.help) {
  console.log(`${pkg.name} keygen: Generate a libsodium crypto_sign keypair and save it to disk\n`)
  console.log(`Usage: keygen {options}`)
  opts.print()
  process.exit()
}

if (argv.version) {
  console.log(pkg.version)
  process.exit()
}

const writePath = path.resolve(process.cwd(), argv.dest)
const publicKeyPath = path.join(writePath, 'key.public')
const secretPath = path.join(writePath, 'key.secret')

if (!argv.force) {
  if (fileExistsSync(publicKeyPath)) {
    console.error(`ERROR: key.public already exists in ${writePath}`)
  }

  if (fileExistsSync(secretPath)) {
    console.error(`ERROR: key.secret already exists in ${writePath}`)
  }
  console.error('Use --force to overwrite')
  process.exit(1)
}

sodiumFrontend.keygen(writePath, (err) => {
  if (err) {
    console.error(`ERROR: ${err.message}`)
    process.exit(1)
  }
  console.log(`key.public and key.secret written to ${writePath}`)
})

// Sync io is acceptable for simple CLIs
function fileExistsSync (filePath) {
  try {
    const stat = fs.statSync(filePath)
    return !!stat
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
    return false
  }
}
