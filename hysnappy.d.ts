/**
 * Uncompress a snappy compressed buffer.
 *
 * @param {Uint8Array} input
 * @param {Uint8Array} output
 */
export async function snappyUncompress(input: Uint8Array, outputLength: number): Uint8Array

/**
 * Load wasm and return uncompressor function.
 */
export function snappyUncompressor(): (input: Uint8Array, output: number) => Uint8Array
