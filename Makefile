
hyspappy.wasm.base64: hysnappy.wasm
	base64 -w 0 hysnappy.wasm > hysnappy.wasm.base64
	sed -i 's|const wasm64 = .*|const wasm64 = '"'`cat hysnappy.wasm.base64`'"'|' hysnappy.js

hysnappy.wasm: snappy.c wasm.c
	clang --target=wasm32 \
		-nostdlib \
		-Wl,--export-all \
		-Wl,--no-entry \
		-o hysnappy.wasm snappy.c

main: main.c snappy.c
	clang -o main main.c snappy.c

clean:
	rm -f main hysnappy.wasm hysnappy.wasm.base64
