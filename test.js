const tmp = require('temporary-directory')
const parallel = require('run-parallel')
const test = require('tape')
const path = require('path')
const fs = require('fs')

const sodiumFrontend = require('.')

function getUnixPerms (mode) {
  return '0' + (mode & parseInt('777', 8)).toString(8)
}

test('create a keypair and save it to a destination', t => {
  tmp((err, dir, cleanup) => {
    t.error(err, 'tmp dir created')
    sodiumFrontend.keygen(dir, (err) => {
      t.error(err, 'Keys generated and saved without error')
      const publicPath = path.join(dir, 'key.public')
      const secretPath = path.join(dir, 'key.secret')
      parallel([
        cb => sodiumFrontend.readKeyFile(publicPath, cb),
        cb => sodiumFrontend.readKeyFile(secretPath, cb)
      ], (err, results) => {
        t.error(err, 'read key files without error')
        const [publicHex, secretHex] = results

        console.log(`key.public: ${publicHex}`)
        console.log(`key.secret: ${secretHex}`)

        t.true(sodiumFrontend.validatePublic(publicHex), 'public key validates')
        t.true(sodiumFrontend.validateSecret(secretHex), 'secret key validates')

        const secretStat = fs.statSync(secretPath)
        const publicStat = fs.statSync(publicPath)
        t.equal(getUnixPerms(publicStat.mode), '0600', 'public key is mode 0600')
        t.equal(getUnixPerms(secretStat.mode), '0600', 'secret key is mode 0600')

        cleanup(err => {
          t.error(err, 'tmp dir cleaned up')
          t.end()
        })
      })
    })
  })
})

test('sign a file with a secret key', t => {
  tmp((err, dir, cleanup) => {
    t.error(err, 'tmp dir created')
    const keyPair = {
      public: '22c9db894a80a770e0c17db52bf78483a3942245166b5342ffc4667c417235c0',
      secret: 'f22b7f50ebb553e86e304b4bb933eef98b6bb1e293a5181ad914d45b7490c9d822c9db894a80a770e0c17db52bf78483a3942245166b5342ffc4667c417235c0'
    }
    const fileContents = 'Hello world'

    const secretPath = path.join(dir, 'key.secret')
    const filePath = path.join(dir, 'my-file.txt')
    const publicPath = path.join(dir, 'key.public')

    fs.writeFileSync(publicPath, keyPair.public)
    fs.writeFileSync(secretPath, keyPair.secret)
    fs.writeFileSync(filePath, fileContents)

    sodiumFrontend.sign(secretPath, filePath, (err, hexSig) => {
      t.error(err, 'signed file from key file witout error')
      console.log(`signature: ${hexSig}`)
      t.true(sodiumFrontend.validateSignature(hexSig), 'signature appears valid')

      cleanup(err => {
        t.error(err, 'tmp dir cleaned up')
        t.end()
      })
    })
  })
})

test('verify a file with a public key and signature', t => {
  tmp((err, dir, cleanup) => {
    t.error(err, 'tmp dir created')
    const keyPair = {
      public: '22c9db894a80a770e0c17db52bf78483a3942245166b5342ffc4667c417235c0',
      secret: 'f22b7f50ebb553e86e304b4bb933eef98b6bb1e293a5181ad914d45b7490c9d822c9db894a80a770e0c17db52bf78483a3942245166b5342ffc4667c417235c0'
    }
    const fileContents = 'Hello world'
    const signature = 'e13db0eac04dd26c7d0ca500fbca1b87e6d47489b45040d5d363aa98e6fd80ca2f345c6e7fa1d8b7ab705b5bcc0b7eb1dfbda6523bb42f0b4c4394a6aefc1702'
    const invalidSig = 'a' + signature.substr(1) // Change the first character

    const secretPath = path.join(dir, 'key.secret')
    const filePath = path.join(dir, 'my-file.txt')
    const publicPath = path.join(dir, 'key.public')

    fs.writeFileSync(publicPath, keyPair.public)
    fs.writeFileSync(secretPath, keyPair.secret)
    fs.writeFileSync(filePath, fileContents)

    sodiumFrontend.verify(signature, publicPath, filePath, (err, valid) => {
      t.error(err, 'validates without error')
      t.true(valid, 'valid signature of file validates')

      sodiumFrontend.verify(invalidSig, publicPath, filePath, (err, valid) => {
        t.error(err, 'validates without error')
        t.false(valid, 'invalid signature is invalid')

        cleanup(err => {
          t.error(err, 'tmp dir cleaned up')
          t.end()
        })
      })
    })
  })
})
