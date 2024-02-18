import fs from 'fs/promises'

/**
 * Uncompress a snappy compressed buffer.
 *
 * @param {Uint8Array} input
 * @param {Uint8Array} output
 */
export async function snappyUncompress(input, output) {
  // Read the WASM file
  const wasmBuffer = await fs.readFile('./snappy.wasm')

  // Load the WASM module
  const snappyModule = await WebAssembly.instantiate(new Uint8Array(wasmBuffer), {})
  const { memory, uncompress } = snappyModule.instance.exports

  // WASM memory
  if (memory.buffer.byteLength < input.byteLength + output.byteLength) {
    // TODO: memory.grow(pagesToGrow)
    throw new Error('memory buffer is too small')
  }

  // Copy the compressed data to WASM memory
  const buffer = new Uint8Array(memory.buffer)
  buffer.set(input)

  // Call wasm uncompress function
  const result = uncompress(0, input.byteLength, input.byteLength)
  if (result !== 0) throw new Error(`failed to uncompress data ${result}`)

  // Get uncompressed data from WASM memory
  const uncompressed = buffer.slice(input.byteLength, input.byteLength + output.byteLength)

  // Copy the uncompressed data to the output buffer
  // TODO: Return WASM memory buffer instead of copying?
  output.set(uncompressed)
}
