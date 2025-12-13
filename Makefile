# Detect platform
UNAME := $(shell uname -s)

# macos with llvm from homebrew
ifeq ($(UNAME),Darwin)
    CLANG = /opt/homebrew/opt/llvm/bin/clang
    SED_INPLACE = sed -i ''
    BASE64 = base64 -i uncompress.wasm -o uncompress.wasm.base64
    BASE64_COMP = base64 -i compress.wasm -o compress.wasm.base64
else
    CLANG = clang
    SED_INPLACE = sed -i
    BASE64 = base64 -w 0 uncompress.wasm > uncompress.wasm.base64
    BASE64_COMP = base64 -w 0 compress.wasm > compress.wasm.base64
endif

uncompress.wasm.base64: uncompress.wasm
	$(BASE64)
	$(SED_INPLACE) 's|const wasm64 = .*|const wasm64 = '"'`cat uncompress.wasm.base64`'"'|' js/uncompress.js

uncompress.wasm: c/uncompress.c
	$(CLANG) --target=wasm32 \
		-O3 \
		-nostdlib \
		-Wl,--export-all \
		-Wl,--no-entry \
		-o uncompress.wasm c/uncompress.c

compress.wasm.base64: compress.wasm
	$(BASE64_COMP)
	$(SED_INPLACE) 's|const wasm64 = .*|const wasm64 = '"'`cat compress.wasm.base64`'"'|' js/compress.js

compress.wasm: c/compress.c
	$(CLANG) --target=wasm32 \
		-O3 \
		-nostdlib \
		-Wl,--export-all \
		-Wl,--no-entry \
		-o compress.wasm c/compress.c

main: c/main.c c/uncompress.c
	$(CLANG) -g -o main c/main.c c/uncompress.c

bench: compress.wasm.base64 uncompress.wasm.base64
	node benchmark.js

clean:
	rm -f main uncompress.wasm uncompress.wasm.base64 compress.wasm compress.wasm.base64
