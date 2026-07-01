package com.example.concepts;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.nio.file.StandardOpenOption.CREATE;
import static java.nio.file.StandardOpenOption.READ;
import static java.nio.file.StandardOpenOption.WRITE;

import java.io.IOException;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Path;

// A fixed-size file whose bytes are mapped straight into the process's address
// space, so the program reads and writes them as an in-memory buffer instead of
// issuing read()/write() syscalls. FileChannel.map() asks the OS to back a region
// of memory with the file itself (mmap): touching a byte whose page is not yet
// resident faults it in from disk on demand, and a modified ("dirty") page is
// written back lazily by the OS. Because the mapping is SHARED, every mapping of
// the same file refers to the same physical pages — so two mappings act as shared
// memory, and edits made through the buffer survive as the file on disk.
public final class MappedFile implements AutoCloseable {

  // The open file. The mapping outlives individual reads and writes; we keep the
  // channel to own the file's lifetime and close it when the mapping is done.
  private final FileChannel channel;

  // The file's bytes exposed as memory, indexed by byte offset. A get/put on this
  // is an ordinary memory access that the OS turns into paging when it must.
  private final MappedByteBuffer buffer;

  // Open (creating it if absent) the file at `path` and map its first `size`
  // bytes read/write. Mapping a region larger than the file grows the file to fit.
  public MappedFile(Path path, int size) throws IOException {
    channel = FileChannel.open(path, CREATE, READ, WRITE);
    buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, size);
  }

  // Store a 4-byte int at byte `offset`. This is a plain memory write into the
  // mapped pages — no syscall — that the OS flushes to the file on its own schedule.
  public void putInt(int offset, int value) {
    buffer.putInt(offset, value);
  }

  // Read the 4-byte int at byte `offset`, faulting its page in from disk if the
  // OS has not already loaded it.
  public int getInt(int offset) {
    return buffer.getInt(offset);
  }

  // Store `text` as UTF-8 at byte `offset`, length-prefixed with a 4-byte header
  // so it can be read back later without knowing the length in advance.
  public void putString(int offset, String text) {
    byte[] bytes = text.getBytes(UTF_8);
    buffer.putInt(offset, bytes.length);      // 4-byte length header first
    for (int i = 0; i < bytes.length; i++) {
      buffer.put(offset + 4 + i, bytes[i]);   // then the string's bytes
    }
  }

  // Read a length-prefixed UTF-8 string previously written at byte `offset`.
  public String getString(int offset) {
    int length = buffer.getInt(offset);       // the 4-byte length header
    byte[] bytes = new byte[length];
    for (int i = 0; i < length; i++) {
      bytes[i] = buffer.get(offset + 4 + i);
    }
    return new String(bytes, UTF_8);
  }

  // Force any dirty mapped pages out to the physical file now, rather than waiting
  // for the OS to flush them — needed to guarantee the bytes are durable on disk.
  public void flush() {
    buffer.force();
  }

  // Close the underlying channel. The mapping itself is released by the garbage
  // collector once the buffer is unreachable — Java exposes no explicit unmap.
  @Override
  public void close() throws IOException {
    channel.close();
  }
}
