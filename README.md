# HySnappy

![hysnappy penguin](hysnappy.jpg)

[![npm](https://img.shields.io/npm/v/hysnappy)](https://www.npmjs.com/package/hysnappy)
[![workflow status](https://github.com/hyparam/hysnappy/actions/workflows/ci.yml/badge.svg)](https://github.com/hyparam/hysnappy/actions)
[![mit license](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![dependencies](https://img.shields.io/badge/Dependencies-0-blueviolet)](https://www.npmjs.com/package/hysnappy?activeTab=dependencies)

Snappy decompression with WebAssembly.

A fast, minimal snappy decompression implementation in C built for WASM.

Snappy compression was released by Google in 2011 with the goal of very high speeds and reasonable compression.
Snappy is used in various applications.
For example, snappy is the default compression format for [Apache Parquet](https://parquet.apache.org) files.

## Usage

The `snappyUncompress` function expects as arguments: a typed array `compressed`, and an `outputLength` parameter.
The length is needed to know how much wasm memory to allocate.
For formats like parquet, this length will generally be known in advance.
To decompress a `Uint8Array` with known output length:

```js
import { snappyUncompress } from 'hysnappy'

const compressed = new Uint8Array([
  0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d
])
const outputLength = 10
const output = snappyUncompress(compressed, outputLength)
```

## Hyparquet

Hysnappy was built specifically to accelerate the the [hyparquet](https://github.com/hyparam/hyparquet) parquet parsing library.

Hysnappy exports a loader function `snappyUncompressor()` which loads the WASM module once, and returns a pre-loaded version of `snappyUncompress` function.

To use hysnappy with hyparquet:

```js
import { parquetRead } from 'hyparquet'
import { snappyUncompressor } from 'hysnappy'

parquetRead({ file, compressors: {
  SNAPPY: snappyUncompressor(),
}})
```

## Development

The build uses clang _without_ emscripten, in order to produce the smallest possible binary.

Run `make` to build from source. The build process consists of:

1. Compile from `snappy.c` to `hysnappy.wasm` using `clang`.
2. Encode `hysnappy.wasm` as base64 to `hysnappy.wasm.base64`.
3. Insert base64 string into `hysnappy.js` for distribution.

## WASM Loading

By keeping `hysnappy.wasm` under 4kb, we can include it directly in the `hysnappy.js` file and load the WASM blob synchronously, which is faster than loading a separate `.wasm` file. [[web.dev]](https://web.dev/articles/loading-wasm)

## References

 - https://en.wikipedia.org/wiki/Snappy_(compression)
 - https://github.com/andikleen/snappy-c
 - https://github.com/google/snappy
 - https://github.com/zhipeng-jia/snappyjs
 - https://web.dev/articles/loading-wasm
