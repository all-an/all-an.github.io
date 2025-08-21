# Nim Terminal

## How to compile and run

1. First, make sure you have Nim installed
2. Copy the code from `../temp.nim` to `terminal.nim`
3. Compile to JavaScript:
   ```bash
   nim js -o:terminal.js terminal.nim
   ```
4. Open `../index.html` in your browser

The compiled JavaScript will be generated as `terminal.js` in this folder and will be loaded by the HTML file.