/**
 * Compress data using snappy compression.
 *
 * @param {Uint8Array} input
 */
export function snappyCompress(input: Uint8Array): Uint8Array

/**
 * Load wasm and return compressor function.
 */
export function snappyCompressor(): (input: Uint8Array) => Uint8Array
