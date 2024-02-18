
snappy.js: snappy.c wasm.c
	clang --target=wasm32 \
		-nostdlib \
		-Wl,--export-all \
		-Wl,--no-entry \
		-o snappy.wasm snappy.c

main: main.c snappy.c
	clang -o main main.c snappy.c

clean:
	rm -f snappy.js snappy.wasm
