#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>

struct source {
	const char *ptr;
	size_t left;
};

struct writer {
	char *base;
	char *op;
	char *op_limit;
};

struct snappy_decompressor {
	struct source *input;	/* Underlying source of bytes to decompress */
	const char *ip;		/* Points to next buffered byte */
	const char *ip_limit;	/* Points just past buffered bytes */
	uint32_t peeked;		/* Bytes peeked from reader (need to skip) */
	bool eof;		/* Hit end of input without an error? */
	char scratch[5];	/* Temporary buffer for peekfast boundaries */
};

static void init_snappy_decompressor(struct snappy_decompressor *d, struct source *input) {
	d->input = input;
	d->ip = NULL;
	d->ip_limit = NULL;
	d->peeked = 0;
	d->eof = false;
}

/**
 * Uncompress a snappy compressed buffer. Return 0 on success.
 */
int snappy_uncompress(const char *compressed, size_t compressed_length, char *uncompressed, size_t uncompressed_length) {
	struct source input = {
		.ptr = compressed,
		.left = compressed_length
	};
	struct writer output = {
		.base = uncompressed,
		.op = uncompressed
	};
	uint32_t max_len = 0xffffffff;
	struct snappy_decompressor decompressor;

	init_snappy_decompressor(&decompressor, &input);

	/* Protect against possible DoS attack */
	if ((uint64_t) (uncompressed_length) > max_len)
		return -1;

	output.op_limit = output.op + uncompressed_length;

	/* Process the entire input */
	decompress_all_tags(&decompressor, output);

	exit_snappy_decompressor(&decompressor);
	if (decompressor.eof && writer_check_length(output))
		return 0;
	return -1;
}
