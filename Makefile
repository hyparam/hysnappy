# Detect platform
UNAME := $(shell uname -s)

# macos with llvm from homebrew
ifeq ($(UNAME),Darwin)
    CLANG = /opt/homebrew/opt/llvm/bin/clang
    SED_INPLACE = sed -i ''
    BASE64 = base64 -i uncompress.wasm -o uncompress.wasm.base64
else
    CLANG = clang
    SED_INPLACE = sed -i
    BASE64 = base64 -w 0 uncompress.wasm > uncompress.wasm.base64
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

main: c/main.c c/uncompress.c
	$(CLANG) -g -o main c/main.c c/uncompress.c

clean:
	rm -f main uncompress.wasm uncompress.wasm.base64
