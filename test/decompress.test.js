import { describe, expect, it } from 'vitest'
import { snappyUncompress } from '../hysnappy.js'

describe('snappy uncompress', () => {
  it('decompresses a compressed string correctly', async () => {
    const compressed = new Uint8Array([
      0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d,
    ])
    const output = new Uint8Array(10)
    const expected = 'hyperparam'

    // Call wasm snappy uncompress function
    await snappyUncompress(compressed, output)
    const result = new TextDecoder().decode(output)

    // Assert the uncompressed data is as expected
    expect(result).toBe(expected)
  })

  it('decompresses an empty string correctly', async () => {
    const compressed = new Uint8Array([0x00])
    const output = new Uint8Array(0)
    const expected = ''

    // Call wasm snappy uncompress function
    await snappyUncompress(compressed, output)
    const result = new TextDecoder().decode(output)

    // Assert the uncompressed data is as expected
    expect(result).toBe(expected)
  })
})
