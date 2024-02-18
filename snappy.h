#include <stddef.h>

int snappy_uncompress(
    const char *compressed,
    size_t compressed_length,
    char *uncompressed,
    size_t uncompressed_length
);
