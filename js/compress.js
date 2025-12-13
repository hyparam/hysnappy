/**
 * Compress data using snappy compression.
 *
 * @param {Uint8Array} input
 * @returns {Uint8Array}
 */
export function snappyCompress(input) {
  return snappyCompressor()(input)
}

/**
 * Load wasm and return compressor function.
 *
 * @returns {(input: Uint8Array) => Uint8Array}
 */
export function snappyCompressor() {
  // Instantiate wasm module
  const wasm = instantiateWasm()

  return (input) => {
    /** @type {any} */
    const { memory, compress } = wasm.exports

    // Input data is passed into wasm memory at inputStart
    // Output data is expected to be written to wasm memory at outputStart
    // clang uses some wasm memory, so we need to skip past that
    const inputStart = 68000 // 68 kb
    // Leave space between input and output for safety
    const outputStart = inputStart + input.byteLength + 1000

    // WebAssembly memory
    // Compressed output can be at most input + input/6 + 32 bytes
    const maxCompressedSize = input.byteLength + Math.floor(input.byteLength / 6) + 32
    const totalSize = outputStart + maxCompressedSize
    if (memory.buffer.byteLength < totalSize) {
      // Calculate the number of pages needed, rounding up
      const pageSize = 64 * 1024 // 64KiB per page
      const currentPages = memory.buffer.byteLength / pageSize
      const requiredPages = Math.ceil(totalSize / pageSize)
      const pagesToGrow = requiredPages - currentPages
      memory.grow(pagesToGrow)
    }

    // Copy the input data to WASM memory
    const byteArray = new Uint8Array(memory.buffer)
    byteArray.set(input, inputStart)

    // Call wasm compress function
    const compressedSize = compress(inputStart, input.byteLength, outputStart)

    // Check for errors
    if (compressedSize < 0) {
      throw new Error(`failed to compress data ${compressedSize}`)
    }

    // Get compressed data from WASM memory
    return byteArray.slice(outputStart, outputStart + compressedSize)
  }
}

/**
 * Instantiate WASM module from a base64 string.
 *
 * @returns {WebAssembly.Instance}
 */
function instantiateWasm() {
  const binaryString = atob(wasm64)
  const byteArray = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i += 1) {
    byteArray[i] = binaryString.charCodeAt(i)
  }
  // only works for payload less than 4kb:
  const mod = new WebAssembly.Module(byteArray)
  return new WebAssembly.Instance(mod)
}

// Base64 encoded hysnappy.compress.wasm
const wasm64 = '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'
