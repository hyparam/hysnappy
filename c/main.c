#include <stdio.h>

int uncompress(const char *compressed, size_t compressed_length, char *uncompressed);

// Should print "hyperparam", this is just for testing, not a real cli tool
int main() {
	char compressed[] = {
		0x0a, 0x24, 0x68, 0x79, 0x70, 0x65, 0x72, 0x70, 0x61, 0x72, 0x61, 0x6d
	};
	char uncompressed[100];
	int result = uncompress(compressed, 12, uncompressed);
	for (int i = 0; i < 10; i++) {
		putchar(uncompressed[i]);
	}
    putchar('\n');
	return result;
}
