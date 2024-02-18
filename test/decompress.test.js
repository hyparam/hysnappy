import { describe, it, expect } from 'vitest'
import { snappyUncompress } from '../snappy.js'

describe('snappy uncompress', () => {
  it('decompresses a compressed string correctly', async () => {
    const compressed = new Uint8Array([
      0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d
    ])
    const output = new Uint8Array(10)
    const expected = 'hyperparam'

    // Call wasm snappy uncompress function
    await snappyUncompress(compressed, output)

    // Convert the result from WASM memory to a JavaScript string or suitable format for comparison
    const uncompressedResult = new TextDecoder().decode(output)

    // Assert the uncompressed data is as expected
    expect(uncompressedResult).toBe(expected)
  })
})
