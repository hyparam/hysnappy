
import { compress } from 'snappyjs'
import { snappyUncompress as uncompressWasm } from './hysnappy.js'

const fileSize = 200_000_000

const compressed = time(`generate and compress ${fileSize.toLocaleString()}`, () => {
  // Generate input array with random data
  const input = new Uint8Array(fileSize)
  for (let i = 0; i < fileSize; i++) {
    input[i] = Math.floor(Math.random() * 16)
  }
  return compress(input)
})
console.log(`compressed ${fileSize.toLocaleString()} bytes to ${compressed.length.toLocaleString()} bytes`)

const output = new Uint8Array(fileSize)

timeWithStdDev('uncompress wasm', () => uncompressWasm(compressed, output))

// time('uncompress snappyjs', () => uncompress(compressed, output))

/**
 * @param {string} name
 * @param {() => any} fn
 * @returns {any}
 */
function time(name, fn) {
  const start = performance.now()
  const output = fn()
  const ms = performance.now() - start
  console.log(`${name} took ${ms} ms`)
  return output
}

/**
 * @param {string} name
 * @param {() => void} fn
 * @param {number} iterations
 */
function timeWithStdDev(name, fn, iterations = 20) {
  const times = []
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    fn()
    const ms = performance.now() - start
    times.push(ms)
  }
  const mean = times.reduce((a, b) => a + b, 0) / times.length
  const variance = times.reduce((a, b) => a + (b - mean) ** 2, 0) / times.length
  const stdDev = Math.sqrt(variance)
  console.log(`${name} took ${mean} ms ± ${stdDev} ms`)
}
