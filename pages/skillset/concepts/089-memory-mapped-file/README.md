# Memory-mapped file — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It implements a **`MappedFile`**: a
fixed-size file whose bytes are mapped straight into memory with
`FileChannel.map()`, so the program reads and writes them as an in-memory buffer.
`Main` writes a greeting and a counter through the map, reopens the file to show
the bytes persisted, and proves that two mappings of one file share memory.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/MappedFile.java` | Maps a file into memory; read/write ints and strings at byte offsets, then flush. |
| `src/main/java/com/example/concepts/Main.java` | Demo: write through the map, read it back from a new mapping, share it across two mappings. |
| `src/test/java/com/example/concepts/MappedFileTest.java` | Asserts random-access memory, persistence across remappings, and shared memory. |
| `src/test/java/com/example/concepts/DemoRunTest.java` | Runs `Main` so its output shows during the build. |
| `run.sh` | Runs `mvn test`. |
| `index.html` / `style.css` | The concept page. |

The `target/` build directory is git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # runs: mvn test
```

The **first** run downloads JUnit into your local `~/.m2` cache and needs
network access; afterwards it runs offline.

## Run it manually

```sh
mvn test
```

## Expected result

```
Greeting read back: hello, mmap
Counter read back: 41
Counter seen via other mapping: 42
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The first three lines come from `DemoRunTest` running `Main`: the file is read
and written as memory, the bytes persist into a fresh mapping, and a write
through one mapping is seen through another.)

## The idea

Normally a program reads a file by copying bytes out of it with `read()` and
writes by copying bytes back in with `write()` — each call crosses into the
kernel. A **memory-mapped file** removes the copying: `FileChannel.map()` asks
the OS to back a region of the process's address space with the file itself
(`mmap`). From then on the file's bytes *are* memory.

```java
FileChannel channel = FileChannel.open(path, CREATE, READ, WRITE);
MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, size);

buffer.putInt(64, 41);       // a plain memory write — no read()/write() syscall
int value = buffer.getInt(64);
```

Touching a byte whose page is not resident **faults it in** from disk on demand;
a modified page is **written back lazily** by the OS. Only the pages you actually
touch are ever loaded, so a huge file can be worked on without reading it all.

## Persistence and shared memory

Because the mapping is **shared**, writes through the buffer go to the file, and
every mapping of the same file refers to the **same physical pages**:

```java
try (MappedFile a = new MappedFile(path, 128);
     MappedFile b = new MappedFile(path, 128)) {
  a.putInt(0, 12345);
  b.getInt(0);   // == 12345 — seen through the other mapping with no disk I/O
}
```

`force()` (`msync`) flushes dirty pages to make the bytes durable on disk; until
then the OS decides when to write them.

## Why bother

- **Speed** — no per-call copy between kernel and user buffers, and the OS page
  cache is shared rather than duplicated. Databases, search indexes, and log
  stores map their files for this reason.
- **Large files, small memory** — only touched pages are loaded, so a file larger
  than RAM can be processed a page at a time via demand paging.
- **Shared memory / IPC** — two processes mapping the same file share those pages,
  the classic way to pass data between processes without copying.

The trade-off: mappings are page-aligned and fixed in size (growing the file
means remapping), I/O errors surface as `SIGBUS`/faults rather than checked
exceptions, and on the JVM the mapping is unmapped only when the buffer is
garbage-collected — there is no explicit unmap.

## Equivalents elsewhere

`MappedByteBuffer` (Java); `mmap` (C, Python); `memmap2` (Rust);
`MemoryMappedFile` (C#). All map a file's bytes into the address space so it can
be read and written as memory, backed by the OS's virtual-memory and paging
machinery.
