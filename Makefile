
snappy.js: snappy.c wasm.c
	clang --target=wasm32 \
		-nostdlib \
		-Wl,--export-all \
		-Wl,--no-entry \
		-o snappy.wasm snappy.c

clean:
	rm -f snappy.js snappy.wasm
