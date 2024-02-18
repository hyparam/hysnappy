
snappy.js: snappy.c wasm.c
	emcc -O2 \
		-s WASM=1 \
		-s EXPORTED_FUNCTIONS="['_wasm_snappy_uncompress']" \
		-s EXPORTED_RUNTIME_METHODS="[]" \
		snappy.c wasm.c -o snappy.js

clean:
	rm -f snappy.js snappy.wasm
