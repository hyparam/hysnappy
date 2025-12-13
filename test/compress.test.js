import fs from 'fs'
import { describe, expect, it } from 'vitest'
import { snappyCompress, snappyUncompress } from '../js/index.js'

describe('snappy compress', () => {

  const testCases = [
    { input: '', expected: new Uint8Array([0x00]) },
    { input: 'h', expected: new Uint8Array([0x01, 0x00, 0x68]) },
    { input: 'hy', expected: new Uint8Array([0x02, 0x04, 0x68, 0x79]) },
    { input: 'hyp' },
    { input: 'hyper' },
    { input: 'hyperparam' },
    { input: 'hyphyphyphyphyphyphyp' },
  ]

  testCases.forEach(({ input, expected }) => {
    it(`compress "${input}"`, () => {
      const inputBytes = new TextEncoder().encode(input)
      const compressed = snappyCompress(inputBytes)

      // Verify output is valid snappy format
      expect(compressed).toBeInstanceOf(Uint8Array)
      expect(compressed.length).toBeGreaterThan(0)

      // If expected output is provided, verify exact match
      if (expected) {
        expect(Array.from(compressed)).toEqual(Array.from(expected))
      }

      // Verify round-trip: compress then decompress should equal input
      const decompressed = snappyUncompress(compressed, inputBytes.length)
      const decompressedStr = new TextDecoder().decode(decompressed)
      expect(decompressedStr).toBe(input)
    })
  })

  it('compress binary data', () => {
    const input = new Uint8Array([
      1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0,
      3, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0,
      5, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0,
      7, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0,
      9, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0,
    ])
    const compressed = snappyCompress(input)

    // Should achieve compression on repetitive binary data
    expect(compressed.length).toBeLessThan(input.length)

    // Verify round-trip
    const decompressed = snappyUncompress(compressed, input.length)
    expect(Array.from(decompressed)).toEqual(Array.from(input))
  })

  it('compress jpg image', () => {
    const input = fs.readFileSync('hysnappy.jpg')
    const compressed = snappyCompress(input)

    // Verify output is valid
    expect(compressed).toBeInstanceOf(Uint8Array)
    expect(compressed.length).toBeGreaterThan(0)

    // Images typically don't compress well with Snappy (already compressed)
    // but verify round-trip works
    const decompressed = snappyUncompress(compressed, input.length)
    expect(Array.from(decompressed)).toEqual(Array.from(input))
  })

  it('compress large repetitive text', () => {
    const text = 'Lorem ipsum dolor sit amet, '.repeat(100)
    const input = new TextEncoder().encode(text)
    const compressed = snappyCompress(input)

    // Should achieve good compression on repetitive text
    expect(compressed.length).toBeLessThan(input.length)
    expect(compressed.length).toBeLessThan(input.length / 2) // At least 50% compression

    // Verify round-trip
    const decompressed = snappyUncompress(compressed, input.length)
    const decompressedStr = new TextDecoder().decode(decompressed)
    expect(decompressedStr).toBe(text)
  })

  it('compress JSON data', () => {
    const json = JSON.stringify({
      users: Array.from({ length: 50 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        active: i % 2 === 0,
      })),
    })
    const input = new TextEncoder().encode(json)
    const compressed = snappyCompress(input)

    // JSON should compress well due to repetitive structure
    expect(compressed.length).toBeLessThan(input.length)

    // Verify round-trip
    const decompressed = snappyUncompress(compressed, input.length)
    const decompressedStr = new TextDecoder().decode(decompressed)
    expect(decompressedStr).toBe(json)
  })

  it('compress empty input', () => {
    const input = new Uint8Array([])
    const compressed = snappyCompress(input)

    // Empty input should produce minimal output (just length header)
    expect(compressed.length).toBe(1)
    expect(compressed[0]).toBe(0x00)

    // Verify round-trip
    const decompressed = snappyUncompress(compressed, 0)
    expect(decompressed.length).toBe(0)
  })

  it('compress single byte', () => {
    const input = new Uint8Array([0x42])
    const compressed = snappyCompress(input)

    // Very short input cannot be compressed effectively
    expect(compressed.length).toBeGreaterThan(0)

    // Verify round-trip
    const decompressed = snappyUncompress(compressed, input.length)
    expect(Array.from(decompressed)).toEqual([0x42])
  })

  it('compress vs decompress existing test data', () => {
    // Use an existing compressed sample from decompress tests
    const originalCompressed = new Uint8Array([
      0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d,
    ])
    const decompressed = snappyUncompress(originalCompressed, 10)

    // Re-compress the decompressed data
    const recompressed = snappyCompress(decompressed)

    // The output should match the original (or be equally valid)
    const text = new TextDecoder().decode(decompressed)
    expect(text).toBe('hyperparam')

    // Verify re-compressed data can be decompressed back
    const redecoded = snappyUncompress(recompressed, 10)
    const redecodedText = new TextDecoder().decode(redecoded)
    expect(redecodedText).toBe('hyperparam')
  })

  it('compress handles maximum input efficiently', () => {
    // Test with a reasonably large input
    const size = 64 * 1024 // 64KB
    const input = new Uint8Array(size)

    // Fill with pattern that should compress well
    for (let i = 0; i < size; i++) {
      input[i] = i % 256
    }

    const compressed = snappyCompress(input)

    // Should achieve compression
    expect(compressed.length).toBeLessThan(input.length)

    // Verify round-trip
    const decompressed = snappyUncompress(compressed, input.length)
    expect(Array.from(decompressed)).toEqual(Array.from(input))
  })
})
