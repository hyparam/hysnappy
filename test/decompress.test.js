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

    // WASM memory
    const { memory } = snappyModule.instance.exports

    if (memory.buffer.byteLength < compressed.length + expected.length) {
      // TODO: memory.grow(pagesToGrow)
      throw new Error('Memory buffer is too small')
    }

    // Copy the compressed data to WASM memory
    const buffer = new Uint8Array(memory.buffer)
    buffer.set(compressed)

    // Call wasm snappy_uncompress function
    const result = snappy(0, compressed.length, compressed.length, expected.length)
    expect(result).toBe(0)

    // Get uncompressed data from WASM memory
    const uncompressed = buffer.slice(compressed.length, compressed.length + expected.length)

    // Convert the result from WASM memory to a JavaScript string or suitable format for comparison
    const uncompressedResult = new TextDecoder().decode(uncompressed)

    // Assert the uncompressed data is as expected
    expect(uncompressedResult).toBe(expected)
  })
})
