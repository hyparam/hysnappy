
hysnappy.wasm: snappy.c wasm.c
	clang --target=wasm32 \
		-nostdlib \
		-Wl,--export-all \
		-Wl,--no-entry \
		-o hysnappy.wasm snappy.c

main: main.c snappy.c
	clang -o main main.c snappy.c

clean:
	rm -f main hysnappy.wasm
