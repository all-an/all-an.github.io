@echo off
cd all-an
wasm-pack build --target web
cd ..
echo Rust compiled to WebAssembly successfully!
