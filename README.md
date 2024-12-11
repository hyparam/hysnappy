# HySnappy

![hysnappy penguin](hysnappy.jpg)

[![npm](https://img.shields.io/npm/v/hysnappy)](https://www.npmjs.com/package/hysnappy)
[![minzipped](https://img.shields.io/bundlephobia/minzip/hysnappy)](https://www.npmjs.com/package/hysnappy)
[![workflow status](https://github.com/hyparam/hysnappy/actions/workflows/ci.yml/badge.svg)](https://github.com/hyparam/hysnappy/actions)
[![mit license](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![dependencies](https://img.shields.io/badge/Dependencies-0-blueviolet)](https://www.npmjs.com/package/hysnappy?activeTab=dependencies)

**HySnappy** is a lightweight, high-performance Snappy decompression library compiled to WebAssembly. It provides:
- Very fast Snappy decompression suitable for web and Node.js environments.
- A minimal footprint with no external dependencies.
- Seamless integration with tools like [Hyparquet](https://github.com/hyparam/hyparquet).


The Snappy compression format, originally released by Google, is designed for high-speed and reasonable compression ratios. HySnappy leverages these strengths by providing a WebAssembly build that can be included directly in your JavaScript bundle for optimal performance.

## Usage

The `snappyUncompress` function requires arguments:
 - `compressed`: a `Uint8Array` with compressed data.
 - `outputLength`: the uncompressed size of the data.

The length is needed to know how much wasm memory to allocate.
For formats like parquet, this length will generally be known in advance.

To decompress a `Uint8Array` with known output length:

```javascript
const { snappyUncompress } = await import('hysnappy')

const compressed = new Uint8Array([
  0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d
])
const outputLength = 10
const output = snappyUncompress(compressed, outputLength) // hyperparam
```

## Hyparquet Integration

Hysnappy was built specifically to accelerate the the [hyparquet](https://github.com/hyparam/hyparquet) parquet parsing library.

Hysnappy exports a loader function `snappyUncompressor()` which loads the WASM module once, and returns a pre-loaded version of `snappyUncompress` function.

To use hysnappy with hyparquet:

```javascript
import { parquetQuery } from 'hyparquet'
import { snappyUncompressor } from 'hysnappy'

await parquetQuery({
  file,
  compressors: {
    SNAPPY: snappyUncompressor(),
  },
})
```

Alternatively, check out [hyparquet-compressors](https://github.com/hyparam/hyparquet-compressors) which includes hysnappy decompression.

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
