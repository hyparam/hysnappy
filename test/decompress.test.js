import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'

describe('snappy uncompress', () => {
  it('decompresses a compressed string correctly', async () => {
    // Read the WASM file
    const wasmPath = path.resolve(__dirname, '../snappy.wasm')
    const wasmBuffer = await fs.readFile(wasmPath)

    // Load the WASM module
    const snappyModule = await WebAssembly.instantiate(new Uint8Array(wasmBuffer), {})
    const snappy = snappyModule.instance.exports.snappy_uncompress

    const compressed = new Uint8Array([
      0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d
    ])
    const expected = 'hyperparam'

    const uncompressed = new Uint8Array(new ArrayBuffer(expected.length))

    // Call wasm snappy_uncompress function
    const result = snappy(compressed, compressed.length, uncompressed, uncompressed.length)
    expect(result).toBe(0)

    // Convert the result from WASM memory to a JavaScript string or suitable format for comparison
    const uncompressedResult = new TextDecoder().decode(uncompressed)

    // Assert the uncompressed data is as expected
    expect(uncompressedResult).toBe(expected)
  })
})
