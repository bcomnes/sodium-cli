# sodium-cli

[![npm version][npm-img]][npm] [![build status][travis-img]][travis]

A simple CLI frontend for [sodium-native](https://github.com/sodium-friends/sodium-native) actions.

## Installation

```console
npm install sodium-cli -g
```

## Usage

`sodium-cli` ships with a few cli commands and a common.js api.

The CLI ships three commands:

```console
$ keygen

key.public and key.secret written to /Users/bret/repos/sodium-cli

$ sign index.js

6be2ee42223ac80784c9ad19c3898a35a0ac012ae0938e546deda8d479291494c316eb2f2a3bb1dda695fbe84819de8a9ec43f356b69bd7f0cf0190b11230809

$ verify 6be2ee42223ac80784c9ad19c3898a35a0ac012ae0938e546deda8d479291494c316eb2f2a3bb1dda695fbe84819de8a9ec43f356b69bd7f0cf0190b11230809 index.js

Valid signature for index.js by ./key.public
```

There is also an API counterpart for each command:

```js
const sodiumCLI = require('sodium-cli')
const cwd = process.cwd()

sodiumCLI.keygen(cwd, err => {
  if (err) throw err
  sodiumCLI.sign('./secret.key', './some-file', (err, sig) => {
    if (err) throw err
    sodiumCLI.verify(sig, './public.key', './some-file', (err, valid) => {
      if (err) throw err
      console.log('Signature is valid ' + valid)
    })
  })
})
```

## CLI

### `keygen`

Generate a libsodium [crypto_sign keypair](https://download.libsodium.org/doc/public-key_cryptography/public-key_signatures#key-pair-generation) and save it to disk.

```console
$ keygen --help

sodium-cli keygen: Generate a libsodium crypto_sign keypair and save it to disk

Usage: keygen {options}
    --dest, -d            path to save keypair (default: ".")
    --force, -f           overwrite existing key files (default: false)
    --help, -h            show help
    --version, -v         print the version of the program

$ keygen

key.public and key.secret written to /Users/bret/repos/sodium-cli

$ ls key*

key.public key.secret
```

If `keygen` finds any existing keys in the destination directory, it will refuse to generate new keys unless you pass the `--force` flag.

### `sign [file]`

[Sign](https://libsodium.gitbook.io/doc/public-key_cryptography/public-key_signatures#detached-mode) a file with a libsodium crypto_sign secret key and print to stdout.

```console
$ sign --help

sodium-cli sign: Sign a file with a libsodium crypto_sign secret key and print to stdout

Usage: sign [file] {options}
    --secret, -s          path to secret key to sign with (default: "./key.secret")
    --help, -h            show help
    --version, -v         print the version of the program

$ sign index.js
6be2ee42223ac80784c9ad19c3898a35a0ac012ae0938e546deda8d479291494c316eb2f2a3bb1dda695fbe84819de8a9ec43f356b69bd7f0cf0190b11230809
```

### `verify [signature] [public key]`

[Verify](https://libsodium.gitbook.io/doc/public-key_cryptography/public-key_signatures#detached-mode) a file with a libsodium crypto_sign public key and signature.

```console
$ verify
sodium-cli verify: Verify a file with a libsodium crypto_sign public key and signature

Usage: verify [signature] [file] {options}
    --public, -p          path to public key file to verify with (default: "./key.public")
    --help, -h            show help
    --version, -v         print the version of the program
$ verify 6be2ee42223ac80784c9ad19c3898a35a0ac012ae0938e546deda8d479291494c316eb2f2a3bb1dda695fbe84819de8a9ec43f356b69bd7f0cf0190b11230809 index.js

Valid signature for index.js by ./key.public

$ verify badSig index.js

ERROR: Signature appears invalid
```

## API

### `sodiumCLI.keygen(destination, callback)`

Generate a libsodium [crypto_sign keypair](https://download.libsodium.org/doc/public-key_cryptography/public-key_signatures#key-pair-generation) and save it to a `destination` path as `destination/public.key` and `destination/secret.key`.  Any existing key files are overwritten.

Callback is called with `(err)` after the key files are written to disk.

### `sodiumCLI.sign(secretPath, filePath, callback)`

[Sign](https://libsodium.gitbook.io/doc/public-key_cryptography/public-key_signatures#detached-mode) a file at `filePath` with a libsodium crypto_sign secret key located at `secretPath`.

Callback is called with `(err, signature)` where `signature` is the hex representation of the signature.

### `sodiumCLI.verify(signature, publicPath, filePath, callback)`

[Verify](https://libsodium.gitbook.io/doc/public-key_cryptography/public-key_signatures#detached-mode) a file at `filePath` with a libsodium crypto_sign public key located at `publicPath` and detached  libsodium hex `signature`.

Callback is called with `(err, valid)` where `valid` is a boolean indicating if the file is valid for the signature, public key and file combination.

## See also

- [sodium-native](https://github.com/sodium-friends/sodium-native): the underlying bindings to libsodium used perform all cryptographic actions.
- [libsodium](https://download.libsodium.org/doc): docs for the libsodium library.

## License

[MIT](https://tldrlegal.com/license/mit-license)

[npm-img]: https://img.shields.io/npm/v/sodium-cli.svg
[npm]: https://npmjs.org/package/sodium-cli
[travis-img]: https://travis-ci.com/bcomnes/sodium-cli.svg?token=MHQzYeFDHxgr3Y1iiUoN&branch=master
[travis]: https://travis-ci.com/bcomnes/sodium-cli
