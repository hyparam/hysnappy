# HySnappy

![hysnappy penguin](hysnappy.jpg)

[![npm](https://img.shields.io/npm/v/hysnappy)](https://www.npmjs.com/package/hysnappy)
[![workflow status](https://github.com/hyparam/hysnappy/actions/workflows/ci.yml/badge.svg)](https://github.com/hyparam/hysnappy/actions)
[![mit license](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![dependencies](https://img.shields.io/badge/Dependencies-0-blueviolet)](https://www.npmjs.com/package/hysnappy?activeTab=dependencies)

Snappy decompression with WebAssembly.

A fast, minimal snappy decompression implementation built for WASM.

## Usage

```js
import { snappyUncompress } from 'hysnappy'

const compressed = new Uint8Array([
  0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d
])
const outputLength = 10
const output = snappyUncompress(compressed, outputLength)
```

## Development

Run `make` to build from source.

Compiles from `snappy.c` to `hysnappy.wasm` using `clang`.
Then encodes `hysnappy.wasm` as base64 to `hysnappy.wasm.base64`, and inserts the base64 string into `hysnappy.js` for distribution.

## References

 - https://en.wikipedia.org/wiki/Snappy_(compression)
 - https://github.com/andikleen/snappy-c
 - https://github.com/google/snappy
 - https://github.com/zhipeng-jia/snappyjs
