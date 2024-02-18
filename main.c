#include <stdio.h>

int snappy_uncompress(const char *compressed, size_t compressed_length, char *uncompressed, size_t uncompressed_length);

// Should print "hyperparam"
int main() {
	char compressed[] = {
		0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d
	};
	char uncompressed[100];
	int result = snappy_uncompress(compressed, 12, uncompressed, 10);
	for (int i = 0; i < 10; i++) {
		putchar(uncompressed[i]);
	}
	return result;
}
