#include <emscripten.h>
#include "snappy.h"

// Export snappy_uncompress to JavaScript
EMSCRIPTEN_KEEPALIVE
int wasm_snappy_uncompress(
    const char *compressed,
    size_t compressed_length,
    char *uncompressed,
    size_t uncompressed_length
) {
    // Assumes uncompressed is pre-allocated with enough space.
    return snappy_uncompress(
        compressed,
        compressed_length,
        uncompressed,
        uncompressed_length
    );
}
