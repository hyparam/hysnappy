declare module 'snappyjs' {
  function uncompress(compressed: Uint8Array, maxLength?: number): Uint8Array
  function compress(uncompressed: Uint8Array): Uint8Array
}
