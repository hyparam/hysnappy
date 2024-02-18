import { describe, it, expect } from 'vitest'
import snappy from '../snappy.js'

describe('snappy uncompress', () => {
  it('decompresses a compressed string correctly', async () => {
    const compressed = '...compressed data...'
    const uncompressedExpected = '...original data...'

    const uncompressed = new Uint8Array(new ArrayBuffer(uncompressedExpected.length))

    // Call wasm snappy_uncompress function
    const result = snappy(compressed, compressed.length, uncompressed, uncompressed.length)
    expect(result).toBe(0)

    // Convert the result from WASM memory to a JavaScript string or suitable format for comparison
    const uncompressedResult = new TextDecoder().decode(uncompressed)

    // Assert the uncompressed data is as expected
    expect(uncompressedResult).toBe(uncompressedExpected)
  })
})
