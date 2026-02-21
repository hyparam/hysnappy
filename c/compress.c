#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

void *memcpy(void *dest, const void *src, size_t n) {
    char *d = dest;
    const char *s = src;
    while (n--) {
        *d++ = *s++;
    }
    return dest;
}

/* Unaligned load macros for fast comparison */
#define LOAD32(p) ({ uint32_t _v; memcpy(&_v, (p), 4); _v; })
#define LOAD64(p) ({ uint64_t _v; memcpy(&_v, (p), 8); _v; })

/* Larger hash table for fewer collisions = faster lookups */
#define HASH_BITS 14
#define HASH_SIZE (1 << HASH_BITS)

/* Fast hash using multiply-shift - better distribution */
static inline uint32_t hash(const unsigned char *ptr) {
	return (LOAD32(ptr) * 0x1e35a7bd) >> (32 - HASH_BITS);
}

/* Write varint to output, return bytes written */
static inline int write_varint(unsigned char *op, uint32_t val) {
	unsigned char *start = op;
	while (val >= 0x80) {
		*op++ = (val & 0x7f) | 0x80;
		val >>= 7;
	}
	*op++ = val;
	return op - start;
}

/* Emit literal bytes, return bytes written */
static int emit_literal(unsigned char *op, const unsigned char *literal, uint32_t len) {
	unsigned char *start = op;
	if (len <= 60) {
		*op++ = ((len - 1) << 2);
	} else if (len < 256) {
		*op++ = (60 << 2);
		*op++ = len - 1;
	} else if (len <= 65536) {
		*op++ = (61 << 2);
		*op++ = (len - 1) & 0xff;
		*op++ = ((len - 1) >> 8) & 0xff;
	} else if (len <= 16777216) {
		*op++ = (62 << 2);
		*op++ = (len - 1) & 0xff;
		*op++ = ((len - 1) >> 8) & 0xff;
		*op++ = ((len - 1) >> 16) & 0xff;
	} else {
		*op++ = (63 << 2);
		*op++ = (len - 1) & 0xff;
		*op++ = ((len - 1) >> 8) & 0xff;
		*op++ = ((len - 1) >> 16) & 0xff;
		*op++ = ((len - 1) >> 24) & 0xff;
	}
	memcpy(op, literal, len);
	return (op - start) + len;
}

/* Emit copy operation, return bytes written */
static inline int emit_copy(unsigned char *op, uint32_t offset, uint32_t len) {
	unsigned char *start = op;

	/* Emit copies in chunks of max 64 bytes for COPY_2, 11 for COPY_1 */
	while (len > 0) {
		if (offset < 2048 && len >= 4 && len < 12) {
			/* COPY_1: 2 bytes, offset 0-2047, len 4-11 */
			*op++ = ((len - 4) << 2) | ((offset >> 8) << 5) | 0x01;
			*op++ = offset & 0xff;
			return op - start;
		} else {
			/* COPY_2: 3 bytes, offset 0-65535, len 1-64 */
			uint32_t copy_len = len > 64 ? 64 : len;
			*op++ = ((copy_len - 1) << 2) | 0x02;
			*op++ = offset & 0xff;
			*op++ = (offset >> 8) & 0xff;
			len -= copy_len;
		}
	}

	return op - start;
}

/* Find match length using 8-byte chunks */
static inline uint32_t find_match_length(const unsigned char *s1, const unsigned char *s2,
                                          const unsigned char *s2_end) {
	const unsigned char *s2_start = s2;

	/* Compare 8 bytes at a time */
	while (s2 + 8 <= s2_end) {
		uint64_t a = LOAD64(s1);
		uint64_t b = LOAD64(s2);
		if (a != b) {
			/* Find first differing byte using XOR and count trailing zeros */
			uint64_t diff = a ^ b;
			/* Count trailing zero bytes (little-endian) */
			uint32_t matching = __builtin_ctzll(diff) >> 3;
			return (s2 - s2_start) + matching;
		}
		s1 += 8;
		s2 += 8;
	}

	/* Handle remaining bytes */
	while (s2 < s2_end && *s1 == *s2) {
		s1++;
		s2++;
	}

	return s2 - s2_start;
}

/**
 * Compress data using Snappy algorithm.
 * Returns the compressed size, or negative on error.
 *
 * Note: output buffer must be at least input_length + input_length/6 + 32 bytes.
 */
int compress(const char *input, size_t input_length, char *output) {
	const unsigned char *ip = (const unsigned char *)input;
	const unsigned char *ip_end = ip + input_length;
	unsigned char *op = (unsigned char *)output;

	/* Hash table: stores offset of last occurrence */
	static uint32_t table[HASH_SIZE];

	/* Write uncompressed length as varint */
	op += write_varint(op, input_length);

	/* Handle empty input */
	if (input_length == 0) {
		return op - (unsigned char *)output;
	}

	/* Handle very short input (< 4 bytes can't have matches) */
	if (input_length < 4) {
		op += emit_literal(op, ip, input_length);
		return op - (unsigned char *)output;
	}

	const unsigned char *lit_start = ip; /* Start of pending literal */
	const unsigned char *ip_limit = ip_end - 4; /* Last position we can hash */
	const unsigned char *base = ip;

	while (ip <= ip_limit) {
		uint32_t h = hash(ip);
		uint32_t candidate_offset = table[h];
		const unsigned char *candidate = base + candidate_offset;

		/* Update hash table with current position */
		table[h] = ip - base;

		/* Check for match using 32-bit comparison */
		uint32_t offset = ip - candidate;
		if (offset > 0 && offset < 65536 && candidate >= base &&
		    LOAD32(candidate) == LOAD32(ip)) {

			/* Found a match - emit pending literals first */
			if (ip > lit_start) {
				op += emit_literal(op, lit_start, ip - lit_start);
			}

			/* Find match length using fast 8-byte comparison */
			uint32_t match_len = 4 + find_match_length(candidate + 4, ip + 4, ip_end);

			/* Emit copy */
			op += emit_copy(op, offset, match_len);

			/* Skip matched bytes, updating hash table periodically for better compression */
			ip += match_len;

			/* Update hash for positions we skipped (improves compression) */
			if (match_len > 4 && ip <= ip_limit) {
				/* Hash a few positions within the match for future reference */
				table[hash(ip - 2)] = (ip - 2) - base;
			}

			/* Start new literal */
			lit_start = ip;
		} else {
			ip++;
		}
	}

	/* Emit any remaining literals */
	uint32_t remaining = ip_end - lit_start;
	if (remaining > 0) {
		op += emit_literal(op, lit_start, remaining);
	}

	return op - (unsigned char *)output;
}
