const sodium = require('sodium-native')
const fs = require('fs')
const path = require('path')
const parallel = require('run-parallel')

function keygen (dest, cb) {
  const publicKey = sodium.sodium_malloc(sodium.crypto_sign_PUBLICKEYBYTES)
  const secretKey = sodium.sodium_malloc(sodium.crypto_sign_SECRETKEYBYTES)

  // Fill buffers with new keypair
  sodium.crypto_sign_keypair(publicKey, secretKey)

  parallel([
    cb => writeKey(dest, 'key.public', publicKey, cb),
    cb => writeKey(dest, 'key.secret', secretKey, cb)
  ], (err, _) => {
    if (err) return cb(err)
    sodium.sodium_memzero(publicKey)
    sodium.sodium_memzero(secretKey)
    cb(null)
  })
}
exports.keygen = keygen

function sign (secretPath, filePath, cb) {
  parallel([
    cb => readSecret(secretPath, cb),
    cb => fs.readFile(filePath, cb)
  ], (err, results) => {
    if (err) return cb(err)

    const [secretKey, fileBuffer] = results
    const signature = sodium.sodium_malloc(sodium.crypto_sign_BYTES)

    sodium.crypto_sign_detached(signature, fileBuffer, secretKey)

    // TODO figure out if this does anything helpful
    sodium.sodium_memzero(secretKey)

    cb(null, signature.toString('hex'))
  })
}
exports.sign = sign

function verify (hexSignature, publicPath, filePath, cb) {
  if (!validateSignature(hexSignature)) return cb(new Error('Signature appears invalid'))

  parallel([
    cb => readPublic(publicPath, cb),
    cb => fs.readFile(filePath, cb)
  ], (err, results) => {
    if (err) return cb(err)

    const [publicKey, fileBuffer] = results
    const signature = Buffer.from(hexSignature, 'hex')

    cb(null, sodium.crypto_sign_verify_detached(signature, fileBuffer, publicKey))
  })
}
exports.verify = verify

function writeKey (dest, name, key, cb) {
  return fs.writeFile(path.join(dest, name), key.toString('hex') + '\n', { mode: '0600' }, cb)
}
exports.writeKey = writeKey

function validateSignature (hexSig) {
  return !!hexSig.match(/^[a-z0-9]{128}$/)
}
exports.validateSignature = validateSignature

function validateSecret (hexSecret) {
  return !!hexSecret.match(/^[a-z0-9]{128}$/)
}
exports.validateSecret = validateSecret

function validatePublic (hexPublic) {
  return !!hexPublic.match(/^[a-z0-9]{64}$/)
}
exports.validatePublic = validatePublic

function readSecret (keyPath, cb) {
  // TODO Use fs.open, fs.read and sodium_malloc from a hex key maybe
  // Maybe need to encrypt keys at rest and add secure password entry before its worth while
  readKeyFile(keyPath, (err, secretKeyHex) => {
    if (err) return cb(err)
    if (!validateSecret(secretKeyHex)) {
      return cb(new Error('Secret key appears invalid'))
    }
    return cb(null, Buffer.from(secretKeyHex, 'hex'))
  })
}

function readPublic (keyPath, cb) {
  readKeyFile(keyPath, (err, publicKeyHex) => {
    if (err) return cb(err)
    if (!validatePublic(publicKeyHex)) {
      return cb(new Error('Public key appears invalid'))
    }
    return cb(null, Buffer.from(publicKeyHex, 'hex'))
  })
}

function readKeyFile (keyPath, cb) {
  fs.readFile(keyPath, 'utf-8', (err, data) => {
    if (err) return cb(err)
    const hexKey = data.split('\n')[0]
    return cb(null, hexKey)
  })
}
exports.readKeyFile = readKeyFile
