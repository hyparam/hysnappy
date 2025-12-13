import { snappyCompressor } from './js/compress.js'
import { snappyUncompressor } from './js/uncompress.js'

// Generate synthetic LLM completion JSON
const completions = []
const sentences = [
  'The function processes the input data and returns a transformed result that can be used by downstream components in the pipeline for further analysis and visualization.',
  'First, we need to validate the parameters before proceeding with the operation to ensure that all required fields are present and conform to the expected schema definitions.',
  'This approach improves performance by caching intermediate computations in a hash table, allowing subsequent requests with similar parameters to bypass expensive recalculations entirely.',
  'The algorithm iterates through each element and applies the transformation using a map-reduce pattern that enables efficient parallel processing across multiple CPU cores when available.',
  'Error handling is implemented to gracefully manage unexpected conditions, including network timeouts, malformed responses, and resource exhaustion scenarios that may occur during execution.',
  'The response includes metadata about the processing time and token usage, which can be used for billing purposes, performance monitoring, and capacity planning in production environments.',
  'Consider using async operations for better throughput in production, especially when dealing with I/O-bound workloads such as database queries, API calls, and file system operations.',
  'The configuration supports multiple output formats including JSON and XML, with additional options for CSV export, Protocol Buffers serialization, and custom format handlers defined by plugins.',
]

// Create 50 completions with some repeated patterns
for (let i = 0; i < 50; i++) {
  const content = []
  // conversation length
  for (let j = 0; j < 20; j++) {
    content.push(sentences[(i + j) % sentences.length])
  }
  completions.push({
    id: `chatcmpl-${i.toString(36).padStart(6, '0')}`,
    object: 'chat.completion',
    created: 1700000000 + i,
    model: 'gpt-4-turbo',
    choices: [{
      index: 0,
      message: { role: 'assistant', content: content.join(' ') },
      finish_reason: 'stop',
    }],
    usage: { prompt_tokens: 150 + i, completion_tokens: 200 + i, total_tokens: 350 + i * 2 },
  })
}

const input = new TextEncoder().encode(JSON.stringify(completions))
console.log('Input:', (input.length / 1024).toFixed(1), 'KB')

// Create compressor and decompressor instances
const compress = snappyCompressor()
const uncompress = snappyUncompressor()

// Get compressed size
const compressed = compress(input)
console.log('Compressed:', (compressed.length / 1024).toFixed(1), 'KB (' + (compressed.length / input.length * 100).toFixed(1) + '%)')

// Benchmark compression
const compIters = 1000
const compStart = performance.now()
for (let i = 0; i < compIters; i++) compress(input)
const compTime = performance.now() - compStart
console.log('Compress:', (input.length * compIters / 1024 / 1024 / (compTime / 1000)).toFixed(0), 'MB/s')

// Benchmark decompression
const decIters = 1000
const decStart = performance.now()
for (let i = 0; i < decIters; i++) uncompress(compressed, input.length)
const decTime = performance.now() - decStart
console.log('Decompress:', (input.length * decIters / 1024 / 1024 / (decTime / 1000)).toFixed(0), 'MB/s')
